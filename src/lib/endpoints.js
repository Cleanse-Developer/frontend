import api from "./api";

// ── Products ──
export const productApi = {
  getAll: (params) => api.get("/products", { params }).then((r) => r.data.data),
  getBySlug: (slug) => api.get(`/products/${slug}`).then((r) => r.data.data),
  getRelated: (id) =>
    api.get(`/products/${id}/related`).then((r) => r.data.data),
  search: (q) =>
    api.get("/products/search", { params: { q } }).then((r) => r.data.data),
};

// ── Categories ──
export const categoryApi = {
  list: () => api.get("/categories").then((r) => r.data.data.categories),
};

// ── Bundles ──
export const bundleApi = {
  getAll: (params) => api.get("/bundles", { params }).then((r) => r.data.data),
  // The single admin-selected bundle for the homepage section.
  getFeatured: () => api.get("/bundles/featured").then((r) => r.data.data),
  getBySlug: (slug) => api.get(`/bundles/${slug}`).then((r) => r.data.data),
};

// ── Cart (pricing preview) ──
// opts carries { paymentMethod, pincode, state } so the preview reflects the
// per-method (COD vs prepaid) delivery charge and the delivery zone.
export const cartPricingApi = {
  preview: (couponCode, giftWrap, specialCouponCode, loyaltyPointsToRedeem = 0, opts = {}) =>
    api
      .post("/cart/preview-pricing", {
        couponCode,
        giftWrap,
        specialCouponCode,
        loyaltyPointsToRedeem,
        paymentMethod: opts.paymentMethod,
        pincode: opts.pincode,
        state: opts.state,
      })
      .then((r) => r.data.data.pricing),
};

// ── Guest pricing (public, no auth) ──
export const guestPricingApi = {
  calculate: (items, couponCode, giftWrap, specialCouponCode, opts = {}) =>
    api
      .post("/pricing/guest", {
        items,
        couponCode,
        giftWrap,
        specialCouponCode,
        paymentMethod: opts.paymentMethod,
        pincode: opts.pincode,
        state: opts.state,
      })
      .then((r) => r.data.data.pricing),
};

// ── Blogs ──
export const blogApi = {
  getAll: (params) => api.get("/blogs", { params }).then((r) => r.data.data),
  getBySlug: (slug) => api.get(`/blogs/${slug}`).then((r) => r.data.data),
};

// ── Auth ──
export const authApi = {
  sendOtp: (identifier) => api.post("/auth/send-otp", { identifier }).then((r) => r.data),
  verifyOtp: (identifier, otp, referralCode) =>
    api
      .post("/auth/verify-otp", {
        identifier,
        otp,
        ...(referralCode ? { referralCode } : {}),
      })
      .then((r) => r.data),
  verifyWidgetToken: (accessToken, phone, referralCode) =>
    api
      .post("/auth/verify-widget-token", {
        accessToken,
        phone,
        ...(referralCode ? { referralCode } : {}),
      })
      .then((r) => r.data),
  googleAuth: (code, referralCode) =>
    api
      .post("/auth/google", { code, ...(referralCode ? { referralCode } : {}) })
      .then((r) => r.data),
  linkPhone: (accessToken, phone) =>
    api.post("/auth/link-phone", { accessToken, phone }).then((r) => r.data),
  linkEmail: (email) =>
    api.post("/auth/link-email", { email }).then((r) => r.data),
  loginWithPassword: (email, password) =>
    api.post("/auth/login", { email, password }).then((r) => r.data),
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  refresh: () => api.post("/auth/refresh").then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  checkAccount: (email, phone) =>
    api.post("/auth/check-account", { email, phone }).then((r) => r.data.data),
};

// ── Cart ──
export const cartApi = {
  get: () => api.get("/cart").then((r) => r.data.data),
  addItem: (productId, quantity, selectedSize) =>
    api
      .post("/cart/items", { productId, quantity, selectedSize })
      .then((r) => r.data.data),
  updateItem: (itemId, quantity) =>
    api.patch(`/cart/items/${itemId}`, { quantity }).then((r) => r.data.data),
  removeItem: (itemId) =>
    api.delete(`/cart/items/${itemId}`).then((r) => r.data.data),
  clear: () => api.post("/cart/clear").then((r) => r.data.data),
};

// ── Orders ──
export const orderApi = {
  placeOrder: (data) => api.post("/orders", data).then((r) => r.data.data),
  getMyOrders: () => api.get("/orders/my-orders").then((r) => r.data.data),
  requestReturn: (orderId, reason) =>
    api.post(`/orders/${orderId}/return`, { reason }).then((r) => r.data.data),
  reorder: (orderId) =>
    api.post(`/orders/${orderId}/reorder`).then((r) => r.data.data),
};

// ── Payments (legacy -- kept for backward compat) ──
export const paymentApi = {
  createRazorpay: (data) =>
    api.post("/payments/razorpay/create", data).then((r) => r.data.data),
  verifyRazorpay: (data) =>
    api.post("/payments/razorpay/verify", data).then((r) => r.data.data),
};

