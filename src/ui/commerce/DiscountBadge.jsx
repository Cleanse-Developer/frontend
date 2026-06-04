import "./DiscountBadge.css";

/**
 * DiscountBadge — "X% OFF" chip for product cards/galleries.
 * Pass `percent` (number) or custom children.
 */
export default function DiscountBadge({ percent, children, className = "" }) {
  const label = children || (percent != null ? `${percent}% OFF` : null);
  if (!label) return null;
  return <span className={`ui-discount ${className}`.trim()}>{label}</span>;
}
