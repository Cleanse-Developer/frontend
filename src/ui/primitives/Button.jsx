import "./Button.css";

/**
 * Button — the brand button, extracted from the repeated CTA/add-to-cart/hero
 * button styles. Variants map 1:1 to existing patterns:
 *   - "rect"  → .add-to-cart-btn / .product-card-buy-btn (default)
 *   - "pill"  → .featured-cta-btn / .sbp-cta / .rhr-cta
 *   - "hero"  → home .hero-btn
 *   - "primary" / "secondary" → globals button.primary / button.secondary
 *
 * Renders a <button> by default; pass `as={Link}` (or "a") for navigation.
 */
export default function Button({
  as: Tag = "button",
  variant = "rect",
  className = "",
  children,
  ...props
}) {
  const cls = `ui-btn ui-btn--${variant} ${className}`.trim();
  return (
    <Tag className={cls} {...props}>
      {children}
    </Tag>
  );
}
