// Analytics service: Google Tag Manager + Meta Pixel.
//
// Every event goes to BOTH tags from one call, sharing the same event_id (so a
// future server-side Conversions API can dedupe against it) and the same
// session_id / client_id (so every event in a visit links back to one session).
//
// GTM receives GA4-style ecommerce events on window.dataLayer
// (page_view, view_item, add_to_cart, begin_checkout, add_payment_info, purchase). In the GTM container, fire GA4
// event tags on those Custom Event triggers and read `ecommerce`, `session_id`,
// `client_id`, `event_id` and `user_data` as Data Layer Variables.
//
// Meta receives the standard events PageView, ViewContent, AddToCart,
// InitiateCheckout, AddPaymentInfo and Purchase, with advanced matching (email/phone/name/external_id) applied
// through fbq('init') once we know who the user is. Meta hashes those values
// in the browser before sending them. Two fbevents.js rules shape this file:
// one manual PageView per page load (see trackPageView) and user data can only
// be filled in once after init (see identifyPixel).

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "GTM-MQN2C2VT";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "662202292509283";
const CURRENCY = "INR";

const CLIENT_KEY = "cleanse_trk_cid";
const SESSION_KEY = "cleanse_trk_session";
const PURCHASE_KEY = "cleanse_trk_purchases";
// Same idle timeout GA4 uses: 30 minutes without an event starts a new session.
const SESSION_IDLE_MS = 30 * 60 * 1000;

const isBrowser = () => typeof window !== "undefined";

let initialized = false;
let currentUser = null; // normalized advanced-matching data for the signed-in user
let lastPageViewPath = null;
let metaPageViewSent = false;

