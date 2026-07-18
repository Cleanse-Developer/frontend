"use client";
import "./checkout.css";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { useLenis } from "lenis/react";
import { useAuth } from "@/context/AuthContext";
import { authApi, couponApi, specialCouponApi, orderApi, paymentApi, checkoutApi, addressApi, shippingApi, loyaltyApi } from "@/lib/endpoints";
import { useToast } from "@/context/ToastContext";
import { loadRazorpay } from "@/lib/razorpay";
import { validateField, validateShippingForm, validateBillingForm, validatePhone } from "@/lib/validation";
import { COUNTRIES, statesForCountry, citiesForState, isIndia, dialForCountry, postalLabel, postalExample } from "@/lib/countries";
import { saveCheckoutData, loadCheckoutData, clearCheckoutData } from "@/lib/checkoutStorage";
import { getAttributionPayload, getStoredCoupon } from "@/lib/affiliate";
import { loadMsg91, sendOtpViaWidget, verifyOtpViaWidget, retryOtpViaWidget, extractWidgetToken } from "@/lib/msg91";
import CouponModal from "./CouponModal";
import ShippingChargesInfo from "@/ui/commerce/ShippingChargesInfo";
import { formatPrice } from "@/lib/formatters";

// Map a backend coupon-rejection reason to a friendly modal title.
function couponErrorTitle(message) {
  const m = (message || "").toLowerCase();
  if (m.includes("expired") || m.includes("no longer active") || m.includes("not yet valid"))
    return "This coupon isn't available";
  if (m.includes("minimum order")) return "Almost there";
  if (m.includes("usage limit") || m.includes("already used"))
    return "Coupon limit reached";
  if (m.includes("first order")) return "First orders only";
  if (m.includes("does not apply")) return "Not valid for these items";
  return "Invalid coupon code";
}

// Build a friendly modal body. For min-order rejections, tell the user exactly how
// much more to add to unlock the coupon they typed.
function couponErrorMessage(message, code, subtotal) {
  const m = (message || "").toLowerCase();
  const upper = (code || "").trim().toUpperCase();
  if (m.includes("minimum order")) {
    const match = (message || "").match(/[\d,]+(?:\.\d+)?/);
    const min = match ? Number(match[0].replace(/,/g, "")) : null;
    if (min != null) {
      const remaining = Math.max(0, Math.round(min - (subtotal || 0)));
      const codePart = upper ? ` to unlock ${upper}` : "";
      return `Add ₹${remaining} more${codePart}, it needs a minimum order of ₹${min}.`;
    }
  }
  return message || "This code isn't valid for your order.";
}


// Dial-code options for the phone field, derived from the full country list so
// every selectable country has a matching code. Deduped by dial (e.g. US/CA
// share +1), India first, then ascending by numeric code.
const PHONE_CODES_LIST = (() => {
  const seen = new Set();
  const list = [];
  for (const c of COUNTRIES) {
    if (seen.has(c.dial)) continue;
    seen.add(c.dial);
    list.push({ code: c.dial, label: `${c.code} ${c.dial}` });
  }
  return list.sort((a, b) => {
    if (a.code === "+91") return -1;
    if (b.code === "+91") return 1;
    return Number(a.code.slice(1)) - Number(b.code.slice(1));
  });
})();
const PHONE_CODES = PHONE_CODES_LIST.map((c) => c.code);

// Split a full phone (e.g. "+919876543210") into { code, local }
function splitPhone(phone) {
  if (!phone) return { code: "+91", local: "" };
  const cleaned = phone.replace(/[\s\-]/g, "");
  // Try matching known codes (longest first)
  const sorted = [...PHONE_CODES].sort((a, b) => b.length - a.length);
  for (const code of sorted) {
    if (cleaned.startsWith(code)) {
      return { code, local: cleaned.slice(code.length) };
    }
  }
  // Try with just "+" prefix stripped
  if (cleaned.startsWith("+")) {
    return { code: "+91", local: cleaned.replace(/^\+\d{1,3}/, "") };
  }
  // Try stripping leading "91" if result is 10 digits
  if (/^91\d{10}$/.test(cleaned)) {
    return { code: "+91", local: cleaned.slice(2) };
  }
  return { code: "+91", local: cleaned };
}

// crypto.randomUUID() is undefined on iOS Safari < 15.4 and in any non-secure
// context / in-app webview — calling it there throws and crashes the checkout
// mount for those users. This resolves to a valid RFC-4122 v4 UUID everywhere:
// native API when present, else getRandomValues, else Math.random.
function safeUUID() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // fall through to the manual generator
  }
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  // Set the version (4) and variant (10xx) bits per RFC 4122.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
  return (
    hex.slice(0, 4).join("") +
    "-" +
    hex.slice(4, 6).join("") +
    "-" +
    hex.slice(6, 8).join("") +
    "-" +
    hex.slice(8, 10).join("") +
    "-" +
    hex.slice(10, 16).join("")
  );
}

