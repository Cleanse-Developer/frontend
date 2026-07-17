"use client";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";

/* The add-to-cart control used on product tiles. Before the item is in the cart
   it's a plain ADD TO CART button; once it's in, it becomes a − qty + stepper so
   the count is visible and adjustable in place. Tapping repeatedly can no longer
   pile up items silently, which is what it did before.

   Both the bento tiles and the Best Sellers cards use this, so they can't drift
   apart. */

// Resolve a cart line's identity exactly the way CartContext does, or the tile
// and the cart would disagree about what "this item" is.
const lineIdFor = (item) =>
  item.cartItemId || `${item.productId || item.name}_${item.selectedSize}`;

// Mirrors addToCart's own size resolution, so the line we look up is the line it
// would create.
const resolveSize = (product, selectedSize) =>
  selectedSize?.label ||
  selectedSize ||
  product.sizes?.[0]?.label ||
  product.sizes?.[0];

// Must match the roll-up animation in FeaturedSection.css. The stepper is held
// on screen for this long so it can animate out — removing the line straight away
// would unmount it mid-frame and the button would just reappear.
const CLOSE_MS = 320;

const CartQtyButton = ({
  product,
  selectedSize,
  className = "",
  label = "Add to Cart",
  icon = null,
}) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const size = resolveSize(product, selectedSize);
  const productId = product._id || product.productId;
  const matchKey = `${productId || product.name}_${size}`;
  const line = cartItems.find(
    (item) => `${item.productId || item.name}_${item.selectedSize}` === matchKey
  );

  // The tiles sit inside <Link>s, so every control here has to stop the click
  // from navigating to the product page.
  const swallow = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (!line) {
    return (
      <button
        type="button"
        className={`product-card-cart-btn ${className}`}
        onClick={(e) => {
          swallow(e);
          addToCart(product, selectedSize);
        }}
      >
        <span className="cart-btn-circle">{icon}</span>
        <span className="cart-btn-text">{label}</span>
      </button>
    );
  }

  const qty = line.quantity || 1;
  const id = lineIdFor(line);

  // Play the roll-up first, then drop the line — so the pill closes back into the
  // circle instead of vanishing.
  const startClose = () => {
    if (closing) return;
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      removeFromCart(id);
      setClosing(false);
    }, CLOSE_MS);
  };

  return (
    <div
      className={`cart-qty-stepper ${closing ? "is-closing" : ""} ${className}`}
      onClick={swallow}
      role="group"
      aria-label={`${product.name} quantity`}
    >
      <button
        type="button"
        className="cart-qty-btn"
        // At 1 the minus removes the item rather than sticking at 1 — otherwise
        // there's no way to undo an accidental add from the tile.
        aria-label={qty <= 1 ? `Remove ${product.name} from cart` : `Decrease ${product.name} quantity`}
        disabled={closing}
        onClick={(e) => {
          swallow(e);
          if (qty <= 1) startClose();
          else updateQuantity(id, qty - 1);
        }}
      >
        −
      </button>

      <span className="cart-qty-value" aria-live="polite">{qty}</span>

      <button
        type="button"
        className="cart-qty-btn"
        aria-label={`Increase ${product.name} quantity`}
        disabled={closing}
        onClick={(e) => {
          swallow(e);
          updateQuantity(id, qty + 1);
        }}
      >
+
      </button>
    </div>
  );
};

export default CartQtyButton;
