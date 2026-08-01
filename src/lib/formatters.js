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
 * The variant a quick-add should use when the shopper hasn't picked a size:
 * the cheapest priced variant — i.e. the exact one `cardPrice` displays.
 * Returns null for products with no priced variants (base price applies).
 *
 * Cart adds MUST go through this so the price that lands in the bag is the one
 * advertised on the card / bundle tile. Defaulting to `sizes[0]` instead makes
 * a bundle total quoted at the lowest variant price bill at whatever variant
 * happens to be first.
 */
export const defaultVariant = (p) => {
  const priced = (p?.sizes || []).filter(
    (s) => Number.isFinite(Number(s?.price)) && Number(s.price) > 0
  );
  if (priced.length === 0) return null;
  return priced.reduce((min, s) => (Number(s.price) < Number(min.price) ? s : min));
};

/**
 * Price to display on a catalog card when no variant is selected yet: the
 * lowest variant price, falling back to the base product price for products
 * with no variants. Used by product cards / featured grid / cross-sell / bundles.
 */
export const cardPrice = (p) =>
  Number(defaultVariant(p)?.price) || Number(p?.price) || 0;

/**
 * The size label a cart line will carry for (product, selectedSize).
 * `selectedSize` may be a full variant object, a bare label, or absent.
 *
 * Single source of truth: CartContext.addToCart uses it to build the line, and
 * CartQtyButton uses it to find that line again. If the two ever disagree the
 * tile stepper stops recognising its own item and re-adds duplicates.
 */
export const resolveVariantLabel = (product, selectedSize) =>
  selectedSize?.label ||
  selectedSize ||
  defaultVariant(product)?.label ||
  product?.sizes?.[0]?.label ||
  product?.sizes?.[0];
