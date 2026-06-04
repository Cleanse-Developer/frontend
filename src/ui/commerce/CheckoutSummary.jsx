import PriceDisplay from "./PriceDisplay";
import "./CheckoutSummary.css";

/**
 * CheckoutSummary — order totals panel (subtotal, shipping, discount, total).
 * `lines`: [{ label, value, muted, negative }]. `total`: number. Pass extra
 * controls (coupon input, CTA) as children.
 */
export default function CheckoutSummary({ title = "Order summary", lines = [], total, currency = "₹", children, className = "" }) {
  return (
    <aside className={`ui-summary ${className}`.trim()}>
      {title ? <h3 className="ui-summary-title">{title}</h3> : null}
      <ul className="ui-summary-lines">
        {lines.map((l, i) => (
          <li className={`ui-summary-line ${l.muted ? "is-muted" : ""}`} key={l.label + i}>
            <span>{l.label}</span>
            <span>{l.negative ? "−" : ""}{currency}{Math.abs(Number(l.value))}</span>
          </li>
        ))}
      </ul>
      {total != null ? (
        <div className="ui-summary-total">
          <span>Total</span>
          <PriceDisplay price={total} currency={currency} />
        </div>
      ) : null}
      {children ? <div className="ui-summary-extra">{children}</div> : null}
    </aside>
  );
}
