"use client";
import { createContext, useContext, useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { cartApi, cartPricingApi, guestPricingApi } from "@/lib/endpoints";
import { isUsablePricing, resolveVariantLabel } from "@/lib/formatters";

const CartContext = createContext(null);

const STORAGE_KEY = "cleanse_cart";

function loadGuestCart() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const CartProvider = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [serverPricing, setServerPricing] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const syncedRef = useRef(false);
  // Monotonic id for pricing requests. Adding a bundle mutates the cart once
  // per product, so several pricing calls are in flight at the same time and
  // they can resolve out of order. Only the newest request may write pricing.
  const pricingReqRef = useRef(0);

  // Load cart on mount / auth change
  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      // Merge guest cart into API cart, then load
      const guestItems = loadGuestCart();
      const mergeAndLoad = async () => {
        try {
          // Merge guest items first
          for (const item of guestItems) {
            try {
              await cartApi.addItem(item.productId || item._id, item.quantity || 1, item.selectedSize);
            } catch { /* skip duplicates */ }
          }
          if (guestItems.length > 0) {
            localStorage.removeItem(STORAGE_KEY);
          }
          // Now fetch the full cart
          const data = await cartApi.get();
          handleCartResponse(data);
        } catch {
          setCartItems([]);
        }
        syncedRef.current = true;
      };
      mergeAndLoad();
    } else {
      setCartItems(loadGuestCart());
      syncedRef.current = true;
    }
  }, [isAuthenticated, authLoading]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!isAuthenticated && syncedRef.current) {
      saveGuestCart(cartItems);
    }
  }, [cartItems, isAuthenticated]);

  // Fetch server pricing for guest carts
  useEffect(() => {
    if (authLoading || isAuthenticated) return;
    if (!syncedRef.current || cartItems.length === 0) {
      pricingReqRef.current += 1; // invalidate anything in flight
      setServerPricing(null);
      return;
    }

    const items = cartItems
      .filter((item) => item.productId)
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity || 1,
        selectedSize: item.selectedSize,
      }));

    if (items.length === 0) {
      pricingReqRef.current += 1;
      setServerPricing(null);
      return;
    }

    // Debounce so a bundle add (one cart mutation per product) prices the
    // settled cart once, instead of firing a request per product where the
    // early ones don't yet meet the bundle's minimum and carry no discount.
    const reqId = ++pricingReqRef.current;
    const timer = setTimeout(() => {
      guestPricingApi
        .calculate(items)
        .then((pricing) => {
          if (pricingReqRef.current !== reqId) return; // superseded
          setServerPricing(isUsablePricing(pricing) ? pricing : null);
        })
        .catch(() => {
          if (pricingReqRef.current !== reqId) return;
          setServerPricing(null);
        });
    }, 120);

    return () => clearTimeout(timer);
  }, [cartItems, isAuthenticated, authLoading]);

  const normalizeApiCart = (cart) => {
    if (!cart?.items) return [];
    return cart.items.map((item) => ({
      cartItemId: item._id,
      productId: item.product?._id || item.product,
      name: item.product?.name || item.name || "Product",
      price: item.price || item.product?.price || 0,
      image: (item.product?.images?.find((img) => img.isPrimary) || item.product?.images?.[0])?.url || item.image || "/images/1.png",
      selectedSize: item.selectedSize,
      quantity: item.quantity || 1,
      slug: item.product?.slug,
      description: item.product?.shortDescription || item.product?.description || item.description || "",
    }));
  };

  // Handle API response that may be { cart, pricing } or just cart.
  // A partial/malformed pricing object is treated as "no pricing" so the UI
  // falls back to the client-side estimate instead of rendering broken totals.
  const handleCartResponse = (data) => {
    pricingReqRef.current += 1; // this response is newer than anything in flight
    if (data?.cart && data?.pricing) {
      setCartItems(normalizeApiCart(data.cart));
      setServerPricing(isUsablePricing(data.pricing) ? data.pricing : null);
    } else {
      setCartItems(normalizeApiCart(data.cart || data));
      setServerPricing(isUsablePricing(data?.pricing) ? data.pricing : null);
    }
  };

  // Fetch pricing preview from server (coupon/gift wrap/special coupons/loyalty) -- works for both auth and guest
  const fetchPricingPreview = useCallback(async (couponCode, giftWrap, specialCouponCode, loyaltyPointsToRedeem = 0, opts = {}) => {
    // Shares the ordering guard with the auto-fetch effect so an in-flight
    // plain (coupon-less) pricing response can't land on top of this one.
    const reqId = ++pricingReqRef.current;
    try {
      let pricing;
      if (isAuthenticated) {
        pricing = await cartPricingApi.preview(couponCode, giftWrap, specialCouponCode, loyaltyPointsToRedeem, opts);
      } else {
        const items = cartItems
          .filter((item) => item.productId)
          .map((item) => ({
            productId: item.productId,
            quantity: item.quantity || 1,
            selectedSize: item.selectedSize,
          }));
        if (items.length === 0) return null;
        // Guest cannot redeem loyalty points
        pricing = await guestPricingApi.calculate(items, couponCode, giftWrap, specialCouponCode, opts);
      }
      const safePricing = isUsablePricing(pricing) ? pricing : null;
      // Still return the result to the caller even if a newer request has since
      // taken over the shared pricing state.
      if (pricingReqRef.current === reqId) setServerPricing(safePricing);
      return safePricing;
    } catch {
      return null;
    }
  }, [isAuthenticated, cartItems]);

  const addToCart = useCallback(async (product, selectedSize, quantity = 1) => {
    const productId = product._id || product.productId;
    const name = product.name;
    const image = product.primaryImage || product.image || product.images?.[0]?.url || "/images/1.png";
    const slug = product.slug;
    const description = product.shortDescription || product.description || "";
    // With no explicit size (bundle add, cross-sell "+", card quick-add) fall
    // back to the variant `cardPrice` advertises — the cheapest one — so the
    // bag bills exactly the price the shopper was quoted. Defaulting to
    // sizes[0] instead silently charges whichever variant happens to be first.
    const sizeLabel = resolveVariantLabel(product, selectedSize);
    // Snapshot the SELECTED variant's price into the guest cart (localStorage).
    // selectedSize may be a full variant object OR just a label; resolve either way.
    const variant =
      selectedSize && typeof selectedSize === "object" && "price" in selectedSize
        ? selectedSize
        : product.sizes?.find((s) => (s.label || s) === sizeLabel);
    const price = Number(variant?.price ?? product.price);

    if (isAuthenticated) {
      try {
        const data = await cartApi.addItem(productId, quantity, sizeLabel);
        handleCartResponse(data);
      } catch (err) {
        console.error("Add to cart failed:", err);
      }
    } else {
      setCartItems((prev) => {
        const matchKey = `${productId || name}_${sizeLabel}`;
        const existing = prev.find((item) => `${item.productId || item.name}_${item.selectedSize}` === matchKey);
        if (existing) {
          return prev.map((item) =>
            `${item.productId || item.name}_${item.selectedSize}` === matchKey
              ? { ...item, quantity: (item.quantity || 1) + quantity }
              : item
          );
        }
        return [...prev, { productId, name, price, image, selectedSize: sizeLabel, quantity, slug, description }];
      });
    }
    setIsCartOpen(true);
  }, [isAuthenticated]);

  const removeFromCart = useCallback(async (cartItemId) => {
    if (isAuthenticated) {
      try {
        const data = await cartApi.removeItem(cartItemId);
        handleCartResponse(data);
      } catch (err) {
        console.error("Remove from cart failed:", err);
      }
    } else {
      setCartItems((prev) => prev.filter((item) => {
        const id = item.cartItemId || `${item.productId || item.name}_${item.selectedSize}`;
        return id !== cartItemId;
      }));
    }
  }, [isAuthenticated]);

  const updateQuantity = useCallback(async (cartItemId, newQuantity) => {
    const qty = Math.max(1, newQuantity);
    if (isAuthenticated) {
      try {
        const data = await cartApi.updateItem(cartItemId, qty);
        handleCartResponse(data);
      } catch (err) {
        console.error("Update quantity failed:", err);
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) => {
          const id = item.cartItemId || `${item.productId || item.name}_${item.selectedSize}`;
          return id === cartItemId ? { ...item, quantity: qty } : item;
        })
      );
    }
  }, [isAuthenticated]);

  // Re-pull the cart from the server. Used by pull-to-refresh in the bag so a
  // stale price / removed item / expired promo gets corrected on demand.
  // Guests have no server cart, so only the pricing is recalculated.
  const refreshCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const data = await cartApi.get();
        handleCartResponse(data);
      } catch { /* keep whatever we already have */ }
      return;
    }

    const items = cartItems
      .filter((item) => item.productId)
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity || 1,
        selectedSize: item.selectedSize,
      }));

    if (items.length === 0) {
      pricingReqRef.current += 1;
      setServerPricing(null);
      return;
    }

    const reqId = ++pricingReqRef.current;
    try {
      const pricing = await guestPricingApi.calculate(items);
      if (pricingReqRef.current !== reqId) return; // superseded
      setServerPricing(isUsablePricing(pricing) ? pricing : null);
    } catch { /* keep whatever we already have */ }
  }, [isAuthenticated, cartItems]);

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await cartApi.clear();
      } catch { /* ignore */ }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setCartItems([]);
  }, [isAuthenticated]);

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + (item.quantity || 1), 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Number(item.price) * (item.quantity || 1),
        0
      ),
    [cartItems]
  );

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartCount,
    subtotal,
    isCartOpen,
    setIsCartOpen,
    serverPricing,
    fetchPricingPreview,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