export default function CheckoutPage() {
  const { cartItems, cartCount, subtotal, clearCart, serverPricing, fetchPricingPreview } = useCart();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, loginWithWidgetToken, linkPhone, linkEmail } = useAuth();
  const toast = useToast();

  // Razorpay checkout session state
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [stockErrors, setStockErrors] = useState([]);

  const resetCheckoutSession = useCallback(() => {
    setIdempotencyKey(crypto.randomUUID());
  }, []);

  // Step management
  const [activeStep, setActiveStep] = useState(1);
  // Guest gate: non-logged-in users first see only a phone + Login / Continue as
  // Guest. Choosing "guest" reveals the full contact + address form.
  const [guestMode, setGuestMode] = useState(false);
  const stepRef = useRef(1);
  const lenis = useLenis();
  // Land at the top of every checkout step. On mobile the next step was opening at
  // the footer because the page kept the previous step's scroll position.
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [activeStep, lenis]);
  // Scroll target: selecting a saved address (or "New Address") scrolls down to
  // the shipping form so the user sees it populate / can fill it in.
  const shippingFormRef = useRef(null);
  const scrollToShippingForm = () => {
    setTimeout(() => {
      shippingFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  // Sync browser back/forward with checkout steps
  useEffect(() => {
    // Push initial state
    window.history.replaceState({ checkoutStep: 1 }, "");

    const onPopState = (e) => {
      const step = e.state?.checkoutStep;
      if (step && step >= 1 && step <= 3) {
        setActiveStep(step);
        stepRef.current = step;
      } else if (stepRef.current > 1) {
        // No checkout state, user pressed back from step 1, let it navigate away
        // But if we were on step 2+, go back to previous step instead
        const prev = stepRef.current - 1;
        setActiveStep(prev);
        stepRef.current = prev;
        window.history.pushState({ checkoutStep: prev }, "");
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Shipping form
  const [shipping, setShipping] = useState({
    email: "",
    phone: "",
    phoneCode: "+91",
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // Payment form
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billing, setBilling] = useState({
    fullName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponDiscountType, setCouponDiscountType] = useState("percentage");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState(""); // detailed reason from backend
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [appliedSpecialCode, setAppliedSpecialCode] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  // On order confirmation, jump to the top so the "Order Confirmed" hero is in
  // view — the page was scrolled down at the Place Order button, so otherwise the
  // confirmation renders with the footer showing instead of the hero.
  useEffect(() => {
    if (!placedOrder) return;
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
  }, [placedOrder, lenis]);

  // Loyalty redemption state (only for authenticated users)
  const [loyaltyBalance, setLoyaltyBalance] = useState(0);
  const [loyaltyConfig, setLoyaltyConfig] = useState(null);
  const [loyaltyMaxRedeemable, setLoyaltyMaxRedeemable] = useState(0);
  const [loyaltyPointsInput, setLoyaltyPointsInput] = useState("");
  const [loyaltyApplied, setLoyaltyApplied] = useState(0);
  const [loyaltyError, setLoyaltyError] = useState("");

  // Validation state
  const [errors, setErrors] = useState({});

  // Guest phone verification (MSG91 widget OTP)
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Pincode check state
  const [pincodeStatus, setPincodeStatus] = useState(null); // null | "checking" | "available" | "unavailable"
  const [pincodeMessage, setPincodeMessage] = useState("");
  const pincodeTimeoutRef = useRef(null);

  // Saved addresses (for logged-in users)
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressesLoaded, setAddressesLoaded] = useState(false);

  // Track if we already restored checkout data
  const restoredRef = useRef(false);

  // ── Server pricing state ──
  const [checkoutPricing, setCheckoutPricing] = useState(null);

  // Per-method delivery-charge breakdown (prepaid vs COD) for the info tooltip.
  // Zone-aware once a valid pincode/state is entered.
  const [shippingBreakdown, setShippingBreakdown] = useState(null);
  useEffect(() => {
    const params = {};
    if (/^\d{6}$/.test(shipping.pincode)) params.pincode = shipping.pincode;
    if (shipping.state) params.state = shipping.state;
    shippingApi
      .getConfig(params)
      .then((cfg) => setShippingBreakdown(cfg))
      .catch(() => {});
  }, [shipping.pincode, shipping.state]);

  // Fetch server pricing on mount and when cart/coupon/loyalty changes
  useEffect(() => {
    if (cartItems.length === 0) {
      setCheckoutPricing(null);
      return;
    }
    const appliedCoupon = couponStatus === "valid" && !appliedSpecialCode ? couponCode.trim() : "";
    fetchPricingPreview(appliedCoupon, false, appliedSpecialCode || null, loyaltyApplied, {
      paymentMethod,
      pincode: shipping.pincode,
      state: shipping.state,
    })
      .then((pricing) => {
        setCheckoutPricing(pricing);
      })
      .catch(() => {});
  }, [cartItems, couponStatus, couponCode, appliedSpecialCode, loyaltyApplied, paymentMethod, shipping.pincode, shipping.state, fetchPricingPreview]);

  // Fetch loyalty balance + config when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLoyaltyBalance(0);
      setLoyaltyConfig(null);
      return;
    }
    loyaltyApi
      .getBalance()
      .then((data) => {
        setLoyaltyBalance(data.loyaltyPoints || 0);
        setLoyaltyConfig(data.config || null);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  // Re-compute max redeemable whenever subtotal/discounts change
  useEffect(() => {
    if (!isAuthenticated || !loyaltyConfig?.enabled) {
      setLoyaltyMaxRedeemable(0);
      return;
    }
    const subAfterDiscounts = pricingSourceForLoyaltyMax();
    if (subAfterDiscounts <= 0) {
      setLoyaltyMaxRedeemable(0);
      return;
    }
    loyaltyApi
      .getMaxRedeemable(subAfterDiscounts)
      .then((data) => {
        const newMax = data.maxPoints || 0;
        setLoyaltyMaxRedeemable(newMax);
        // If user already applied points but cart shrank below their applied
        // amount, clear the application and warn so they can re-apply or skip.
        if (loyaltyApplied > 0 && loyaltyApplied > newMax) {
          setLoyaltyApplied(0);
          setLoyaltyPointsInput("");
          setLoyaltyError(
            "Loyalty points removed: your cart no longer supports the previous redemption amount."
          );
        } else {
          // Clear any stale error from a prior failed apply
          if (loyaltyError) setLoyaltyError("");
        }
      })
      .catch((err) => {
        setLoyaltyMaxRedeemable(0);
        // Surface the error but don't block checkout
        toast?.error?.("Could not check loyalty availability. Try refreshing the page.");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, loyaltyConfig, checkoutPricing?.subtotal, checkoutPricing?.couponDiscount, checkoutPricing?.specialCouponDiscountTotal]);

  // Helper: subtotal-after-discounts used for max-redeemable calc
  function pricingSourceForLoyaltyMax() {
    const p = checkoutPricing || serverPricing;
    if (!p) return 0;
    return Math.max(
      0,
      (p.subtotal || 0) -
        (p.bundleDiscountTotal || 0) -
        (p.tierDiscount || 0) -
        (p.specialCouponDiscountTotal || 0) -
        (p.couponDiscount || 0)
    );
  }

  // Use server pricing (available for both guest and authenticated users)
  const pricingSource = checkoutPricing || serverPricing;
  const tierDiscount = pricingSource?.tierDiscount || 0;
  const bundleDiscountTotal = pricingSource?.bundleDiscountTotal || 0;
  const bundleDiscounts = pricingSource?.bundleDiscounts || [];
  const shippingCost = pricingSource?.shippingCost ?? (subtotal >= 1200 ? 0 : 99);
  const couponAmount = pricingSource?.couponDiscount || 0;
  const total = pricingSource?.total ?? subtotal;
  // Loyalty points earned on this purchase (backend-computed estimate)
  const loyaltyPointsEarned = Math.max(0, Math.floor(pricingSource?.loyaltyPoints || 0));

  // Full phone with country code (for backend/redirect). Strip any country code
  // already present in the local part (10-digit India) so we never double-prefix.
  const localPhoneDigits = (() => {
    const d = (shipping.phone || "").replace(/\D/g, "");
    // India numbers are 10 digits — trim any duplicated country code. Other
    // countries keep the full national number (E.164 allows up to 15 digits).
    if (isIndia(shipping.country)) return d.length > 10 ? d.slice(-10) : d;
    return d.slice(0, 15);
  })();
  const fullPhone = localPhoneDigits ? `${shipping.phoneCode}${localPhoneDigits}` : "";

  // Phone verification state. A phone is "verified" when it matches the logged-in
  // account's stored phone (e.g. phone-OTP users) OR the user just verified it via
  // the widget this session. Google/email-only users are authed but have no phone,
  // so they still need to verify — hence the button shows for them too.
  const accountPhone = (user?.phone || "").replace(/\D/g, "");
  const phoneMatchesAccount = isAuthenticated && !!accountPhone && localPhoneDigits === accountPhone;
  const phoneIsVerified = phoneVerified || phoneMatchesAccount;
  const needsPhoneVerify = !phoneIsVerified;

  // Build shippingInfo for backend (merges phone code into phone field).
  // Name + email are optional for guests: default name to "User" (backend
  // requires fullName) and omit email entirely when blank (backend's
  // optional().isEmail() would reject an empty string).
  const getShippingInfo = () => {
    const { phoneCode, ...rest } = shipping;
    // Send countryCode explicitly so the backend applies country-aware phone
    // validation (and doesn't default a non-India number to the India rule).
    const info = { ...rest, phone: fullPhone, countryCode: phoneCode };
    info.fullName = (info.fullName || "").trim() || "User";
    if (!info.email || !info.email.trim()) {
      delete info.email;
    }
    return info;
  };

  // ── Restore checkout data from localStorage ──
  useEffect(() => {
    if (restoredRef.current || authLoading) return;
    restoredRef.current = true;

    const saved = loadCheckoutData();
    if (!saved) return;

    // Restore address/payment fields from storage
    if (saved.shipping) {
      setShipping((prev) => {
        const restored = { ...prev, ...saved.shipping };
        // If authenticated, prefer DB profile for contact fields
        if (isAuthenticated && user) {
          if (user.email) restored.email = user.email;
          if (user.phone) {
            restored.phone = user.phone;
            restored.phoneCode = user.countryCode || restored.phoneCode || "+91";
          }
          if (user.fullName && user.fullName !== "User") restored.fullName = user.fullName;
        }
        return restored;
      });
    }
    if (saved.billing) setBilling(saved.billing);
    if (saved.billingSameAsShipping !== undefined) setBillingSameAsShipping(saved.billingSameAsShipping);
    if (saved.paymentMethod) setPaymentMethod(saved.paymentMethod);
    if (saved.couponCode) setCouponCode(saved.couponCode);
    if (saved.activeStep) setActiveStep(saved.activeStep);

    clearCheckoutData();

    // Returned from the login redirect with saved checkout — nudge to finish.
    if (isAuthenticated && user) {
      toast.info("You're logged in — review and place your order.");
    }
  }, [authLoading, isAuthenticated, user]);

  // ── Pre-fill for logged-in users ──
  useEffect(() => {
    if (!isAuthenticated || authLoading || !user) return;

    // Only pre-fill if form is still empty (not restored from storage)
    setShipping((prev) => {
      if (prev.email || prev.phone || prev.fullName) return prev;
      const code = user.countryCode || "+91";
      const local = user.phone || "";
      return {
        ...prev,
        email: user.email || "",
        phone: local,
        phoneCode: code,
        fullName: (user.fullName && user.fullName !== "User") ? user.fullName : "",
      };
    });

    // Fetch saved addresses
    if (!addressesLoaded) {
      addressApi.getAll()
        .then((data) => {
          const addrs = data.addresses || data || [];
          setSavedAddresses(addrs);
          setAddressesLoaded(true);

          // Pre-fill from default address if form is empty
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
          if (defaultAddr) {
            setShipping((prev) => {
              if (prev.address1) return prev; // already has address data
              // Contact fields come from the profile (not the address); the
              // address only supplies address fields + a fallback name.
              return {
                ...prev,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
                phoneCode: user.countryCode || prev.phoneCode || "+91",
                fullName: (user.fullName && user.fullName !== "User")
                  ? user.fullName
                  : (prev.fullName || defaultAddr.fullName || ""),
                address1: defaultAddr.address1 || "",
                address2: defaultAddr.address2 || "",
                city: defaultAddr.city || "",
                state: defaultAddr.state || "",
                pincode: defaultAddr.pincode || "",
                country: defaultAddr.country || "India",
              };
            });
            setSelectedAddressId(defaultAddr._id);
          }
        })
        .catch(() => {
          setAddressesLoaded(true);
        });
    }
  }, [isAuthenticated, authLoading, user, addressesLoaded]);

  // Cleanup pincode timeout on unmount
  useEffect(() => {
    return () => {
      if (pincodeTimeoutRef.current) clearTimeout(pincodeTimeoutRef.current);
    };
  }, []);

  // Serviceability (checkDelivery / Shiprocket) is India-only. A ref keeps the
  // current country available to the debounced checkPincode callback without
  // re-creating it on every keystroke.
  const countryRef = useRef(shipping.country);
  useEffect(() => {
    countryRef.current = shipping.country;
  }, [shipping.country]);

  // ── Pincode serviceability check (debounced) ──
  const checkPincode = useCallback((pincode) => {
    if (pincodeTimeoutRef.current) clearTimeout(pincodeTimeoutRef.current);

    // Non-India addresses have no Shiprocket serviceability gate — never block.
    if (!isIndia(countryRef.current) || !pincode || !/^\d{6}$/.test(pincode)) {
      setPincodeStatus(null);
      setPincodeMessage("");
      return;
    }

    setPincodeStatus("checking");
    setPincodeMessage("Checking delivery availability...");

    pincodeTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await shippingApi.checkDelivery(pincode);
        if (data.available) {
          setPincodeStatus("available");
          setPincodeMessage(data.message || `Delivery available! Est. ${data.estimatedDays} business days.`);
        } else {
          setPincodeStatus("unavailable");
          setPincodeMessage(data.message || "Delivery is not available to this pincode.");
        }
      } catch {
        setPincodeStatus("unavailable");
        setPincodeMessage("Could not check delivery. Please try again.");
      }
    }, 500);
  }, []);

  // Re-check pincode when it changes (covers restore from localStorage & address pre-fill)
  const prevPincodeRef = useRef("");
  useEffect(() => {
    if (shipping.pincode !== prevPincodeRef.current) {
      prevPincodeRef.current = shipping.pincode;
      if (isIndia(shipping.country) && /^\d{6}$/.test(shipping.pincode) && pincodeStatus === null) {
        checkPincode(shipping.pincode);
      }
    }
  }, [shipping.pincode, shipping.country, pincodeStatus, checkPincode]);

  // ── Handlers ──
  const handleShippingChange = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
    }
    // Pincode check
    if (field === "pincode") {
      checkPincode(value.trim());
    }
    // Deselect saved address when user edits
    if (selectedAddressId && ["address1", "address2", "city", "state", "pincode"].includes(field)) {
      setSelectedAddressId(null);
    }
    // Editing the phone invalidates a prior guest verification.
    if (field === "phone" || field === "phoneCode") {
      setPhoneVerified(false);
    }
  };

  const handleBillingChange = (field, value) => {
    setBilling((prev) => ({ ...prev, [field]: value }));
    const key = `billing_${field}`;
    if (errors[key]) {
      setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
    }
  };

  // Changing country resets the (now country-specific) state and, for shipping,
  // aligns the phone dial code and drops any stale serviceability status.
  const handleCountryChange = (value, isBilling = false) => {
    if (isBilling) {
      setBilling((prev) => ({ ...prev, country: value, state: "" }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.billing_state;
        delete next.billing_pincode;
        return next;
      });
      return;
    }
    setShipping((prev) => ({
      ...prev,
      country: value,
      state: "",
      phoneCode: dialForCountry(value),
    }));
    setPincodeStatus(null);
    setPincodeMessage("");
    setErrors((prev) => {
      const next = { ...prev };
      delete next.state;
      delete next.pincode;
      return next;
    });
  };

  const handleBlur = (field, value, isBilling = false) => {
    // Guests: email + full name are optional (format-checked only when filled).
    const optional = guestMode && (field === "email" || field === "fullName");
    const country = isBilling ? billing.country : shipping.country;
    const error = validateField(field, value, { optional, country });
    const key = isBilling ? `billing_${field}` : field;
    setErrors((prev) => {
      if (error) return { ...prev, [key]: error };
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    const code = addr.countryCode || user?.countryCode || "+91";
    const local = addr.phone || user?.phone || "";
    setShipping({
      email: user?.email || shipping.email,
      phone: local,
      phoneCode: code,
      fullName: addr.fullName || "",
      address1: addr.address1 || "",
      address2: addr.address2 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      country: addr.country || "India",
    });
    setErrors({});
    if (addr.pincode) checkPincode(addr.pincode);
    scrollToShippingForm();
  };

  const handleNewAddress = () => {
    setSelectedAddressId(null);
    scrollToShippingForm();
    const code = user?.countryCode || "+91";
    const local = user?.phone || "";
    setShipping({
      email: user?.email || "",
      phone: local,
      phoneCode: code,
      fullName: (user?.fullName && user.fullName !== "User") ? user.fullName : "",
      address1: "",
      address2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    });
    setPincodeStatus(null);
    setPincodeMessage("");
  };

  // ── Guest phone verification (MSG91 widget) ──
  const closeOtpModal = () => {
    setOtpModalOpen(false);
    setOtpError("");
  };

  const handleVerifyPhone = async () => {
    const phoneErr = validatePhone(shipping.phone, shipping.country);
    if (phoneErr) {
      setErrors((prev) => ({ ...prev, phone: phoneErr }));
      return;
    }
    setOtpSending(true);
    setOtpError("");
    try {
      const ok = await loadMsg91();
      if (!ok) {
        toast.error("Couldn't load the OTP service. Please try again.");
        return;
      }
      // Use the selected country's dial code (digits only), not a hardcoded 91,
      // so OTP works for international numbers. (MSG91 must be configured to
      // deliver to the target country for this to succeed at runtime.)
      await sendOtpViaWidget(`${shipping.phoneCode.replace(/\D/g, "")}${localPhoneDigits}`);
      setOtpValue("");
      setOtpModalOpen(true);
      toast.success("OTP sent to your mobile number");
    } catch (err) {
      toast.error((err && (err.message || err.type)) || "Couldn't send OTP. Please try again.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleResendGuestOtp = async () => {
    setOtpSending(true);
    setOtpError("");
    try {
      await retryOtpViaWidget("11"); // "11" = text SMS
      toast.success("OTP resent to your mobile number");
    } catch (err) {
      setOtpError((err && (err.message || err.type)) || "Couldn't resend OTP. Please try again.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleConfirmGuestOtp = async () => {
    if (!otpValue.trim()) {
      setOtpError("Please enter the OTP");
      return;
    }
    setOtpVerifying(true);
    setOtpError("");
    try {
      const data = await verifyOtpViaWidget(otpValue.trim());
      const token = extractWidgetToken(data);
      if (!token) {
        setOtpError("OTP verification failed. Please try again.");
        return;
      }
      if (isAuthenticated) {
        // Already logged in (e.g. via Google): attach this phone to the current
        // account. Backend rejects if the number belongs to a different account.
        await linkPhone(token, localPhoneDigits);
      } else {
        // Guest: verifying the phone IS the login — exchange the widget token for
        // an app session so they can place the order directly (no second OTP).
        await loginWithWidgetToken(token, localPhoneDigits);
      }
      setPhoneVerified(true);
      setOtpModalOpen(false);
      // Clear any prior phone error now that it's verified.
      setErrors((prev) => { const next = { ...prev }; delete next.phone; return next; });
      toast.success(isAuthenticated ? "Phone number verified" : "Phone verified — you're logged in");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        (err && (err.message || err.type)) ||
        "Invalid or expired OTP";
      setOtpError(msg);
    } finally {
      setOtpVerifying(false);
    }
  };

  // ── Step navigation with validation ──
  const goToStep = async (step) => {
    if (step === 2 && activeStep === 1) {
      // Validate shipping (guests: name + email optional). Keyed on guestMode so
      // it stays relaxed even after the phone-verify login flips isAuthenticated.
      const { isValid, errors: shippingErrors } = validateShippingForm(shipping, {
        requireContact: !guestMode,
      });
      if (!isValid) {
        setErrors(shippingErrors);
        return;
      }
      // Phone must be verified before continuing — covers guests AND logged-in
      // users without a phone on file (e.g. Google sign-ins).
      if (needsPhoneVerify) {
        setErrors((prev) => ({ ...prev, phone: "Please verify your phone number" }));
        return;
      }
      // If logged in and an email was provided that differs from the account's,
      // attach it now — collision-checked: rejects if it belongs to another account.
      if (isAuthenticated && shipping.email && shipping.email.trim()) {
        const emailLc = shipping.email.trim().toLowerCase();
        if (!user?.email || user.email.toLowerCase() !== emailLc) {
          try {
            await linkEmail(emailLc);
          } catch (err) {
            setErrors((prev) => ({
              ...prev,
              email:
                err?.response?.data?.message ||
                "This email is already linked to another account.",
            }));
            return;
          }
        }
      }
      // Serviceability gate is India-only (Shiprocket). International addresses
      // skip it — the address is accepted and the order proceeds.
      if (isIndia(shipping.country)) {
        if (pincodeStatus === "unavailable") {
          setErrors({ pincode: "Delivery is not available to this pincode" });
          return;
        }
        if (pincodeStatus === "checking") {
          setErrors({ pincode: "Please wait while we check delivery availability" });
          return;
        }
        if (pincodeStatus === null && /^\d{6}$/.test(shipping.pincode)) {
          // Pincode entered but check hasn't fired yet, trigger it and block
          checkPincode(shipping.pincode);
          setErrors({ pincode: "Please wait while we check delivery availability" });
          return;
        }
      }
    }
    if (step === 3 && activeStep === 2) {
      // Validate billing if different
      if (!billingSameAsShipping) {
        const { isValid, errors: billingErrors } = validateBillingForm(billing);
        if (!isValid) {
          setErrors((prev) => ({ ...prev, ...billingErrors }));
          return;
        }
      }
      // Note: UPI validation removed, UPI not yet available
    }
    setActiveStep(step);
    stepRef.current = step;
    // Push history state so browser back goes to previous step
    if (step > activeStep) {
      window.history.pushState({ checkoutStep: step }, "");
    }
  };

  // ── Coupon (unified: tries regular coupon first, then special coupon) ──
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponStatus(null);
    setCouponMessage("");
    setShowCouponModal(false);
    setAppliedSpecialCode(null);

    const code = couponCode.trim();
    let regularReason = null;

    // Try regular coupon first
    try {
      const data = await couponApi.validate(code, subtotal);
      // Backend returns 200 with { valid: false } for invalid coupons,
      // so we MUST check data.valid (don't treat HTTP 200 as success).
      if (data && data.valid) {
        setCouponStatus("valid");
        setCouponDiscount(data.discount || 0);
        setCouponDiscountType(data.discountType || "percentage");
        fetchPricingPreview(code, false, null, loyaltyApplied, {
          paymentMethod,
          pincode: shipping.pincode,
          state: shipping.state,
        })
          .then((pricing) => setCheckoutPricing(pricing))
          .catch(() => {});
        setCouponLoading(false);
        return;
      }
      // Capture the reason for fallthrough display
      regularReason = data?.message || null;
    } catch (err) {
      // Network/auth error, capture backend message if present
      regularReason = err?.response?.data?.message || null;
    }

    // A regular-coupon reason is only meaningful when the code actually matched a
    // regular coupon. "Invalid coupon code" means it wasn't one, so in that case let
    // the special-coupon result speak instead of masking it.
    const specificRegularReason =
      regularReason && regularReason !== "Invalid coupon code" ? regularReason : null;

    // Try as special coupon
    try {
      const data = await specialCouponApi.validate(code, subtotal);
      if (data.valid) {
        setCouponStatus("valid");
        setCouponDiscount(0);
        setCouponDiscountType("special");
        setAppliedSpecialCode(code);
        fetchPricingPreview(null, false, code, loyaltyApplied, {
          paymentMethod,
          pincode: shipping.pincode,
          state: shipping.state,
        })
          .then((pricing) => setCheckoutPricing(pricing))
          .catch(() => {});
      } else {
        setCouponStatus("invalid");
        setCouponDiscount(0);
        setCouponDiscountType("percentage");
        // Prefer the specific regular-coupon reason (e.g. min order, expired) over
        // the special coupon's generic "Invalid promotion code".
        setCouponMessage(specificRegularReason || data?.message || "Invalid coupon code");
        setShowCouponModal(true);
      }
    } catch (err) {
      setCouponStatus("invalid");
      setCouponDiscount(0);
      setCouponDiscountType("percentage");
      setCouponMessage(
        specificRegularReason || err?.response?.data?.message || "Invalid coupon code"
      );
      setShowCouponModal(true);
    } finally {
      setCouponLoading(false);
    }
  };

  // ── Promoter (affiliate) code auto-apply ──
  // A promoter link may carry a bound coupon (?coupon=…). Prefill it into the ONE
  // existing coupon input and validate it through the existing flow — no new field.
  const [autoApplyPending, setAutoApplyPending] = useState(false);
  useEffect(() => {
    const code = getStoredCoupon();
    if (code) {
      setCouponCode((prev) => prev || code);
      setAutoApplyPending(true);
    }
  }, []);
  useEffect(() => {
    if (
      autoApplyPending &&
      couponCode.trim() &&
      subtotal > 0 &&
      couponStatus !== "valid" &&
      !couponLoading
    ) {
      setAutoApplyPending(false);
      handleApplyCoupon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoApplyPending, couponCode, subtotal, couponStatus, couponLoading]);

  // ── Loyalty redemption handlers ──
  const handleApplyLoyalty = async () => {
    setLoyaltyError("");
    const points = parseInt(loyaltyPointsInput, 10);
    if (!points || points <= 0) {
      setLoyaltyError("Enter the number of points to redeem");
      return;
    }
    if (!loyaltyConfig) {
      setLoyaltyError("Loyalty program unavailable");
      return;
    }
    if (points < loyaltyConfig.minRedemptionPoints) {
      setLoyaltyError(`Minimum redemption is ${loyaltyConfig.minRedemptionPoints} points`);
      return;
    }
    if (points > loyaltyBalance) {
      setLoyaltyError(`You only have ${loyaltyBalance} points`);
      return;
    }
    if (points > loyaltyMaxRedeemable) {
      setLoyaltyError(`Maximum redeemable on this order: ${loyaltyMaxRedeemable} points`);
      return;
    }

    try {
      const subAfterDiscounts = pricingSourceForLoyaltyMax();
      const result = await loyaltyApi.previewRedeem(points, subAfterDiscounts);
      if (!result.valid) {
        setLoyaltyError(result.message || "Cannot apply points");
        return;
      }
      setLoyaltyApplied(points);
    } catch (err) {
      setLoyaltyError(err?.response?.data?.message || "Failed to apply points");
    }
  };

  const handleRemoveLoyalty = () => {
    setLoyaltyApplied(0);
    setLoyaltyPointsInput("");
    setLoyaltyError("");
  };

  // ── Place order ──
  const handlePlaceOrder = async () => {
    // Guest flow: check account, save form, redirect
    if (!isAuthenticated) {
      setOrderLoading(true);
      setOrderError("");
      try {
        const result = await authApi.checkAccount(shipping.email, fullPhone);

        // Save form data before redirecting. Strip contact PII (email/phone) —
        // it's repopulated from the user profile after auth, so no need to keep
        // it in localStorage.
        saveCheckoutData({
          shipping: { ...shipping, email: "", phone: "" },
          billing,
          billingSameAsShipping,
          paymentMethod,
          couponCode: couponStatus === "valid" ? couponCode.trim() : "",
          activeStep: 3,
        });

        if (result.emailExists && result.phoneExists && !result.sameAccount) {
          // Edge case: different accounts
          setOrderError("The email and phone number belong to different accounts. Please use matching contact details or log in first.");
          setOrderLoading(false);
          return;
        }

        if (result.emailExists || result.phoneExists) {
          // Existing account → login. Preselect the method that matches the
          // account: phone accounts use OTP, email-only accounts use password.
          const params = new URLSearchParams({
            redirect: "/checkout",
            method: result.phoneExists ? "mobile" : "password",
          });
          if (shipping.email) params.set("email", shipping.email);
          if (fullPhone) params.set("phone", fullPhone);
          router.push(`/login?${params.toString()}`);
        } else {
          // No account → sign up via Mobile OTP (no register form anymore).
          const params = new URLSearchParams({ redirect: "/checkout", method: "mobile" });
          if (shipping.email) params.set("email", shipping.email);
          if (fullPhone) params.set("phone", fullPhone);
          if (shipping.fullName) params.set("name", shipping.fullName);
          router.push(`/login?${params.toString()}`);
        }
      } catch {
        setOrderError("Could not verify account. Please try again.");
        setOrderLoading(false);
      }
      return;
    }

    // Authenticated flow
    setOrderLoading(true);
    setOrderError("");
    setStockErrors([]);

    const shippingInfo = getShippingInfo();
    const orderData = {
      shippingInfo,
      billingInfo: billingSameAsShipping ? shippingInfo : billing,
      billingSameAsShipping,
      couponCode: couponStatus === "valid" && !appliedSpecialCode ? couponCode.trim() : undefined,
      specialCouponCode: appliedSpecialCode || undefined,
      giftWrap: false,
      loyaltyPointsToRedeem: loyaltyApplied || 0,
      // Promoter last-click attribution (resolved server-side from the slug).
      attribution: getAttributionPayload(),
    };

    try {
      if (paymentMethod === "cod") {
        const data = await orderApi.placeOrder({ ...orderData, paymentMethod: "cod" });
        clearCart();
        clearCheckoutData();
        setPlacedOrder(data.order);
        setOrderLoading(false);
        // Save address if new
        saveAddressIfNew();
      } else if (paymentMethod === "razorpay") {
        // --- Razorpay two-phase checkout flow ---

        // Phase 1: Load Razorpay SDK
        const loaded = await loadRazorpay();
        if (!loaded) {
          setOrderError("Failed to load payment gateway. Please try again.");
          setOrderLoading(false);
          return;
        }

        // Phase 2: Initiate checkout session
        let initiateData;
        try {
          initiateData = await checkoutApi.initiate({
            shippingInfo: shippingInfo,
            billingInfo: billingSameAsShipping ? shippingInfo : billing,
            billingSameAsShipping,
            couponCode: orderData.couponCode,
            specialCouponCode: orderData.specialCouponCode,
            giftWrap: false,
            paymentMethod: "razorpay",
            idempotencyKey,
            loyaltyPointsToRedeem: loyaltyApplied || 0,
            attribution: orderData.attribution,
          });
        } catch (err) {
          handleInitiateError(err);
          setOrderLoading(false);
          return;
        }

        // Phase 3: Open Razorpay modal
        const options = {
          key: initiateData.razorpayKeyId,
          amount: initiateData.amount,
          currency: initiateData.currency || "INR",
          name: "Cleanse Ayurveda",
          description: "Order Payment",
          order_id: initiateData.razorpayOrderId,
          prefill: {
            name: shipping.fullName,
            email: shipping.email,
            contact: fullPhone,
          },
          theme: { color: "#663532" },
          handler: async (response) => {
            await handleRazorpaySuccess(response, initiateData);
          },
          modal: {
            ondismiss: () => {
              setOrderLoading(false);
              toast.info("Payment cancelled. You can try again -- your session is still active.");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", () => {
          setOrderLoading(false);
          toast.error("Payment failed. Please try again.");
        });
        rzp.open();
        return;
      }
    } catch (err) {
      setOrderError(err?.response?.data?.message || err?.message || "Failed to place order. Please try again.");
      setOrderLoading(false);
    }
  };

  // --- Razorpay error handlers ---

  const handleInitiateError = (err) => {
    const status = err?.response?.status;
    const message = err?.response?.data?.message || "";
    const errorItems = err?.response?.data?.errors;

    if (status === 409 && message.toLowerCase().includes("out of stock") && Array.isArray(errorItems)) {
      setStockErrors(errorItems);
      const names = errorItems.map((e) => e.name).join(", ");
      setOrderError(`Some items are out of stock: ${names}. Please update your cart.`);
      return;
    }
    if (status === 409 && message.toLowerCase().includes("already placed")) {
      setOrderError("Your order has already been placed. Check My Orders.");
      toast.info("Your order has already been placed.");
      return;
    }
    if (status === 409 && message.toLowerCase().includes("active checkout session")) {
      setOrderError("You already have a checkout in progress. Please wait a few minutes or check My Orders.");
      return;
    }
    if (status === 400 && message.toLowerCase().includes("cart is empty")) {
      setOrderError("Your cart is empty. Please add items before checking out.");
      return;
    }
    if (status === 400 && message.toLowerCase().includes("greater than zero")) {
      setOrderError("Order total must be greater than zero for online payment. Try Cash on Delivery instead.");
      return;
    }
    if (status === 500) {
      setOrderError("Payment gateway is temporarily unavailable. Please try again in a moment.");
      return;
    }
    setOrderError(message || "Failed to initiate checkout. Please try again.");
  };

  const handleRazorpaySuccess = async (response, initiateData) => {
    setPaymentVerifying(true);
    setOrderError("");

    try {
      const data = await checkoutApi.confirm({
        sessionId: initiateData.sessionId,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      });
      clearCart();
      clearCheckoutData();
      setPlacedOrder(data.order);
      saveAddressIfNew();
      toast.success("Order placed successfully!");
    } catch (err) {
      await handleConfirmError(err, response.razorpay_order_id);
    } finally {
      setPaymentVerifying(false);
      setOrderLoading(false);
    }
  };

  const handleConfirmError = async (err, razorpayOrderId) => {
    const status = err?.response?.status;
    const message = err?.response?.data?.message || "";

    if (status === 400 && message.toLowerCase().includes("verification failed")) {
      setOrderError("Payment verification failed. If money was deducted, it will be refunded automatically. Please contact support if the issue persists.");
      return;
    }
    if (status === 400 && message.toLowerCase().includes("amount mismatch")) {
      setOrderError("Something went wrong with the payment amount. Please contact support.");
      return;
    }
    if (status === 404) {
      setOrderError("Checkout session not found. Please try again.");
      resetCheckoutSession();
      return;
    }
    if (status === 409 && message.toLowerCase().includes("in progress")) {
      toast.info("Your order is being processed. Checking status...");
      const order = await pollForOrder(razorpayOrderId);
      if (order) {
        clearCart();
        clearCheckoutData();
        setPlacedOrder(order);
        toast.success("Order placed successfully!");
      } else {
        setOrderError("Your payment was received but order confirmation is taking longer than usual. Please check My Orders in a few minutes.");
      }
      return;
    }
    if (status === 409 && message.toLowerCase().includes("coupon")) {
      setOrderError("The coupon is no longer available. Your payment will be refunded. Please restart checkout.");
      resetCheckoutSession();
      return;
    }
    if (status === 410) {
      setOrderError("Your checkout session has expired. Please try again.");
      resetCheckoutSession();
      return;
    }
    if (!err?.response) {
      toast.info("Network issue detected. Checking if your order was placed...");
      const order = await pollForOrder(razorpayOrderId);
      if (order) {
        clearCart();
        clearCheckoutData();
        setPlacedOrder(order);
        toast.success("Order placed successfully!");
      } else {
        setOrderError("We could not confirm your order due to a network issue. Please check My Orders -- if your order does not appear within 5 minutes, contact support.");
      }
      return;
    }
    setOrderError(message || "Failed to confirm payment. Please check My Orders or contact support.");
  };

  const pollForOrder = async (razorpayOrderId) => {
    for (let attempt = 0; attempt < 5; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      try {
        const data = await orderApi.getMyOrders();
        const orders = data.orders || data || [];
        // Match by Razorpay order ID if available (precise match)
        if (razorpayOrderId) {
          const match = orders.find(
            (o) => o.payment?.razorpayOrderId === razorpayOrderId
          );
          if (match) return match;
        }
        // Fallback: match by recency (within last 2 minutes)
        const recent = orders.find((o) => {
          const created = new Date(o.createdAt);
          return Date.now() - created.getTime() < 2 * 60 * 1000;
        });
        if (recent) return recent;
      } catch {
        // Continue polling
      }
    }
    return null;
  };

  // Save shipping address for the user if it's new
  const saveAddressIfNew = async () => {
    if (!isAuthenticated) return;
    try {
      const existing = savedAddresses.find(
        (a) => a.pincode === shipping.pincode && a.address1 === shipping.address1
      );
      if (!existing) {
        await addressApi.create({
          label: "Home",
          fullName: shipping.fullName,
          phone: fullPhone,
          address1: shipping.address1,
          address2: shipping.address2,
          city: shipping.city,
          state: shipping.state,
          pincode: shipping.pincode,
          country: shipping.country,
          isDefault: savedAddresses.length === 0,
        });
      }
    } catch {
      // Silent, don't block order confirmation for address save failure
    }
  };

  // ── Helper: render input with error ──
  const renderInput = (field, label, placeholder, type = "text", opts = {}) => {
    const { isBilling, disabled, readOnly, value: overrideValue, onChange: overrideOnChange } = opts;
    const key = isBilling ? `billing_${field}` : field;
    const val = overrideValue !== undefined ? overrideValue : (isBilling ? billing[field] : shipping[field]);
    const changeFn = overrideOnChange || (isBilling ? (e) => handleBillingChange(field, e.target.value) : (e) => handleShippingChange(field, e.target.value));

    return (
      <div className="checkout-input-group">
        <label>{label}</label>
        <input
          type={type}
          placeholder={placeholder}
          value={val}
          onChange={changeFn}
          onBlur={() => handleBlur(field, val, isBilling)}
          className={errors[key] ? "has-error" : ""}
          disabled={disabled}
          readOnly={readOnly}
        />
        {errors[key] && <span className="checkout-field-error">{errors[key]}</span>}
      </div>
    );
  };

  // City is a combobox, not a <select>: the datalist suggests cities for the
  // selected country + state, but any city can still be typed. See
  // citiesForState / CITIES_BY_STATE in @/lib/countries.
  const renderCityInput = (isBilling = false) => {
    const key = isBilling ? "billing_city" : "city";
    const val = isBilling ? billing.city : shipping.city;
    const state = isBilling ? billing.state : shipping.state;
    const country = isBilling ? billing.country : shipping.country;
    const listId = isBilling ? "billing-city-options" : "shipping-city-options";
    const suggestions = citiesForState(country, state);
    const changeFn = isBilling
      ? (e) => handleBillingChange("city", e.target.value)
      : (e) => handleShippingChange("city", e.target.value);

    return (
      <div className="checkout-input-group">
        <label>City</label>
        <input
          type="text"
          list={suggestions.length ? listId : undefined}
          placeholder={state ? "Select or type your city" : "City"}
          value={val}
          onChange={changeFn}
          onBlur={() => handleBlur("city", val, isBilling)}
          className={errors[key] ? "has-error" : ""}
          autoComplete={isBilling ? "billing address-level2" : "shipping address-level2"}
        />
        {suggestions.length > 0 && (
          <datalist id={listId}>
            {suggestions.map((city) => (
              <option key={city} value={city} />
            ))}
          </datalist>
        )}
        {errors[key] && <span className="checkout-field-error">{errors[key]}</span>}
      </div>
    );
  };

  // State field is a dropdown for countries with a known subdivision list,
  // otherwise a free-text region input. Driven by the row's selected country.
  const renderStateSelect = (isBilling = false) => {
    const key = isBilling ? "billing_state" : "state";
    const val = isBilling ? billing.state : shipping.state;
    const country = isBilling ? billing.country : shipping.country;
    const states = statesForCountry(country);
    const changeFn = isBilling
      ? (e) => handleBillingChange("state", e.target.value)
      : (e) => handleShippingChange("state", e.target.value);

    if (states.length === 0) {
      return (
        <div className="checkout-input-group">
          <label>State / Province / Region</label>
          <input
            type="text"
            placeholder="State / Province / Region"
            value={val}
            onChange={changeFn}
            onBlur={() => handleBlur("state", val, isBilling)}
            className={errors[key] ? "has-error" : ""}
          />
          {errors[key] && <span className="checkout-field-error">{errors[key]}</span>}
        </div>
      );
    }

    return (
      <div className="checkout-input-group">
        <label>State</label>
        <select
          value={val}
          onChange={changeFn}
          onBlur={() => handleBlur("state", val, isBilling)}
          className={errors[key] ? "has-error" : ""}
        >
          <option value="" disabled>Select state</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        {errors[key] && <span className="checkout-field-error">{errors[key]}</span>}
      </div>
    );
  };

  // Country dropdown (full list). Changing it re-scopes the state field and,
  // for shipping, the phone dial code — see handleCountryChange.
  const renderCountrySelect = (isBilling = false) => {
    const val = isBilling ? billing.country : shipping.country;
    return (
      <div className="checkout-input-group">
        <label>Country</label>
        <select
          value={val}
          onChange={(e) => handleCountryChange(e.target.value, isBilling)}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>
    );
  };

  // ── Order confirmation view ──
  if (placedOrder) {
    return (
      <div className="checkout-page">
        <section className="checkout-empty">
          <div className="checkout-empty-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="checkout-empty-title">Order Confirmed!</h2>
          <p className="checkout-empty-text">
            Your order <strong>#{placedOrder.orderId}</strong> has been placed successfully.
          </p>
          <p className="checkout-empty-text" style={{ marginTop: "0.5rem" }}>
            Total: &#8377;{placedOrder.pricing?.total?.toFixed(2)}
          </p>
          {placedOrder.loyaltyPointsEarned > 0 && (
            <p className="checkout-empty-text" style={{ marginTop: "0.25rem", color: "#4CAF50" }}>
              +{placedOrder.loyaltyPointsEarned} loyalty points earned!
            </p>
          )}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", justifyContent: "center" }}>
            <Link href="/profile" className="checkout-empty-btn" style={{ background: "transparent", border: "1px solid #333", color: "#333" }}>View Orders</Link>
            <Link href="/wardrobe" className="checkout-empty-btn">Continue Shopping</Link>
          </div>
        </section>
      </div>
    );
  }

  // ── Empty cart ──
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <section className="checkout-empty">
          <div className="checkout-empty-icon">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6h12l1.5 12H4.5L6 6z" />
              <path d="M9 6V4a3 3 0 016 0v2" />
            </svg>
          </div>
          <h2 className="checkout-empty-title">Your Bag is Empty</h2>
          <p className="checkout-empty-text">Add some items before checking out</p>
          <Link href="/wardrobe" className="checkout-empty-btn">Browse Products</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {/* Hero */}
      <section className="checkout-hero">
        <div className="checkout-hero-content">
          <div className="checkout-breadcrumb">
            <Link href="/">HOME</Link>/ <span>CHECKOUT</span>
          </div>
          <h1 className="checkout-hero-title">Checkout</h1>
        </div>
      </section>

      {/* Step Indicator */}
      <div className="checkout-steps">
        <div className="checkout-steps-track">
          {[1, 2, 3].map((step) => {
            const labels = ["Shipping", "Payment", "Review"];
            return (
              <div key={step} className="checkout-step-item" onClick={() => { if (step < activeStep) goToStep(step); }}>
                <div className={`checkout-step-circle ${activeStep >= step ? "active" : ""}`}>
                  {activeStep > step ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                <span className={`checkout-step-label ${activeStep >= step ? "active" : ""}`}>
                  {labels[step - 1]}
                </span>
                {step < 3 && <div className={`checkout-step-line ${activeStep > step ? "active" : ""}`} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="checkout-main">
        {/* Left Column - Forms */}
        <div className="checkout-forms">

          {/* Step 1: Shipping */}
          {activeStep === 1 && (
            <div className="checkout-form-section">

              {!isAuthenticated && !guestMode ? (
                <div className="checkout-guest-gate">
                  <h3 className="checkout-section-title">Contact Information</h3>
                  <p className="checkout-guest-sub">Log in for faster checkout, or continue as a guest.</p>
                  <div className="checkout-input-group">
                    <label>Phone Number</label>
                    <div className={`checkout-phone-row ${errors.phone ? "has-error-row" : ""}`}>
                      <select
                        value={shipping.phoneCode}
                        onChange={(e) => handleShippingChange("phoneCode", e.target.value)}
                        className="checkout-phone-code"
                      >
                        {PHONE_CODES_LIST.map((c) => (
                          <option key={c.code} value={c.code}>{c.label}</option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        value={shipping.phone}
                        onChange={(e) => handleShippingChange("phone", e.target.value)}
                        className={errors.phone ? "has-error" : ""}
                      />
                    </div>
                    {errors.phone && <span className="checkout-field-error">{errors.phone}</span>}
                  </div>
                  <div className="checkout-guest-actions">
                    <button
                      type="button"
                      className="checkout-guest-login-btn"
                      onClick={handleVerifyPhone}
                      disabled={otpSending}
                    >
                      {otpSending ? "Sending..." : "Login"}
                    </button>
                    <button
                      type="button"
                      className="checkout-continue-btn checkout-guest-continue-btn"
                      onClick={() => setGuestMode(true)}
                    >
                      Continue as Guest
                    </button>
                  </div>
                </div>
              ) : (
              <>

              {/* Saved address selector */}
              {isAuthenticated && savedAddresses.length > 0 && (
                <div className="checkout-address-selector">
                  <h3 className="checkout-section-title">Saved Addresses</h3>
                  <div className="checkout-address-list">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr._id}
                        type="button"
                        className={`checkout-address-card ${selectedAddressId === addr._id ? "selected" : ""}`}
                        onClick={() => handleSelectAddress(addr)}
                      >
                        <span className="checkout-address-label">{addr.label || "Address"}</span>
                        <span className="checkout-address-preview">
                          {addr.fullName}, {addr.address1}, {addr.city}, {addr.pincode}
                        </span>
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`checkout-address-card checkout-address-new ${!selectedAddressId ? "selected" : ""}`}
                      onClick={handleNewAddress}
                    >
                      <span className="checkout-address-label">+ New Address</span>
                      <span className="checkout-address-preview">Enter a new shipping address</span>
                    </button>
                  </div>
                </div>
              )}

              <h3 className="checkout-section-title">Contact Information</h3>
              <div className="checkout-form-grid">
                {renderInput("email", guestMode ? "Email Address (optional)" : "Email Address", "your@email.com", "email")}
                <div className="checkout-input-group">
                  <label>Phone Number</label>
                  <div className={`checkout-phone-row ${errors.phone ? "has-error-row" : ""}`}>
                    <select
                      value={shipping.phoneCode}
                      onChange={(e) => handleShippingChange("phoneCode", e.target.value)}
                      className="checkout-phone-code"
                    >
                      {PHONE_CODES_LIST.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={shipping.phone}
                      onChange={(e) => handleShippingChange("phone", e.target.value)}
                      onBlur={() => handleBlur("phone", shipping.phone)}
                      className={errors.phone ? "has-error" : ""}
                      disabled={phoneIsVerified}
                    />
                    {phoneIsVerified ? (
                      <span className="checkout-phone-verified">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="checkout-phone-verify-btn"
                        onClick={handleVerifyPhone}
                        disabled={otpSending}
                      >
                        {otpSending ? "Sending..." : "Verify"}
                      </button>
                    )}
                  </div>
                  {errors.phone && <span className="checkout-field-error">{errors.phone}</span>}
                </div>
              </div>

              <h3 ref={shippingFormRef} className="checkout-section-title checkout-section-title--spaced">Shipping Address</h3>
              <div className="checkout-form-stack">
                {renderInput("fullName", guestMode ? "Full Name (optional)" : "Full Name", "Full name")}
                {renderInput("address1", "Address Line 1", "Street address")}
                {renderInput("address2", "Address Line 2", "Apartment, suite, etc. (optional)")}
                <div className="checkout-form-grid">
                  {renderCityInput()}
                  {renderStateSelect()}
                </div>
                <div className="checkout-form-grid">
                  <div className="checkout-input-group">
                    <label>{postalLabel(shipping.country)}</label>
                    <input
                      type="text"
                      placeholder={postalExample(shipping.country) || "Postal code"}
                      value={shipping.pincode}
                      onChange={(e) => handleShippingChange("pincode", e.target.value)}
                      onBlur={() => handleBlur("pincode", shipping.pincode)}
                      className={errors.pincode ? "has-error" : ""}
                      maxLength={isIndia(shipping.country) ? 6 : 12}
                    />
                    {errors.pincode && <span className="checkout-field-error">{errors.pincode}</span>}
                    {!errors.pincode && pincodeStatus && (
                      <span className={`checkout-pincode-status checkout-pincode-${pincodeStatus}`}>
                        {pincodeStatus === "checking" && <span className="checkout-pincode-dot" />}
                        {pincodeMessage}
                      </span>
                    )}
                  </div>
                  {renderCountrySelect()}
                </div>
              </div>

              <button className="checkout-continue-btn" onClick={() => goToStep(2)}>
                Continue to Payment
              </button>
              </>
              )}
            </div>
          )}

          {/* Step 2: Payment */}
          {activeStep === 2 && (
            <div className="checkout-form-section">
              {/* Billing same as shipping */}
              <div className="checkout-toggle-row">
                <label className="checkout-toggle">
                  <input
                    type="checkbox"
                    checked={billingSameAsShipping}
                    onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                  />
                  <span className="checkout-toggle-slider"></span>
                </label>
                <span className="checkout-toggle-label">Billing address same as shipping</span>
              </div>

              {/* Billing address (if different) */}
              {!billingSameAsShipping && (
                <div className="checkout-billing-form">
                  <h3 className="checkout-section-title">Billing Address</h3>
                  <div className="checkout-form-stack">
                    {renderInput("fullName", "Full Name", "Full name", "text", { isBilling: true })}
                    {renderInput("address1", "Address Line 1", "Street address", "text", { isBilling: true })}
                    {renderInput("address2", "Address Line 2", "Apartment, suite, etc. (optional)", "text", { isBilling: true })}
                    <div className="checkout-form-grid">
                      {renderCityInput(true)}
                      {renderStateSelect(true)}
                    </div>
                    <div className="checkout-form-grid">
                      {renderInput("pincode", postalLabel(billing.country), postalExample(billing.country) || "Postal code", "text", { isBilling: true })}
                      {renderCountrySelect(true)}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <h3 className="checkout-section-title checkout-section-title--spaced">Payment Method</h3>
              <div className="checkout-payment-methods">
                <label className={`checkout-payment-option ${paymentMethod === "cod" ? "selected" : ""}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                  <span className="checkout-radio-custom"></span>
                  <div className="checkout-payment-info">
                    <span className="checkout-payment-name">Cash on Delivery</span>
                    <span className="checkout-payment-logo">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                    </span>
                  </div>
                </label>

                <label className={`checkout-payment-option ${paymentMethod === "razorpay" ? "selected" : ""}`}>
                  <input type="radio" name="payment" value="razorpay" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} />
                  <span className="checkout-radio-custom"></span>
                  <div className="checkout-payment-info">
                    <span className="checkout-payment-name">Online Payment</span>
                    <span className="checkout-payment-logo">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                    </span>
                  </div>
                </label>

              </div>

              {/* Coupon Code */}
              <h3 className="checkout-section-title checkout-section-title--spaced">Coupon Code</h3>
              <div className="checkout-coupon-row">
                <div className="checkout-input-group checkout-coupon-input">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCouponStatus(null);
                      setCouponDiscount(0);
                      setCouponDiscountType("percentage");
                      setCouponMessage("");
                      setAppliedSpecialCode(null);
                    }}
                  />
                </div>
                <button className="checkout-coupon-btn" onClick={handleApplyCoupon} disabled={couponLoading}>{couponLoading ? "..." : "Apply"}</button>
              </div>
              {couponStatus === "valid" && (
                <p className="checkout-coupon-msg checkout-coupon-valid">
                  {couponDiscountType === "special" ? "Promotion applied! Discount shown in summary." : couponDiscountType === "free_shipping" ? "Free shipping applied!" : couponDiscountType === "fixed" ? `\u20B9${couponDiscount} off applied!` : `${couponDiscount}% off applied!`}
                </p>
              )}
              {couponStatus === "invalid" && (
                <p className="checkout-coupon-msg checkout-coupon-invalid">
                  {couponMessage || "Invalid coupon"}
                </p>
              )}
              <CouponModal
                open={showCouponModal}
                type="error"
                title={couponErrorTitle(couponMessage)}
                message={couponErrorMessage(couponMessage, couponCode, subtotal)}
                onClose={() => setShowCouponModal(false)}
              />

              {/* Loyalty Points Redemption (auth-only) */}
              {isAuthenticated && loyaltyConfig?.enabled && loyaltyBalance > 0 && (
                <>
                  <h3 className="checkout-section-title checkout-section-title--spaced">
                    Loyalty Points
                  </h3>
                  <p className="checkout-coupon-msg" style={{ marginBottom: "0.5rem" }}>
                    Balance: <strong>{loyaltyBalance}</strong> points · Min{" "}
                    {loyaltyConfig.minRedemptionPoints} · Max redeemable on this
                    order: <strong>{loyaltyMaxRedeemable}</strong> points (1 point ={" "}
                    &#8377;{loyaltyConfig?.redeemRatePerPoint ?? 1})
                  </p>
                  {loyaltyApplied > 0 ? (
                    <div className="checkout-coupon-row">
                      <p className="checkout-coupon-msg checkout-coupon-valid" style={{ flex: 1 }}>
                        {loyaltyApplied} points applied (-&#8377;
                        {((loyaltyApplied || 0) * (loyaltyConfig?.redeemRatePerPoint ?? 1)).toFixed(0)})
                      </p>
                      <button
                        className="checkout-coupon-btn"
                        onClick={handleRemoveLoyalty}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="checkout-coupon-row">
                      <div className="checkout-input-group checkout-coupon-input">
                        <input
                          type="number"
                          min={loyaltyConfig.minRedemptionPoints}
                          max={loyaltyMaxRedeemable}
                          placeholder={`Enter points (min ${loyaltyConfig.minRedemptionPoints})`}
                          value={loyaltyPointsInput}
                          onChange={(e) => {
                            setLoyaltyPointsInput(e.target.value);
                            setLoyaltyError("");
                          }}
                          disabled={loyaltyMaxRedeemable < loyaltyConfig.minRedemptionPoints}
                        />
                      </div>
                      <button
                        className="checkout-coupon-btn"
                        onClick={handleApplyLoyalty}
                        type="button"
                        disabled={loyaltyMaxRedeemable < loyaltyConfig.minRedemptionPoints}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {loyaltyError && (
                    <p className="checkout-coupon-msg checkout-coupon-invalid">
                      {loyaltyError}
                    </p>
                  )}
                  {loyaltyMaxRedeemable < loyaltyConfig.minRedemptionPoints &&
                    loyaltyApplied === 0 && (
                      <p className="checkout-coupon-msg" style={{ opacity: 0.7 }}>
                        Order subtotal too low to redeem points right now.
                      </p>
                    )}
                </>
              )}

              <div className="checkout-step-actions">
                <button className="checkout-back-btn" onClick={() => goToStep(1)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                  Back
                </button>
                <button className="checkout-continue-btn" onClick={() => goToStep(3)}>
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {activeStep === 3 && (
            <div className="checkout-form-section">
              <h3 className="checkout-section-title">Shipping Address</h3>
              <div className="checkout-review-card">
                <div className="checkout-review-details">
                  <p className="checkout-review-name">{shipping.fullName || "Not provided"}</p>
                  <p className="checkout-review-line">{shipping.address1}</p>
                  {shipping.address2 && <p className="checkout-review-line">{shipping.address2}</p>}
                  <p className="checkout-review-line">
                    {shipping.city}{shipping.state ? `, ${shipping.state}` : ""} {shipping.pincode}
                  </p>
                  <p className="checkout-review-line">{shipping.country}</p>
                  <p className="checkout-review-line">{shipping.email}</p>
                  <p className="checkout-review-line">{fullPhone}</p>
                </div>
                <button className="checkout-edit-link" onClick={() => goToStep(1)}>Edit</button>
              </div>

              <h3 className="checkout-section-title checkout-section-title--spaced">Payment Method</h3>
              <div className="checkout-review-card">
                <div className="checkout-review-details">
                  <p className="checkout-review-name">{paymentMethod === "razorpay" ? "Online Payment (Razorpay)" : "Cash on Delivery"}</p>
                </div>
                <button className="checkout-edit-link" onClick={() => goToStep(2)}>Edit</button>
              </div>

              {orderError && <p className="checkout-order-error">{orderError}</p>}
              {stockErrors.length > 0 && (
                <div className="checkout-stock-errors">
                  <ul>
                    {stockErrors.map((item, i) => (
                      <li key={i}>{item.name} ({item.sizeLabel}) -- {item.available} available, {item.requested} requested</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="checkout-step-actions">
                <button className="checkout-back-btn" onClick={() => goToStep(2)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                  Back
                </button>
                <button className="checkout-place-order-btn" onClick={handlePlaceOrder} disabled={orderLoading || paymentVerifying}>
                  {paymentVerifying
                    ? "Payment successful, verifying..."
                    : orderLoading
                      ? "Processing..."
                      : isAuthenticated
                        ? (paymentMethod === "razorpay" ? "Pay Now" : "Place Order")
                        : "Continue to Login"}
                </button>
              </div>
              {!isAuthenticated && (
                <p className="checkout-login-hint">You will be asked to log in or create an account to complete your order.</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className="checkout-summary-wrapper">
          <div className="checkout-summary-card">
            <h3 className="checkout-summary-title">
              Order Summary
              <span className="checkout-summary-count">{cartCount} {cartCount === 1 ? "item" : "items"}</span>
            </h3>

            <div className="checkout-summary-items" data-lenis-prevent>
              {cartItems.map((item, i) => {
                const quantity = Number(item.quantity) || 1;
                return (
                  <div key={`${item.name}-${i}`} className="checkout-summary-item">
                    <div className="checkout-summary-item-img">
                      <img src={item.image || `/images/${(i % 4) + 1}.png`} alt={item.name} />
                      <span className="checkout-summary-item-qty">{quantity}</span>
                    </div>
                    <div className="checkout-summary-item-info">
                      <span className="checkout-summary-item-name">{item.name}</span>
                      <span className="checkout-summary-item-price">
                        &#8377;{(parseFloat(item.price) * quantity).toFixed(0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="checkout-summary-rows">
              <div className="checkout-summary-line">
                <span>Subtotal</span>
                <span>&#8377;{formatPrice(pricingSource?.subtotal ?? subtotal)}</span>
              </div>
              {bundleDiscounts.length > 0 && bundleDiscounts.map((bd, i) => (
                <div key={i} className="checkout-summary-line checkout-summary-discount">
                  <span>{bd.bundleName}</span>
                  <span>-&#8377;{formatPrice(bd.discountAmount)}</span>
                </div>
              ))}
              {tierDiscount > 0 && (
                <div className="checkout-summary-line checkout-summary-discount">
                  <span>Discount ({pricingSource?.tierPercent || 0}% off)</span>
                  <span>-&#8377;{formatPrice(tierDiscount)}</span>
                </div>
              )}
              {(pricingSource?.specialCouponDiscountTotal || 0) > 0 && (pricingSource?.specialCouponDiscounts || []).map((sp, i) => (
                <div key={`sp-${i}`} className="checkout-summary-line checkout-summary-discount">
                  <span>{sp.title || "Special Discount"}</span>
                  <span>-&#8377;{formatPrice(sp.discountAmount)}</span>
                </div>
              ))}
              {(pricingSource?.freeGifts || []).length > 0 && (pricingSource?.freeGifts || []).map((gift, i) => (
                <div key={`gift-${i}`} className="checkout-summary-line checkout-summary-discount">
                  <span>Free Gift: {gift.productName || "Gift"}</span>
                  <span>FREE</span>
                </div>
              ))}
              {couponAmount > 0 && (
                <div className="checkout-summary-line checkout-summary-discount">
                  <span>Coupon ({pricingSource?.couponCode || couponCode})</span>
                  <span>-&#8377;{formatPrice(couponAmount)}</span>
                </div>
              )}
              {(pricingSource?.loyaltyDiscount || 0) > 0 && (
                <div className="checkout-summary-line checkout-summary-discount">
                  <span>
                    Loyalty Points ({pricingSource?.loyaltyPointsRedeemed || 0} pts)
                  </span>
                  <span>-&#8377;{formatPrice(pricingSource?.loyaltyDiscount)}</span>
                </div>
              )}
              <div className="checkout-summary-line">
                <span className="checkout-summary-shipping-label">
                  Shipping
                  <ShippingChargesInfo breakdown={shippingBreakdown} position="top" />
                </span>
                <span>{shippingCost === 0 ? "Free" : `\u20B9${formatPrice(shippingCost)}`}</span>
              </div>
              <div className="checkout-summary-line checkout-summary-total">
                <span>Total</span>
                <span>&#8377;{formatPrice(total)}</span>
              </div>
              {loyaltyPointsEarned > 0 && (
                <div className="checkout-summary-loyalty">
                  ⭐ Earn {loyaltyPointsEarned} loyalty {loyaltyPointsEarned === 1 ? "point" : "points"} on this order
                </div>
              )}
            </div>

            <Link href="/wardrobe" className="checkout-continue-shopping">Continue Shopping</Link>
          </div>
        </div>
      </div>

      {otpModalOpen && (
        <div className="checkout-otp-overlay" onClick={closeOtpModal}>
          <div
            className="checkout-otp-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Verify phone number"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="checkout-otp-close" onClick={closeOtpModal} aria-label="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <h3 className="checkout-otp-title">Verify your number</h3>
            <p className="checkout-otp-sub">
              Enter the OTP sent to {shipping.phoneCode} {localPhoneDigits}
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              className="checkout-otp-input"
              placeholder="Enter OTP"
              value={otpValue}
              onChange={(e) => { setOtpValue(e.target.value.replace(/\D/g, "")); setOtpError(""); }}
              autoFocus
            />
            {otpError && <p className="checkout-otp-error">{otpError}</p>}
            <button
              className="checkout-otp-verify-btn"
              onClick={handleConfirmGuestOtp}
              disabled={otpVerifying}
            >
              {otpVerifying ? "Verifying..." : "Verify"}
            </button>
            <button
              className="checkout-otp-resend"
              onClick={handleResendGuestOtp}
              disabled={otpSending}
              type="button"
            >
              Resend OTP
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
