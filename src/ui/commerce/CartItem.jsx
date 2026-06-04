"use client";
import QuantitySelector from "../forms/QuantitySelector";
import PriceDisplay from "./PriceDisplay";
import "./CartItem.css";

/**
 * CartItem — a single cart line (image, name, price, quantity, remove).
 * Presentational: wire `onQuantityChange(qty)` and `onRemove()` to CartContext
 * (updateQuantity / removeFromCart) at the call site.
 *
 * `item`: { name, price, image|primaryImage, quantity, size }
 */
export default function CartItem({ item = {}, onQuantityChange, onRemove, className = "" }) {
  const image = item.image || item.primaryImage;
  return (
    <div className={`ui-cart-item ${className}`.trim()}>
      <div className="ui-cart-item-media">
        {image ? <img src={image} alt={item.name || "Item"} /> : null}
      </div>
      <div className="ui-cart-item-body">
        <div className="ui-cart-item-head">
          <span className="ui-cart-item-name">{item.name}</span>
          {onRemove ? (
            <button type="button" className="ui-cart-item-remove" onClick={onRemove} aria-label="Remove item">×</button>
          ) : null}
        </div>
        {item.size ? <span className="ui-cart-item-size">{item.size}</span> : null}
        <div className="ui-cart-item-foot">
          <QuantitySelector value={item.quantity || 1} onChange={onQuantityChange} />
          <PriceDisplay price={item.price} />
        </div>
      </div>
    </div>
  );
}
