import PriceDisplay from "./PriceDisplay";
import Badge from "../primitives/Badge";
import "./OrderCard.css";

/**
 * OrderCard — order summary row for the orders list.
 * `order`: { id, date, status, total, itemCount, thumbnails: [url] }.
 */
export default function OrderCard({ order = {}, onView, className = "" }) {
  const { id, date, status, total, itemCount, thumbnails = [] } = order;
  return (
    <div className={`ui-order-card ${className}`.trim()}>
      <div className="ui-order-card-thumbs">
        {thumbnails.slice(0, 3).map((src, i) => (
          <span className="ui-order-card-thumb" key={i}><img src={src} alt="" /></span>
        ))}
      </div>
      <div className="ui-order-card-info">
        <div className="ui-order-card-head">
          <span className="ui-order-card-id">Order #{id}</span>
          {status ? <Badge tone="soft">{status}</Badge> : null}
        </div>
        <span className="ui-order-card-meta">
          {date ? `${date} · ` : ""}{itemCount != null ? `${itemCount} item${itemCount === 1 ? "" : "s"}` : ""}
        </span>
      </div>
      <div className="ui-order-card-foot">
        {total != null ? <PriceDisplay price={total} /> : null}
        {onView ? <button type="button" className="ui-order-card-view" onClick={onView}>View</button> : null}
      </div>
    </div>
  );
}