// ── Checkout (Razorpay two-phase flow) ──
export const checkoutApi = {
  initiate: (data) =>
    api.post("/checkout/initiate", data).then((r) => r.data.data),
  confirm: (data) =>
    api.post("/checkout/confirm", data).then((r) => r.data.data),
};

// ── User ──
export const userApi = {
  getProfile: () => api.get("/user/profile").then((r) => r.data.data),
  updateProfile: (data) =>
    api.patch("/user/profile", data).then((r) => r.data.data),
  updatePreferences: (data) =>
    api.patch("/user/preferences", data).then((r) => r.data.data),
};

// ── Addresses ──
export const addressApi = {
  getAll: () => api.get("/addresses").then((r) => r.data.data),
  create: (data) => api.post("/addresses", data).then((r) => r.data.data),
  update: (id, data) =>
    api.patch(`/addresses/${id}`, data).then((r) => r.data.data),
  delete: (id) => api.delete(`/addresses/${id}`).then((r) => r.data.data),
};

// ── Wishlist ──
export const wishlistApi = {
  get: () => api.get("/wishlist").then((r) => r.data.data),
  add: (productId) =>
    api.post(`/wishlist/${productId}`).then((r) => r.data.data),
  remove: (productId) =>
    api.delete(`/wishlist/${productId}`).then((r) => r.data.data),
};

// ── Coupons ──
export const couponApi = {
  validate: (code, cartSubtotal) =>
    api.post("/coupons/validate", { code, cartSubtotal }).then((r) => r.data.data),
  getMyCoupons: () => api.get("/coupons/my-coupons").then((r) => r.data.data),
};

// ── Special Coupons ──
export const specialCouponApi = {
  validate: (code, cartSubtotal) =>
    api.post("/special-coupons/validate", { code, cartSubtotal }).then((r) => r.data.data),
  getActivePromotions: () =>
    api.get("/special-coupons/active-promotions").then((r) => r.data.data),
};

// ── Reviews ──
export const reviewApi = {
  getForProduct: (productId, params) =>
    api
      .get(`/products/${productId}/reviews`, { params })
      .then((r) => r.data.data),
  create: (data) => api.post("/reviews", data).then((r) => r.data.data),
  update: (id, data) => api.patch(`/reviews/${id}`, data).then((r) => r.data.data),
  delete: (id) => api.delete(`/reviews/${id}`).then((r) => r.data),
  getMine: (params) => api.get("/reviews/me", { params }).then((r) => r.data.data),
};

// ── Shipping ──
export const shippingApi = {
  checkDelivery: (pincode) =>
    api.post("/shipping/check-delivery", { pincode }).then((r) => r.data.data),
  getConfig: (params) =>
    api.get("/shipping/config", { params }).then((r) => r.data.data),
};

// ── Newsletter ──
export const newsletterApi = {
  subscribe: (email, source = "popup") =>
    api.post("/newsletter/subscribe", { email, source }).then((r) => r.data),
};

// ── Contact ──
export const contactApi = {
  submit: (data) => api.post("/contact", data).then((r) => r.data),
};

// ── Referral ──
export const referralApi = {
  getCode: () => api.get("/referral/code").then((r) => r.data.data),
  validate: (code) =>
    api.post("/referral/validate", { code }).then((r) => r.data.data),
  getHistory: (params) =>
    api.get("/referral/history", { params }).then((r) => r.data.data),
};

// ── Loyalty ──
export const loyaltyApi = {
  getBalance: () => api.get("/loyalty/balance").then((r) => r.data.data),
  getTransactions: (params) =>
    api.get("/loyalty/transactions", { params }).then((r) => r.data.data),
  getMaxRedeemable: (subtotal) =>
    api
      .get("/loyalty/max-redeemable", { params: { subtotal } })
      .then((r) => r.data.data),
  previewRedeem: (points, subtotal) =>
    api
      .post("/loyalty/redeem/preview", { points, subtotal })
      .then((r) => r.data.data),
};

// ── Testimonials ──
export const testimonialApi = {
  getAll: (params) =>
    api.get("/testimonials", { params }).then((r) => r.data.data),
};

// ── Spin Wheel ──
export const spinWheelApi = {
  getPrizes: () => api.get("/spin-wheel/prizes").then((r) => r.data.data),
  check: (email) =>
    api.get("/spin-wheel/check", { params: { email } }).then((r) => r.data.data),
  // Spin anonymously — returns { prize, spinToken }. No email required.
  spin: () => api.post("/spin-wheel").then((r) => r.data.data),
  // Claim the spun reward against an email using the token from spin().
  claim: (email, spinToken) =>
    api.post("/spin-wheel/claim", { email, spinToken }).then((r) => r.data.data),
};

// ── Social Proof ──
export const socialProofApi = {
  getRecentPurchases: (limit = 8) =>
    api
      .get("/social-proof/recent-purchases", { params: { limit } })
      .then((r) => r.data.data),
};

// ── Settings ──
export const settingsApi = {
  getPublic: () => api.get("/settings/public").then((r) => r.data.data),
};
