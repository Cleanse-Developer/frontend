"use client";
import { useState } from "react";
import "./WishlistButton.css";

const Heart = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 21s-7.5-4.6-10-9.1C.4 8.9 1.8 5.5 5 5c2-.3 3.6.9 4.5 2.3C10.4 5.9 12 4.7 14 5c3.2.5 4.6 3.9 3 6.9C19.5 16.4 12 21 12 21z" />
  </svg>
);

/**
 * WishlistButton — heart toggle. Presentational + controllable: pass `active`
 * and `onToggle(next, productId)` to wire it to wishlistApi.
 */
export default function WishlistButton({ active = false, onToggle, productId, className = "" }) {
  const [on, setOn] = useState(active);
  const toggle = (e) => {
    e?.preventDefault?.();
    const next = !on;
    setOn(next);
    onToggle?.(next, productId);
  };
  return (
    <button
      type="button"
      className={`ui-wishlist ${on ? "is-active" : ""} ${className}`.trim()}
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart />
    </button>
  );
}
