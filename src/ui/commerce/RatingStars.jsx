import "./RatingStars.css";

const Star = ({ filled }) => (
  <svg viewBox="0 0 24 24" className={`ui-stars-star ${filled ? "is-filled" : ""}`} aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
  </svg>
);

/**
 * RatingStars — star rating display, extracted from the Testimonials /
 * FeaturedSection star rows. `value` 0–`max`. Read-only.
 */
export default function RatingStars({ value = 0, max = 5, showValue = false, className = "" }) {
  const rounded = Math.round(value);
  return (
    <span className={`ui-stars ${className}`.trim()} role="img" aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star key={i} filled={i < rounded} />
      ))}
      {showValue ? <span className="ui-stars-value">{Number(value).toFixed(1)}</span> : null}
    </span>
  );
}
