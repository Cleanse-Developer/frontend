// Analytics service: Google (Tag Manager and/or gtag.js) + Meta Pixel.
//
// This is the ONLY module that talks to window.dataLayer / gtag / fbq. Page code
// calls the track* helpers; nothing else touches a tag directly, which is what
// keeps Google and Meta reporting the same items, currency and value.
//
// Every event goes to BOTH platforms from one call, sharing the same event_id (so
// the server-side Conversions API can dedupe against it) and the same
// session_id / client_id (so every event in a visit links back to one session).
//
// Google. NEXT_PUBLIC_GTM_ID is a comma/space separated list and each ID is routed
// by its prefix (they are NOT interchangeable):
//   GTM-*          a Tag Manager container. Events are dataLayer pushes with an
//                  `event` key + a nested `ecommerce` object; the tags/triggers
//                  live in the container UI (Custom Event triggers; read
//                  `ecommerce`, `session_id`, `client_id`, `event_id`, `user_data`
//                  as Data Layer Variables).
//   GT-* G-* AW-*  a Google tag (gtag.js). GA4 here only reacts to gtag() calls;
//                  a bare dataLayer.push({event}) is ignored and the ecommerce
//                  payload is flat. gtag.js loads once, then one `config` per ID.
// sendGoogle() is the one place that difference is handled and can feed both.
//
// Server side: each Meta event the backend accepts (PageView, ViewContent,
// AddToCart, InitiateCheckout, AddPaymentInfo; later SPA PageViews are skipped
// because the pixel fires those itself without an eventID) is also queued to our
// API at /api/ev, which forwards it through the Meta Conversions API with the same
// event_id. Purchase is sent by the backend when the order is created
// (event_id purchase_<orderId>). Search / Lead / Login / CompleteRegistration are
// browser-pixel only: the backend would drop them.
//
// Meta receives the standard events PageView, ViewContent, AddToCart,
// InitiateCheckout, AddPaymentInfo, Purchase, Search, Lead and CompleteRegistration
// (plus a custom Login), with advanced matching (email/phone/name/external_id) applied
// through fbq('init') once we know who the user is. Meta hashes those values
// in the browser before sending them. Two fbevents.js rules shape this file:
// one manual PageView per page load (see trackPageView) and user data can only
// be filled in once after init (see identifyPixel).
//
// Env: NEXT_PUBLIC_GTM_ID, NEXT_PUBLIC_META_PIXEL_ID, NEXT_PUBLIC_CURRENCY,
// NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL, NEXT_PUBLIC_ANALYTICS_DEV,
// NEXT_PUBLIC_ANALYTICS_DEBUG. See docs/ANALYTICS.md.

import { cardPrice, defaultVariant, toNum } from "@/lib/formatters";

/** Split a comma/space separated env list into clean, unique IDs. */
const parseIds = (raw) =>
  Array.from(new Set((raw || "").split(/[,\s]+/).map((s) => s.trim()).filter(Boolean)));

// Falls back to the production container so a build without the env var still
// measures (this is what the committed .next ships).
const GOOGLE_TAG_IDS = parseIds(
  process.env.NEXT_PUBLIC_GTM_ID || process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || "GTM-MQN2C2VT"
);
/** Tag Manager containers: loaded via gtm.js, fed by dataLayer pushes. */
const GTM_IDS = GOOGLE_TAG_IDS.filter((id) => /^GTM-/i.test(id));
/** Google tags / GA4 / Google Ads: loaded via gtag.js, fed by gtag('event'). */
const GTAG_IDS = GOOGLE_TAG_IDS.filter((id) => !/^GTM-/i.test(id));
/**
 * The Google Ads destination, if configured. A GA4 `purchase` does NOT become an
 * Ads conversion by itself: either import it inside Ads, or set the conversion
 * LABEL below (the part after the slash in `send_to: 'AW-123/LABEL'`). Leave the
 * label blank when importing from GA4 — setting both counts every order twice.
 */
const GOOGLE_ADS_ID = GTAG_IDS.find((id) => /^AW-/i.test(id)) || "";
const GOOGLE_ADS_PURCHASE_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL || "";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "662202292509283";
const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "INR";

