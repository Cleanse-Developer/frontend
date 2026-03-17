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

// ── Bundles ──
export const bundleApi = {
  getAll: (params) => api.get("/bundles", { params }).then((r) => r.data.data),
  getBySlug: (slug) => api.get(`/bundles/${slug}`).then((r) => r.data.data),
};

// ── Cart (pricing preview) ──
export const cartPricingApi = {
  preview: (couponCode, giftWrap) =>
    api.post("/cart/preview-pricing", { couponCode, giftWrap }).then((r) => r.data.data.pricing),
};

// ── Guest pricing (public, no auth) ──
export const guestPricingApi = {
  calculate: (items, couponCode, giftWrap) =>
    api.post("/pricing/guest", { items, couponCode, giftWrap }).then((r) => r.data.data.pricing),
};

// ── Blogs ──
export const blogApi = {
  getAll: (params) => api.get("/blogs", { params }).then((r) => r.data.data),
  getBySlug: (slug) => api.get(`/blogs/${slug}`).then((r) => r.data.data),
};

// ── Auth ──
export const authApi = {
  sendOtp: (identifier) => api.post("/auth/send-otp", { identifier }).then((r) => r.data),
  verifyOtp: (identifier, otp) =>
    api.post("/auth/verify-otp", { identifier, otp }).then((r) => r.data),
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

// ── Payments ──
export const paymentApi = {
  createRazorpay: (data) =>
    api.post("/payments/razorpay/create", data).then((r) => r.data.data),
  verifyRazorpay: (data) =>
    api.post("/payments/razorpay/verify", data).then((r) => r.data.data),
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

// ── Reviews ──
export const reviewApi = {
  getForProduct: (productId, params) =>
    api
      .get(`/products/${productId}/reviews`, { params })
      .then((r) => r.data.data),
  create: (data) => api.post("/reviews", data).then((r) => r.data.data),
};

// ── Shipping ──
export const shippingApi = {
  checkDelivery: (pincode) =>
    api.post("/shipping/check-delivery", { pincode }).then((r) => r.data.data),
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
};

// ── Loyalty ──
export const loyaltyApi = {
  getBalance: () => api.get("/loyalty/balance").then((r) => r.data.data),
};

// ── Testimonials ──
export const testimonialApi = {
  getAll: (params) =>
    api.get("/testimonials", { params }).then((r) => r.data.data),
};

// ── Spin Wheel ──
export const spinWheelApi = {
  spin: (email) =>
    api.post("/spin-wheel", { email }).then((r) => r.data.data),
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