function uid() {
  if (isBrowser() && window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function readJSON(storage, key) {
  try {
    return JSON.parse(storage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function writeJSON(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked (private mode): ids just won't persist */
  }
}

// Anonymous, persistent browser id. Used as Meta external_id for guests so a
// guest's events still link together across sessions.
let memoryClientId = null;
export function getClientId() {
  if (!isBrowser()) return null;
  try {
    let id = localStorage.getItem(CLIENT_KEY);
    if (!id) {
      id = uid();
      localStorage.setItem(CLIENT_KEY, id);
    }
    return id;
  } catch {
    memoryClientId = memoryClientId || uid();
    return memoryClientId;
  }
}

// Session id, rolled over after 30 minutes of inactivity. Stored in
// localStorage (not sessionStorage) so several tabs of one visit share it.
let memorySession = null;
export function getSession() {
  if (!isBrowser()) return { id: null, number: 0, isNew: false };
  const now = Date.now();
  let s = null;
  try {
    s = readJSON(localStorage, SESSION_KEY);
  } catch {
    /* storage blocked */
  }
  s = s || memorySession;
  let isNew = false;
  if (!s || !s.id || now - (s.lastSeen || 0) > SESSION_IDLE_MS) {
    s = { id: uid(), number: (s?.number || 0) + 1, startedAt: now };
    isNew = true;
  }
  s.lastSeen = now;
  memorySession = s;
  try {
    writeJSON(localStorage, SESSION_KEY, s);
  } catch {
    /* storage blocked: memorySession keeps the id for this page load */
  }
  return { id: s.id, number: s.number, isNew };
}

function loadGtm() {
  window.dataLayer = window.dataLayer || [];
  if (document.getElementById("gtm-script")) return;
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.id = "gtm-script";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(s);
}

function loadMetaPixel() {
  if (window.fbq) return;
  const n = function (...args) {
    if (n.callMethod) n.callMethod(...args);
    else n.queue.push(args);
  };
  window.fbq = n;
  if (!window._fbq) window._fbq = n;
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
}

// Load both tag scripts once. Safe to call repeatedly. The pixel's fbq('init')
// is deferred to identifyPixel() so the first init already carries the user's
// matching data once auth has resolved.
export function initTracking() {
  if (!isBrowser() || initialized) return;
  initialized = true;
  try {
    loadGtm();
    loadMetaPixel();
  } catch (err) {
    console.warn("[tracking] init failed", err);
  }
}

// fbevents.js only accepts user data on a repeat fbq('init') while the pixel
// has none yet; otherwise it ignores the call and logs DUPLICATE_PIXEL_ID. So a
// guest starts with empty matching data, which leaves room for exactly one
// update when they log in (or reach checkout) later in the same page load.
let pixelInitialized = false;
let pixelHasUserData = false;
function identifyPixel(user) {
  const data = metaMatching(user);
  const hasData = Object.keys(data).length > 0;
  if (!pixelInitialized) {
    window.fbq("init", META_PIXEL_ID, data);
    pixelInitialized = true;
    pixelHasUserData = hasData;
  } else if (!pixelHasUserData && hasData) {
    window.fbq("init", META_PIXEL_ID, data);
    pixelHasUserData = true;
  }
}

// ── User data ──

function splitName(fullName) {
  const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  return { firstName: parts[0], lastName: parts.length > 1 ? parts[parts.length - 1] : undefined };
}

// Digits only, with country code, as Meta expects ("919876543210").
function normalizePhone(phone, countryCode = "+91") {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return undefined;
  const cc = String(countryCode || "").replace(/\D/g, "");
  if (digits.length > 10 && cc && digits.startsWith(cc)) return digits;
  return `${cc}${digits}`;
}

function normalizeUser(user) {
  if (!user) return null;
  const { firstName, lastName } = splitName(user.fullName || user.name);
  const data = {
    id: user._id || user.id || undefined,
    email: user.email ? String(user.email).trim().toLowerCase() : undefined,
    phone: normalizePhone(user.phone, user.countryCode),
    firstName: firstName?.toLowerCase(),
    lastName: lastName?.toLowerCase(),
  };
  return Object.values(data).some(Boolean) ? data : null;
}

function compact(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ""));
}

// Meta advanced-matching keys. Empty for guests on purpose (see identifyPixel);
// guest events are still linked by the session_id custom parameter.
function metaMatching(user) {
  return compact({
    em: user?.email,
    ph: user?.phone,
    fn: user?.firstName,
    ln: user?.lastName,
    external_id: user?.id,
  });
}

// GTM user_data (GA4 user-provided-data field names).
function gtmUserData(user) {
  if (!user) return undefined;
  return compact({
    email: user.email,
    phone_number: user.phone ? `+${user.phone}` : undefined,
    address: user.firstName ? compact({ first_name: user.firstName, last_name: user.lastName }) : undefined,
  });
}

// Call whenever the signed-in user changes (null on logout).
export function setTrackingUser(user) {
  if (!isBrowser()) return;
  initTracking();
  const next = normalizeUser(user);
  if (pixelInitialized && JSON.stringify(next) === JSON.stringify(currentUser)) return;
  const hadUser = !!currentUser;
  currentUser = next;
  try {
    identifyPixel(currentUser);
    if (!currentUser && !hadUser) return; // anonymous from the start: nothing to announce
    window.dataLayer.push({
      event: currentUser ? "user_identified" : "user_logged_out",
      user_id: currentUser?.id || null,
      user_data: gtmUserData(currentUser) || null,
    });
  } catch (err) {
    console.warn("[tracking] setUser failed", err);
  }
}

// ── Core send ──

function send({ gtmEvent, metaEvent, ecommerce, metaParams, extra, userOverride, skipMeta }) {
  if (!isBrowser()) return;
  initTracking();
  const eventId = uid();
  const session = getSession();
  const user = userOverride ? { ...currentUser, ...userOverride } : currentUser;
  try {
    if (userOverride || !pixelInitialized) identifyPixel(user);
    if (ecommerce) window.dataLayer.push({ ecommerce: null }); // clear previous ecommerce object
    window.dataLayer.push(
      compact({
        event: gtmEvent,
        event_id: eventId,
        session_id: session.id,
        session_number: session.number,
        client_id: getClientId(),
        user_id: user?.id,
        user_data: gtmUserData(user),
        ecommerce,
        ...extra,
      })
    );
    if (!skipMeta) {
      window.fbq(
        "track",
        metaEvent,
        { ...metaParams, session_id: session.id },
        { eventID: eventId }
      );
    }
  } catch (err) {
    console.warn(`[tracking] ${gtmEvent} failed`, err);
  }
}

// ── Item helpers ──

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function categoryName(category) {
  if (!category) return undefined;
  if (typeof category === "string") return /^[a-f0-9]{24}$/i.test(category) ? undefined : category;
  return category.name || undefined;
}

function variantLabel(variant) {
  if (!variant) return undefined;
  return typeof variant === "object" ? variant.label : String(variant);
}

function toItem({ id, name, price, quantity = 1, variant, category }) {
  return compact({
    // Some legacy buttons pass a product without an id; fall back to the name
    // so Meta's content_ids is never empty.
    item_id: id ? String(id) : name || undefined,
    item_name: name,
    item_variant: variant,
    item_category: category,
    price: toNumber(price),
    quantity: toNumber(quantity) || 1,
  });
}

function metaContents(items) {
  return items.map((i) => ({ id: i.item_id, quantity: i.quantity, item_price: i.price }));
}

// ── Public events ──

export function trackPageView(path) {
  if (!isBrowser()) return;
  const url = path || window.location.pathname + window.location.search;
  if (url === lastPageViewPath) return; // guard against double-fire on re-render
  lastPageViewPath = url;
  // fbevents.js accepts only ONE manual PageView per page load and silently
  // drops the rest. For client-side route changes it fires its own automatic
  // PageView from a history.pushState hook, so Meta gets the landing PageView
  // from us and every later one from the pixel itself. GTM gets all of them.
  const skipMeta = metaPageViewSent;
  metaPageViewSent = true;
  send({
    gtmEvent: "page_view",
    metaEvent: "PageView",
    skipMeta,
    extra: {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
      page_referrer: document.referrer || undefined,
    },
  });
}

// product: normalized product; variant: selected size object or label (optional)
export function trackProductView(product, variant) {
  if (!product) return;
  const v = variant || product.sizes?.[0];
  const price = toNumber((typeof v === "object" && v?.price) ?? product.price);
  const item = toItem({
    id: product._id,
    name: product.name,
    price,
    variant: variantLabel(v),
    category: categoryName(product.category),
  });
  send({
    gtmEvent: "view_item",
    metaEvent: "ViewContent",
    ecommerce: { currency: CURRENCY, value: price, items: [item] },
    metaParams: {
      content_ids: [item.item_id],
      content_name: product.name,
      content_category: item.item_category,
      content_type: "product",
      contents: metaContents([item]),
      value: price,
      currency: CURRENCY,
    },
  });
}

export function trackAddToCart(product, { variant, price, quantity = 1 } = {}) {
  if (!product) return;
  const item = toItem({
    id: product._id || product.productId,
    name: product.name,
    price,
    quantity,
    variant: variantLabel(variant),
    category: categoryName(product.category),
  });
  const value = item.price * item.quantity;
  send({
    gtmEvent: "add_to_cart",
    metaEvent: "AddToCart",
    ecommerce: { currency: CURRENCY, value, items: [item] },
    metaParams: {
      content_ids: [item.item_id],
      content_name: product.name,
      content_type: "product",
      contents: metaContents([item]),
      value,
      currency: CURRENCY,
    },
  });
}

// Checkout events share the cart -> items mapping.
function cartToItems(cartItems) {
  return (cartItems || []).map((i) =>
    toItem({
      id: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      variant: i.selectedSize,
    })
  );
}

function checkoutEvent({ gtmEvent, metaEvent, cartItems, value, extra, metaExtra }) {
  const items = cartToItems(cartItems);
  if (items.length === 0) return;
  const total = toNumber(value) || items.reduce((n, i) => n + i.price * i.quantity, 0);
  send({
    gtmEvent,
    metaEvent,
    ecommerce: { currency: CURRENCY, value: total, items },
    extra,
    metaParams: {
      content_ids: items.map((i) => i.item_id),
      content_type: "product",
      contents: metaContents(items),
      num_items: items.reduce((n, i) => n + i.quantity, 0),
      value: total,
      currency: CURRENCY,
      ...metaExtra,
    },
  });
}

// Checkout page opened with a non-empty bag. Fires once per checkout visit.
export function trackInitiateCheckout(cartItems, value) {
  checkoutEvent({ gtmEvent: "begin_checkout", metaEvent: "InitiateCheckout", cartItems, value });
}

// "Place order" pressed with a payment method chosen (COD or online).
export function trackAddPaymentInfo(cartItems, value, paymentMethod) {
  checkoutEvent({
    gtmEvent: "add_payment_info",
    metaEvent: "AddPaymentInfo",
    cartItems,
    value,
    extra: { payment_type: paymentMethod },
    metaExtra: { payment_method: paymentMethod },
  });
}

// Fire at most once per order id per browser, so a re-render or a retried
// confirm path can't double-count revenue.
function alreadyTracked(orderId) {
  try {
    const seen = readJSON(localStorage, PURCHASE_KEY) || [];
    if (seen.includes(orderId)) return true;
    writeJSON(localStorage, PURCHASE_KEY, [...seen, orderId].slice(-50));
  } catch {
    /* ignore */
  }
  return false;
}

// order: the order object returned by the API. contact: checkout contact info
// ({ fullName, email, phone, countryCode }), used for matching when the account
// is missing those fields.
export function trackPurchase(order, contact) {
  if (!order) return;
  const orderId = String(order.orderId || order._id || "");
  if (orderId && alreadyTracked(orderId)) return;

  const items = (order.items || []).map((i) =>
    toItem({
      id: i.product?._id || i.product,
      name: i.name || i.product?.name,
      price: i.price,
      quantity: i.quantity,
      variant: i.selectedSize,
    })
  );
  const pricing = order.pricing || {};
  const value = toNumber(pricing.total ?? order.total);
  const contactUser = normalizeUser(contact);

  send({
    gtmEvent: "purchase",
    metaEvent: "Purchase",
    userOverride: contactUser
      ? compact({ ...contactUser, id: currentUser?.id || contactUser.id })
      : undefined,
    ecommerce: compact({
      transaction_id: orderId,
      currency: CURRENCY,
      value,
      shipping: toNumber(pricing.shippingCost),
      coupon: pricing.couponCode,
      items,
    }),
    extra: { payment_method: order.paymentMethod || order.payment?.method },
    metaParams: {
      content_ids: items.map((i) => i.item_id),
      content_type: "product",
      contents: metaContents(items),
      num_items: items.reduce((n, i) => n + i.quantity, 0),
      value,
      currency: CURRENCY,
      order_id: orderId,
    },
  });
}

export const TRACKING_IDS = { GTM_ID, META_PIXEL_ID };
