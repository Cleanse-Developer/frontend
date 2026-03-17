"use client";
import "./profile.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Copy from "@/components/Copy/Copy";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  orderApi,
  wishlistApi,
  couponApi,
  addressApi,
  userApi,
  referralApi,
  loyaltyApi,
} from "@/lib/endpoints";
import { normalizeOrder, normalizeCoupon } from "@/lib/normalizers";

const tabs = ["Orders", "Wishlist", "Coupons", "Addresses", "Settings"];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

export default function ProfilePage() {
  const { addToCart } = useCart();
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshProfile } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("Orders");

  // Data states
  const [orders, setOrders] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [referralCode, setReferralCode] = useState("");

  // Loading states
  const [tabLoading, setTabLoading] = useState(false);

  // UI states
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnSubmitted, setReturnSubmitted] = useState({});
  const [copiedCode, setCopiedCode] = useState(null);
  const [referralCopied, setReferralCopied] = useState(false);

  // Settings form
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    countryCode: "+91",
  });
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: "",
    fullName: "",
    phone: "",
    address1: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    isDefault: false,
  });

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Populate profile form from user
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        countryCode: user.countryCode || "+91",
      });
      if (user.preferences) {
        setPreferences({
          orderUpdates: user.preferences.orderUpdates ?? true,
          promotions: user.preferences.promotions ?? false,
          newsletter: user.preferences.newsletter ?? true,
        });
      }
      setLoyaltyPoints(user.loyaltyPoints || 0);
    }
  }, [user]);

  // Fetch data when tab changes
  useEffect(() => {
    if (!isAuthenticated) return;

    setTabLoading(true);

    if (activeTab === "Orders") {
      orderApi.getMyOrders().then((data) => {
        setOrders((data.orders || data || []).map(normalizeOrder));
      }).catch(() => {}).finally(() => setTabLoading(false));
    } else if (activeTab === "Wishlist") {
      wishlistApi.get().then((data) => {
        const items = data.wishlist || data || [];
        setWishlistItems(items.map((w) => w.product || w));
      }).catch(() => {}).finally(() => setTabLoading(false));
    } else if (activeTab === "Coupons") {
      couponApi.getMyCoupons().then((data) => {
        setCoupons((data.coupons || data || []).map(normalizeCoupon));
      }).catch(() => {}).finally(() => setTabLoading(false));
    } else if (activeTab === "Addresses") {
      addressApi.getAll().then((data) => {
        setAddresses(data.addresses || data || []);
      }).catch(() => {}).finally(() => setTabLoading(false));
    } else if (activeTab === "Settings") {
      setTabLoading(false);
      referralApi.getCode().then((data) => {
        setReferralCode(data.referralCode || data.code || "");
      }).catch(() => {});
      loyaltyApi.getBalance().then((data) => {
        setLoyaltyPoints(data.points || data.balance || 0);
      }).catch(() => {});
    } else {
      setTabLoading(false);
    }
  }, [activeTab, isAuthenticated]);

  // ── Handlers ──

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await wishlistApi.remove(productId);
      setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
    } catch { /* ignore */ }
  };

  const handleOrderAgain = async (order) => {
    try {
      await orderApi.reorder(order._id || order.orderId);
    } catch {
      order.items.forEach((item) => {
        addToCart({ name: item.name, price: item.price, _id: item.product });
      });
    }
  };

  const handleReturnSubmit = async (orderId) => {
    if (!returnReason) return;
    try {
      await orderApi.requestReturn(orderId, returnReason);
      setReturnSubmitted((prev) => ({ ...prev, [orderId]: true }));
      setReturnOrderId(null);
      setReturnReason("");
    } catch { /* ignore */ }
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 1500);
  };

  const handleUpdateProfile = async () => {
    setProfileSaving(true);
    try {
      await userApi.updateProfile(profileForm);
      if (refreshProfile) refreshProfile();
    } catch { /* ignore */ }
    setProfileSaving(false);
  };

  const handlePreferenceChange = async (key, value) => {
    const prev = { ...preferences };
    setPreferences({ ...preferences, [key]: value });
    try {
      await userApi.updatePreferences({ [key]: value });
    } catch {
      setPreferences(prev);
    }
  };

  const handleAddAddress = async () => {
    try {
      const data = await addressApi.create(addressForm);
      setAddresses((prev) => [...prev, data.address || data]);
      setShowAddressForm(false);
      setAddressForm({ label: "", fullName: "", phone: "", address1: "", city: "", state: "", pincode: "", country: "India", isDefault: false });
    } catch { /* ignore */ }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await addressApi.delete(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
    } catch { /* ignore */ }
  };

  const handleSignOut = async () => {
    await logout();
    router.replace("/");
  };

  const displayName = user?.fullName || "User";
  const displayPoints = loyaltyPoints.toLocaleString();

  return (
    <div className="profile-page">
      {/* Hero */}
      <section className="profile-hero">
        <div className="profile-hero-content">
          <div className="profile-avatar">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21v-1a8 8 0 0116 0v1" />
            </svg>
          </div>
          <Copy animateOnScroll={false} delay={0.3}>
            <p className="profile-hero-label">Welcome Back</p>
          </Copy>
          <Copy animateOnScroll={false} delay={0.5} type="flicker">
            <h1 className="profile-hero-heading">{displayName}</h1>
          </Copy>
          <Copy animateOnScroll={false} delay={0.7}>
            <p className="profile-hero-subtitle">Manage your account, orders & preferences</p>
          </Copy>
          <Copy animateOnScroll={false} delay={0.9}>
            <div className="profile-loyalty">
              <p className="profile-loyalty-points">{displayPoints} Points</p>
              <p className="profile-loyalty-subtext">Earn 1 point for every &#8377;10 spent</p>
            </div>
          </Copy>
        </div>
      </section>

      {/* Tabs */}
      <section className="profile-tabs-section">
        <div className="profile-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`profile-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Tab Content */}
      <section className="profile-tab-content">
        {/* ===== Orders Tab ===== */}
        {activeTab === "Orders" && (
          <div className="profile-orders">
            {tabLoading ? (
              <div className="profile-empty-state">
                <p className="profile-empty-text">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="profile-empty-state">
                <div className="profile-empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 6h12l1.5 12H4.5L6 6z" />
                    <path d="M9 6V4a3 3 0 016 0v2" />
                  </svg>
                </div>
                <h3 className="profile-empty-title">No Orders Yet</h3>
                <p className="profile-empty-text">Your order history will appear here</p>
                <Link href="/wardrobe" className="profile-action-btn">Start Shopping</Link>
              </div>
            ) : (
              orders.map((order) => {
                const oid = order._id || order.orderId || order.id;
                return (
                  <div key={oid} className="profile-order-card">
                    <div className="profile-order-header">
                      <div>
                        <p className="profile-order-id">Order #{order.orderId || order.id}</p>
                        <p className="profile-order-date">{order.date}</p>
                      </div>
                      <span className={`profile-order-status ${order.status === "Delivered" ? "status-delivered" : "status-transit"}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="profile-order-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="profile-order-item">
                          <span className="profile-order-item-name">{item.name}</span>
                          <span className="profile-order-item-detail">x{item.qty || item.quantity} &mdash; &#8377;{item.price * (item.qty || item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="profile-order-footer">
                      <p className="profile-order-total">Total: &#8377;{order.total || order.pricing?.total}</p>
                      <div className="profile-order-actions">
                        <button className="profile-order-again-btn" onClick={() => handleOrderAgain(order)}>Order Again</button>
                        {order.status === "Delivered" && !returnSubmitted[oid] && (
                          <button
                            className="profile-return-link"
                            onClick={() => setReturnOrderId(returnOrderId === oid ? null : oid)}
                          >
                            Return / Refund
                          </button>
                        )}
                        {returnSubmitted[oid] && (
                          <span className="profile-return-submitted">Request submitted</span>
                        )}
                      </div>
                    </div>
                    {returnOrderId === oid && (
                      <div className="profile-return-form">
                        <label className="profile-return-label">Reason for return</label>
                        <select
                          className="profile-return-select"
                          value={returnReason}
                          onChange={(e) => setReturnReason(e.target.value)}
                        >
                          <option value="">Select a reason</option>
                          <option value="Damaged product">Damaged product</option>
                          <option value="Wrong product">Wrong product</option>
                          <option value="Not as described">Not as described</option>
                          <option value="Other">Other</option>
                        </select>
                        <button
                          className="profile-return-submit"
                          onClick={() => handleReturnSubmit(oid)}
                          disabled={!returnReason}
                        >
                          Submit Request
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ===== Wishlist Tab ===== */}
        {activeTab === "Wishlist" && (
          <div className="profile-wishlist">
            {tabLoading ? (
              <div className="profile-empty-state">
                <p className="profile-empty-text">Loading wishlist...</p>
              </div>
            ) : wishlistItems.length > 0 ? (
              <div className="profile-wishlist-grid">
                {wishlistItems.map((product) => {
                  const pid = product._id;
                  const img = (product.images?.find((i) => i.isPrimary) || product.images?.[0])?.url || product.primaryImage || "/images/1.png";
                  return (
                    <div key={pid} className="profile-wishlist-card">
                      <div className="profile-wishlist-img-wrap">
                        <img
                          src={img}
                          alt={product.name}
                          className="profile-wishlist-img"
                        />
                        <button
                          className="profile-wishlist-heart"
                          onClick={() => handleRemoveFromWishlist(pid)}
                          aria-label="Remove from wishlist"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                          </svg>
                        </button>
                      </div>
                      <div className="profile-wishlist-info">
                        <h4 className="profile-wishlist-name">{product.name}</h4>
                        <p className="profile-wishlist-price">&#8377;{product.price}</p>
                      </div>
                      <button
                        className="profile-wishlist-add-btn"
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="profile-empty-state">
                <div className="profile-empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                </div>
                <h3 className="profile-empty-title">Your Wishlist is Empty</h3>
                <p className="profile-empty-text">Save items you love for later</p>
                <Link href="/wardrobe" className="profile-action-btn">Explore Products</Link>
              </div>
            )}
          </div>
        )}

        {/* ===== Coupons Tab ===== */}
        {activeTab === "Coupons" && (
          <div className="profile-coupons">
            {coupons.length === 0 ? (
              <div className="profile-empty-state">
                <h3 className="profile-empty-title">No Coupons Available</h3>
                <p className="profile-empty-text">Check back later for exclusive deals</p>
              </div>
            ) : (
              coupons.map((coupon) => (
                <div key={coupon.code} className="profile-coupon-card">
                  <div className="profile-coupon-info">
                    <p className="profile-coupon-code">{coupon.code}</p>
                    <p className="profile-coupon-desc">{coupon.description}</p>
                    <p className="profile-coupon-validity">Valid till {coupon.validTill}</p>
                  </div>
                  <button
                    className="profile-coupon-copy-btn"
                    onClick={() => handleCopyCoupon(coupon.code)}
                  >
                    {copiedCode === coupon.code ? "Copied!" : "Copy Code"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ===== Addresses Tab ===== */}
        {activeTab === "Addresses" && (
          <div className="profile-addresses">
            {addresses.map((addr) => (
              <div key={addr._id} className="profile-address-card">
                {addr.isDefault && <div className="profile-address-badge">Default</div>}
                <h4 className="profile-address-name">{addr.label || "Address"}</h4>
                <p className="profile-address-line">{addr.fullName}</p>
                <p className="profile-address-line">{addr.address1}</p>
                <p className="profile-address-line">{addr.city}, {addr.state} {addr.pincode}</p>
                <p className="profile-address-line">{addr.country || "India"}</p>
                <p className="profile-address-phone">{addr.phone ? `${addr.countryCode || "+91"} ${addr.phone}` : ""}</p>
                <div className="profile-address-actions">
                  <button className="profile-address-delete" onClick={() => handleDeleteAddress(addr._id)}>Delete</button>
                </div>
              </div>
            ))}

            {showAddressForm && (
              <div className="profile-address-card" style={{ border: "1px dashed #ccc" }}>
                <h4 className="profile-address-name">New Address</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.75rem" }}>
                  <input
                    type="text"
                    placeholder="Label (e.g. Home, Office)"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    className="profile-form-input"
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="profile-form-input"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="profile-form-input"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={addressForm.address1}
                    onChange={(e) => setAddressForm({ ...addressForm, address1: e.target.value })}
                    className="profile-form-input"
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <input
                      type="text"
                      placeholder="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="profile-form-input"
                    />
                    <select
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="profile-form-input"
                    >
                      <option value="" disabled>Select state</option>
                      {indianStates.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="profile-form-input"
                  />
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button className="profile-update-btn" onClick={handleAddAddress}>Save Address</button>
                    <button className="profile-address-delete" onClick={() => setShowAddressForm(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            <button className="profile-add-address-btn" onClick={() => setShowAddressForm(true)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Add New Address
            </button>
          </div>
        )}

        {/* ===== Settings Tab ===== */}
        {activeTab === "Settings" && (
          <div className="profile-settings">
            <div className="profile-settings-card">
              <h3 className="profile-settings-title">Personal Information</h3>
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label className="profile-form-label">Full Name</label>
                  <input
                    type="text"
                    className="profile-form-input"
                    placeholder="Enter your name"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  />
                </div>
                <div className="profile-form-group">
                  <label className="profile-form-label">Email</label>
                  <input
                    type="email"
                    className="profile-form-input"
                    placeholder="Enter your email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="profile-form-row">
                <div className="profile-form-group">
                  <label className="profile-form-label">Phone</label>
                  <input
                    type="tel"
                    className="profile-form-input"
                    placeholder="+91"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
              </div>
              <button className="profile-update-btn" onClick={handleUpdateProfile} disabled={profileSaving}>
                {profileSaving ? "Saving..." : "Update Profile"}
              </button>
            </div>

            <div className="profile-settings-card">
              <h3 className="profile-settings-title">Preferences</h3>
              <div className="profile-pref-row">
                <div className="profile-pref-info">
                  <p className="profile-pref-name">Order Updates</p>
                  <p className="profile-pref-desc">Receive notifications about your orders</p>
                </div>
                <label className="profile-toggle">
                  <input
                    type="checkbox"
                    checked={preferences.orderUpdates}
                    onChange={(e) => handlePreferenceChange("orderUpdates", e.target.checked)}
                  />
                  <span className="profile-toggle-slider"></span>
                </label>
              </div>
              <div className="profile-pref-row">
                <div className="profile-pref-info">
                  <p className="profile-pref-name">Promotions</p>
                  <p className="profile-pref-desc">Get exclusive deals and offers</p>
                </div>
                <label className="profile-toggle">
                  <input
                    type="checkbox"
                    checked={preferences.promotions}
                    onChange={(e) => handlePreferenceChange("promotions", e.target.checked)}
                  />
                  <span className="profile-toggle-slider"></span>
                </label>
              </div>
              <div className="profile-pref-row">
                <div className="profile-pref-info">
                  <p className="profile-pref-name">Newsletter</p>
                  <p className="profile-pref-desc">Ayurvedic tips and product updates</p>
                </div>
                <label className="profile-toggle">
                  <input
                    type="checkbox"
                    checked={preferences.newsletter}
                    onChange={(e) => handlePreferenceChange("newsletter", e.target.checked)}
                  />
                  <span className="profile-toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="profile-settings-card">
              <h3 className="profile-settings-title">Referral Program</h3>
              <p className="profile-referral-desc">Share your code and earn &#8377;200 for each friend&apos;s first order</p>
              <div className="profile-referral-box">
                <span className="profile-referral-code">{referralCode || "Loading..."}</span>
                <button className="profile-referral-copy" onClick={handleCopyReferral} disabled={!referralCode}>
                  {referralCopied ? "Copied!" : "Copy"}
                </button>
              </div>
              {referralCode && (
                <div className="profile-referral-share">
                  <a
                    href={`https://wa.me/?text=Use%20my%20referral%20code%20${referralCode}%20on%20Cleanse%20Ayurveda%20and%20get%20a%20discount!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-share-btn profile-share-whatsapp"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:?subject=Cleanse%20Ayurveda%20Referral&body=Use%20my%20referral%20code%20${referralCode}%20on%20Cleanse%20Ayurveda%20and%20get%20a%20discount!`}
                    className="profile-share-btn profile-share-email"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M22 7l-10 6L2 7" />
                    </svg>
                    Email
                  </a>
                </div>
              )}
            </div>

            <button className="profile-signout-btn" onClick={handleSignOut}>Sign Out</button>
          </div>
        )}
      </section>
    </div>
  );
}
