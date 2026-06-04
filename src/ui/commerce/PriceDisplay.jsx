import "./PriceDisplay.css";

/**
 * PriceDisplay — the ₹ price label, with an optional struck-through compare-at
 * price. Currency defaults to the site's rupee symbol.
 */
export default function PriceDisplay({ price, compareAt, currency = "₹", className = "" }) {
  return (
    <span className={`ui-price ${className}`.trim()}>
      <span className="ui-price-current">{currency}{price}</span>
      {compareAt && Number(compareAt) > Number(price) ? (
        <span className="ui-price-compare">{currency}{compareAt}</span>
      ) : null}
    </span>
  );
}
