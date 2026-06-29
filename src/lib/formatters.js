// Safe money/number formatters for displaying server-computed pricing.
// These never throw and never emit "NaN", so a missing/malformed pricing field
// degrades to a sensible "0.00" / "0" instead of breaking the render.

/** Coerce a value to a finite number, or null if it isn't one. */
export const toNum = (v) =>
  typeof v === "number" && Number.isFinite(v)
    ? v
    : Number.isFinite(+v)
    ? +v
    : null;

/** Format an amount with 2 decimals (e.g. "1299.00"). Bad input -> "0.00". */
export const formatPrice = (v) => (toNum(v) ?? 0).toFixed(2);

/** Format a whole-rupee amount with grouping (e.g. "1,299"). Bad input -> "0". */
export const formatMoney = (v) =>
  Math.round(toNum(v) ?? 0).toLocaleString("en-IN");

/**
 * A server pricing object is only usable if it carries the core numeric fields.
 * Anything else (null, {}, partial, garbage) should be treated as "no pricing"
 * so the UI falls back to the client-side estimate.
 */
export const isUsablePricing = (p) =>
  !!p &&
  typeof p === "object" &&
  toNum(p.subtotal) !== null &&
  toNum(p.total) !== null;

/**
 * Price to display on a catalog card when no variant is selected yet: the
 * lowest variant price, falling back to the base product price for products
 * with no variants. Used by product cards / featured grid / cross-sell.
 */
export const cardPrice = (p) => {
  const prices = (p?.sizes || [])
    .map((s) => Number(s.price))
    .filter((n) => Number.isFinite(n) && n > 0);
  return prices.length ? Math.min(...prices) : Number(p?.price) || 0;
};