/**
 * Tags only load in a production build. Local dev otherwise pollutes the real GA4
 * property and the pixel's conversion data with test orders, which is very hard to
 * unpick afterwards. Set NEXT_PUBLIC_ANALYTICS_DEV=true to opt a dev machine in.
 */
export const analyticsEnabled =
  process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ANALYTICS_DEV === "true";

/** Console echo of every event. Opt-in: noisy by design. */
const DEBUG = process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === "true";

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

// Tags are live only in the browser, and only when analyticsEnabled (see above).
const tagsOn = () => isBrowser() && analyticsEnabled;

// Google's own gtag stub: events fired before gtag.js has executed are queued on
// the dataLayer and replayed when it boots. It must push the live `arguments`
// object: gtag.js reads array-likes with a `length`, a spread array is not
// processed the same way.
function gtag() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(arguments);
}

function loadGoogle() {
  window.dataLayer = window.dataLayer || [];

  // One gtm.js per container.
  for (const id of GTM_IDS) {
    const scriptId = `gtm-script-${id}`;
    if (document.getElementById(scriptId)) continue;
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    const s = document.createElement("script");
    s.id = scriptId;
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
    document.head.appendChild(s);
  }

  // gtag.js is fetched ONCE with the first ID; every further destination gets its
  // own `config`, after which a single gtag('event') reaches all of them. Loading
  // the script per ID would re-run the library and double-count page views.
  if (GTAG_IDS.length > 0 && !document.getElementById("gtag-script")) {
    window.gtag = window.gtag || gtag;
    gtag("js", new Date());
    for (const id of GTAG_IDS) gtag("config", id);
    const s = document.createElement("script");
    s.id = "gtag-script";
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GTAG_IDS[0]}`;
    document.head.appendChild(s);
  }
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
  if (!tagsOn() || initialized) return;
  initialized = true;
  try {
    loadGoogle();
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
  if (!tagsOn()) return;
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
//
// skipGoogle / skipMeta: send to one platform only (e.g. view_cart has no Meta
// equivalent). metaCustom: use fbq('trackCustom') for events Meta has no standard
// name for. relay is forced off for custom events (the backend only accepts the
// standard ones).
function send({
  gtmEvent,
  metaEvent,
  ecommerce,
  metaParams,
  extra,
  userOverride,
  skipMeta,
  skipGoogle,
  skipGtag,
  metaCustom,
  eventId: fixedEventId,
  relay = true,
}) {
  if (!tagsOn()) return;
  initTracking();
  const eventId = fixedEventId || uid();
  const session = getSession();
  const user = userOverride ? { ...currentUser, ...userOverride } : currentUser;
  try {
    if (userOverride || !pixelInitialized) identifyPixel(user);
    if (!skipGoogle) {
      sendGoogle(
        gtmEvent,
        compact({
          event_id: eventId,
          session_id: session.id,
          session_number: session.number,
          client_id: getClientId(),
          user_id: user?.id,
          user_data: gtmUserData(user),
          ...extra,
        }),
        ecommerce,
        { skipGtag }
      );
    }
    if (!skipMeta) {
      const customData = { ...metaParams, session_id: session.id };
      window.fbq(metaCustom ? "trackCustom" : "track", metaEvent, customData, { eventID: eventId });
      if (relay && !metaCustom) queueServerEvent(metaEvent, eventId, customData);
      if (DEBUG) console.debug("[tracking] meta:", metaEvent, customData, eventId);
    }
  } catch (err) {
    console.warn(`[tracking] ${gtmEvent || metaEvent} failed`, err);
  }
}

// One GA4 event through whichever Google loaders are configured; both can be
// active at once and each is skipped when it has no destinations.
//
// Container path: the `ecommerce: null` reset is not optional. dataLayer entries
// merge, so without it the `items` of a previous event leak into the next one and
// a purchase ends up reporting products from an earlier view_item.
//
// Google tag path: the same fields go out flat (gtag.js has no `ecommerce`
// wrapper and no merge behaviour to defend against). Our identity fields
// (client_id / session_id / user_id / user_data) stay container-only: GA4 treats a
// `client_id` parameter as an identity override and would split users, and gtag.js
// keeps its own session. One gtag('event') reaches every `config`-ed destination
// (a GA4 tag and an Ads ID do not need separate sends).
function sendGoogle(event, params, ecommerce, { skipGtag } = {}) {
  if (!event) return;
  if (GTM_IDS.length > 0) {
    window.dataLayer = window.dataLayer || [];
    if (ecommerce) window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({ event, ...params, ...(ecommerce ? { ecommerce } : {}) });
  }
  if (GTAG_IDS.length > 0 && !skipGtag) {
    /* eslint-disable no-unused-vars */
    const { user_id, user_data, client_id, session_id, session_number, ...flat } = params;
    /* eslint-enable no-unused-vars */
    gtag("event", event, { ...flat, ...(ecommerce || {}) });
  }
  if (DEBUG) console.debug("[tracking] google:", event, params, ecommerce);
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

function toItem({ id, name, price, quantity = 1, variant, category, index, listName }) {
  return compact({
    // Some legacy buttons pass a product without an id; fall back to the name
    // so Meta's content_ids is never empty.
    item_id: id ? String(id) : name || undefined,
    item_name: name,
    item_variant: variant,
    item_category: category,
    item_list_name: listName,
    index: Number.isInteger(index) ? index : undefined,
    price: toNumber(price),
    quantity: toNumber(quantity) || 1,
  });
}

const round2 = (v) => Math.round(toNumber(v) * 100) / 100;

/**
 * One GA4 `items[]` entry from a catalogue product (used for list impressions).
 * Price follows the cart's own rule (see formatters.cardPrice): the selected
 * variant's price when there is one, otherwise the cheapest variant, i.e. the price
 * the shopper was quoted on the card. Reporting the base price would make analytics
 * revenue disagree with what the bag charges.
 */
function itemFromProduct(product, { variant, index, listName } = {}) {
  if (!product) return null;
  const variantObj =
    variant && typeof variant === "object" && "price" in variant
      ? variant
      : (product.sizes || []).find((s) => (s.label || s) === (variant?.label || variant));
  const price = toNum(variantObj?.price) ?? toNum(cardPrice(product)) ?? 0;
  const label =
    variantObj?.label ||
    (typeof variant === "string" ? variant : null) ||
    defaultVariant(product)?.label ||
    undefined;
  return toItem({
    id: product._id || product.productId || product.id || product.slug,
    name: product.name || "Product",
    price: round2(price),
    variant: label,
    category: categoryName(product.category),
    index,
    listName,
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
  // gtag.js reports the landing page itself when it `config`s (send_page_view), so
  // for the Google-tag path only the later client-side navigations are sent by us.
  // (If GA4's "page changes based on browser history events" enhanced measurement
  // is on, turn it off or those navigations are counted twice.) Containers get
  // every page view, as before.
  const isLanding = lastPageViewPath === null;
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
    skipGtag: isLanding,
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
  return (cartItems || []).map((i, index) =>
    toItem({
      id: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      variant: i.selectedSize,
      index,
    })
  );
}

function checkoutEvent({ gtmEvent, metaEvent, cartItems, value, coupon, extra, metaExtra, skipMeta }) {
  const items = cartToItems(cartItems);
  if (items.length === 0) return;
  const total = toNumber(value) || items.reduce((n, i) => n + i.price * i.quantity, 0);
  send({
    gtmEvent,
    metaEvent,
    skipMeta,
    ecommerce: compact({ currency: CURRENCY, value: total, coupon, items }),
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
export function trackInitiateCheckout(cartItems, value, coupon) {
  checkoutEvent({ gtmEvent: "begin_checkout", metaEvent: "InitiateCheckout", cartItems, value, coupon });
}

// Shipping step passed validation (step 1 -> 2). Google only: Meta has no
// equivalent event.
export function trackAddShippingInfo(cartItems, value, coupon) {
  checkoutEvent({ gtmEvent: "add_shipping_info", skipMeta: true, cartItems, value, coupon });
}

// Payment step passed validation (step 2 -> 3, payment method chosen: COD or
// online). Reported on the FORWARD transition only, so retried / failed order
// attempts on the review step do not re-fire it.
export function trackAddPaymentInfo(cartItems, value, paymentMethod, coupon) {
  checkoutEvent({
    gtmEvent: "add_payment_info",
    metaEvent: "AddPaymentInfo",
    cartItems,
    value,
    coupon,
    extra: { payment_type: paymentMethod },
    metaExtra: { payment_method: paymentMethod },
  });
}

// ── Cart / browse events (Google only, except Search) ──

// A cart line leaving the bag. cartItem: the line as stored in CartContext.
export function trackRemoveFromCart(cartItem) {
  if (!cartItem) return;
  const [item] = cartToItems([cartItem]);
  const value = round2(item.price * item.quantity);
  send({
    gtmEvent: "remove_from_cart",
    skipMeta: true,
    ecommerce: { currency: CURRENCY, value, items: [item] },
  });
}

// The bag drawer opening with items in it.
export function trackViewCart(cartItems, value) {
  const items = cartToItems(cartItems);
  if (items.length === 0) return;
  const total = toNumber(value) || items.reduce((n, i) => n + i.price * i.quantity, 0);
  send({
    gtmEvent: "view_cart",
    skipMeta: true,
    ecommerce: { currency: CURRENCY, value: round2(total), items },
  });
}

// One impression per settled result set of a product grid.
export function trackViewItemList(products = [], listName) {
  const items = (products || [])
    .map((p, index) => itemFromProduct(p, { index, listName }))
    .filter(Boolean);
  if (items.length === 0) return;
  send({
    gtmEvent: "view_item_list",
    skipMeta: true,
    ecommerce: compact({
      currency: CURRENCY,
      item_list_name: listName,
      items: items.slice(0, 50), // GA4 caps payload size; 50 is plenty for a grid
    }),
  });
}

export function trackSearch(searchTerm) {
  const term = (searchTerm || "").trim();
  if (!term) return;
  send({
    gtmEvent: "search",
    metaEvent: "Search",
    extra: { search_term: term },
    metaParams: { search_string: term, content_type: "product" },
    relay: false, // the backend's Conversions API only accepts the 5 funnel events
  });
}

// ── Account / lead events ──

export function trackLogin(method) {
  send({
    gtmEvent: "login",
    metaEvent: "Login",
    metaCustom: true, // Meta has no standard login event
    extra: { method },
    metaParams: { method },
  });
}

export function trackSignUp(method) {
  send({
    gtmEvent: "sign_up",
    metaEvent: "CompleteRegistration",
    relay: false,
    extra: { method },
    metaParams: { content_name: method, status: true, currency: CURRENCY },
  });
}

// Newsletter / spin-wheel / footer form: anything that captures an address.
export function trackLead(source, extra = {}) {
  send({
    gtmEvent: "generate_lead",
    metaEvent: "Lead",
    relay: false,
    extra: { lead_source: source, ...extra },
    metaParams: { content_name: source, currency: CURRENCY },
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
  // Tags off (dev): return BEFORE the dedupe write, or the order would be marked
  // as tracked without ever having been sent.
  if (!order || !tagsOn()) return;
  const orderId = String(order.orderId || order._id || "");
  if (orderId && alreadyTracked(orderId)) return;

  const items = (order.items || []).map((i, index) =>
    toItem({
      id: i.product?._id || i.product,
      name: i.name || i.product?.name,
      price: i.price,
      quantity: i.quantity,
      variant: i.selectedSize,
      index,
    })
  );
  const pricing = order.pricing || {};
  const value = toNumber(pricing.total ?? order.total);
  const paymentMethod = order.paymentMethod || order.payment?.method;
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
      tax: toNumber(pricing.tax) || undefined,
      coupon: pricing.couponCode,
      payment_type: paymentMethod,
      items,
    }),
    extra: { payment_method: paymentMethod },
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

  // Google Ads. Only fires when a conversion label is configured, so the
  // import-from-GA4 route stays the default and an order cannot be counted twice.
  if (GOOGLE_ADS_ID && GOOGLE_ADS_PURCHASE_LABEL) {
    try {
      gtag("event", "conversion", {
        send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_PURCHASE_LABEL}`,
        transaction_id: orderId,
        currency: CURRENCY,
        value,
      });
      if (DEBUG) console.debug("[tracking] ads conversion:", orderId, value);
    } catch (err) {
      console.warn("[tracking] ads conversion failed", err);
    }
  }
}

// First Tag Manager container, for the <noscript> iframe (which takes exactly one).
export const TRACKING_IDS = { GTM_ID: GTM_IDS[0] || "", META_PIXEL_ID };
