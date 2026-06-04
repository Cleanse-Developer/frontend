"use client";
import "./QuantitySelector.css";

/**
 * QuantitySelector — −/value/+ stepper used in the cart and product pages.
 * Controlled: pass `value` + `onChange(nextQty)`. Respects `min`/`max`.
 */
export default function QuantitySelector({
  value = 1,
  onChange,
  min = 1,
  max = 99,
  className = "",
  ariaLabel = "Quantity",
}) {
  const set = (next) => {
    const clamped = Math.max(min, Math.min(max, next));
    if (clamped !== value) onChange?.(clamped);
  };
  return (
    <div className={`ui-qty ${className}`.trim()} role="group" aria-label={ariaLabel}>
      <button type="button" className="ui-qty-btn" onClick={() => set(value - 1)} disabled={value <= min} aria-label="Decrease quantity">−</button>
      <span className="ui-qty-value" aria-live="polite">{value}</span>
      <button type="button" className="ui-qty-btn" onClick={() => set(value + 1)} disabled={value >= max} aria-label="Increase quantity">+</button>
    </div>
  );
}
