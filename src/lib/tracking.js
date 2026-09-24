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
// Server side: each Meta event (except later SPA PageViews, which the pixel
// fires itself without an eventID) is also queued to our API at /api/ev, which
// forwards it through the Meta Conversions API with the same event_id. Purchase
// is sent by the backend when the order is created (event_id purchase_<orderId>).
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

// ── Meta Conversions API relay ──

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://d6mvnylha0j3u.cloudfront.net/api").replace(/\/+$/, "");
const FBC_KEY = "cleanse_trk_fbc";
const FLUSH_MS = 1000;

function readCookie(name) {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return m ? decodeURIComponent(m[1]) : undefined;
  } catch {
    return undefined;
  }
}

// _fbc is set by the pixel when a visitor lands from a Meta ad (?fbclid=...).
// If the pixel is blocked, build the same value ourselves and keep it.
function getFbc() {
  const cookie = readCookie("_fbc");
  if (cookie) return cookie;
  try {
    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (fbclid) {
      const fbc = `fb.1.${Date.now()}.${fbclid}`;
      localStorage.setItem(FBC_KEY, fbc);
      return fbc;
    }
    return localStorage.getItem(FBC_KEY) || undefined;
  } catch {
    return undefined;
  }
}

// Browser identifiers the backend forwards to Meta. Also sent with checkout /
// order requests so the server-side Purchase can be matched to the ad click.
export function getMetaTrackingPayload() {
  if (!isBrowser()) return undefined;
  return compact({
    fbp: readCookie("_fbp"),
    fbc: getFbc(),
    clientId: getClientId(),
    sessionId: getSession().id,
    sourceUrl: window.location.href,
  });
}

let relayQueue = [];
let relayTimer = null;

function flushServerEvents() {
  if (relayTimer) {
    clearTimeout(relayTimer);
    relayTimer = null;
  }
  if (!relayQueue.length) return;
  const events = relayQueue;
  relayQueue = [];
  let token;
  try {
    token = localStorage.getItem("accessToken") || undefined;
  } catch {
    /* ignore */
  }
  const body = JSON.stringify(compact({ t: token, tracking: getMetaTrackingPayload(), events }));
  const url = `${API_BASE}/ev`;
  try {
    // text/plain keeps this a "simple" request (no CORS preflight), and
    // sendBeacon survives the tab closing right after an event.
    const blob = new Blob([body], { type: "text/plain" });
    if (navigator.sendBeacon && navigator.sendBeacon(url, blob)) return;
    fetch(url, { method: "POST", body, headers: { "Content-Type": "text/plain" }, keepalive: true }).catch(() => {});
  } catch {
    /* tracking must never break the page */
  }
}

function queueServerEvent(eventName, eventId, customData) {
  relayQueue.push({
    event_name: eventName,
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: window.location.href,
    custom_data: customData,
  });
  if (relayQueue.length >= 10) flushServerEvents();
  else if (!relayTimer) relayTimer = setTimeout(flushServerEvents, FLUSH_MS);
}

if (isBrowser()) {
  window.addEventListener("pagehide", flushServerEvents);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushServerEvents();
  });
}

// ── Core send ──

// relay: also send this event to our API for the Meta Conversions API, which
// still reaches Meta when an ad blocker stops the browser pixel. Same eventID
// on both, so Meta keeps one copy. Purchase is sent by the backend itself.
function send({ gtmEvent, metaEvent, ecommerce, metaParams, extra, userOverride, skipMeta, eventId: fixedEventId, relay = true }) {
  if (!isBrowser()) return;
  initTracking();
  const eventId = fixedEventId || uid();
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
      const customData = { ...metaParams, session_id: session.id };
      window.fbq("track", metaEvent, customData, { eventID: eventId });
      if (relay) queueServerEvent(metaEvent, eventId, customData);
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
    // Must match the backend's Conversions API Purchase (metaCapi.service.js)
    // so Meta counts the order once. The backend sends it, so no relay here.
    eventId: orderId ? `purchase_${orderId}` : undefined,
    relay: false,
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
