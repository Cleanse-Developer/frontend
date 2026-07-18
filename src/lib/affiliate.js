// Promoter (affiliate) last-click attribution, stored client-side.
//
// A promoter link redirect (`/r/:slug`) lands the visitor on the storefront with
// `?aff=<slug>&coupon=<CODE>`. We persist that here so it survives navigation and
// can be (a) auto-applied into the single coupon input and (b) sent with the order
// so the backend can attribute commission even if the code is never typed.

const KEY = "promoter_attr";
const WINDOW_DAYS = 30;

// Read `?aff` / `?coupon` off the current URL and persist (last-click wins).
export function captureFromUrl() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("aff");
    if (!slug) return;
    const code = params.get("coupon");
    localStorage.setItem(
      KEY,
      JSON.stringify({ slug, code: code || null, ts: Date.now() })
    );
  } catch {
    /* storage unavailable — ignore */
  }
}

// The stored attribution, or null if absent/expired.
export function getStoredAttribution() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.slug) return null;
    if (data.ts && Date.now() - data.ts > WINDOW_DAYS * 864e5) {
      localStorage.removeItem(KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// The bound coupon code to auto-apply into the single coupon input, if any.
export function getStoredCoupon() {
  return getStoredAttribution()?.code || null;
}

// Minimal payload to send with an order/checkout so the backend can attribute it.
export function getAttributionPayload() {
  const attr = getStoredAttribution();
  return attr?.slug ? { slug: attr.slug } : undefined;
}
