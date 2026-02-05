"use client";
import "./ShoppingCart.css";
import { useState, useEffect } from "react";

import { products } from "@/app/wardrobe/products";
import { useCartStore, useCartCount, useCartSubtotal } from "@/store/cartStore";

const discountTiers = [
  { threshold: 500, label: "5% Off", discount: 5 },
  { threshold: 1200, label: "Free Shipping", discount: 0 },
  { threshold: 2000, label: "10% Off", discount: 10 },
  { threshold: 3500, label: "15% Off", discount: 15 },
];

const maxThreshold = discountTiers[discountTiers.length - 1].threshold;

const DiscountProgress = ({ subtotal }) => {
  const progress = Math.min((subtotal / maxThreshold) * 100, 100);

  const currentTier = [...discountTiers].reverse().find((t) => subtotal >= t.threshold);
  const nextTier = discountTiers.find((t) => subtotal < t.threshold);

  return (
    <div className="discount-progress">
      <div className="discount-progress-top">
        {currentTier ? (
          <p className="discount-progress-msg unlocked">
            {currentTier.label} unlocked
          </p>
        ) : nextTier ? (
          <p className="discount-progress-msg">
            &#8377;{(nextTier.threshold - subtotal).toFixed(0)} away from {nextTier.label}
          </p>
        ) : null}
      </div>
      <div className="discount-bar-track">
        <div
          className="discount-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="discount-tiers">
        {discountTiers.map((tier) => {
          const unlocked = subtotal >= tier.threshold;
          return (
            <div
              key={tier.threshold}
              className={`discount-tier ${unlocked ? "unlocked" : ""}`}
            >
              <span className="tier-price">&#8377;{tier.threshold.toLocaleString()}</span>
              <span className="tier-label">{tier.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ShoppingCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const cartCount = useCartCount();
  const subtotal = useCartSubtotal();

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <div className="shopping-cart-container">
      <button className="cart-button" onClick={toggleCart}>
        <span className="cart-icon">BAG</span>
        {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
      </button>

      <div
        className={`cart-sidebar ${isOpen ? "open" : ""}`}
        onWheel={(e) => {
          const target = e.currentTarget;
          const cartItems = target.querySelector(".cart-items");
          if (cartItems) {
            const { scrollTop, scrollHeight, clientHeight } = cartItems;
            const isAtTop = scrollTop === 0;
            const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

            if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
              e.stopPropagation();
            }
          }
        }}
      >
        <div className="cart-sidebar-content">
          <div className="cart-header">
            <h2>Bag</h2>
            <button className="cart-close" onClick={toggleCart}>
              Close
            </button>
          </div>
          {cartItems.length > 0 && <DiscountProgress subtotal={subtotal} />}
          <div
            className="cart-items"
            onWheel={(e) => {
              e.stopPropagation();
            }}
            onTouchMove={(e) => {
              e.stopPropagation();
            }}
          >
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <p>Your bag is empty</p>
              </div>
            ) : (
              cartItems.map((item, index) => {
                const productIndex =
                  products.findIndex((p) => p.name === item.name) + 1;
                const quantity = Number(item.quantity) || 1;
                return (
                  <div key={`${item.name}-${index}`} className="cart-item">
                    <div className="cart-item-image">
                      <img
                        src={`/products/product_${productIndex}.png`}
                        alt={item.name}
                      />
                    </div>
                    <div className="cart-item-details">
                      <div className="cart-item-name-row">
                        <p className="cart-item-name">{item.name}</p>
                        {quantity > 1 && (
                          <span className="cart-item-quantity">{quantity}</span>
                        )}
                      </div>
                      <p className="cart-item-price">${item.price}</p>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(item.name)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="cart-footer">
              {(() => {
                const activeTier = [...discountTiers].reverse().find((t) => subtotal >= t.threshold && t.discount > 0);
                const discountAmount = activeTier ? (subtotal * activeTier.discount) / 100 : 0;
                const finalTotal = subtotal - discountAmount;
                return (
                  <>
                    <div className="cart-summary-row">
                      <span>Subtotal</span>
                      <span>&#8377;{subtotal.toFixed(2)}</span>
                    </div>
                    {activeTier && (
                      <div className="cart-summary-row cart-discount-row">
                        <span>{activeTier.label}</span>
                        <span>-&#8377;{discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="cart-summary-row cart-total-row">
                      <span>Total</span>
                      <span>&#8377;{finalTotal.toFixed(2)}</span>
                    </div>
                  </>
                );
              })()}
              <button className="cart-checkout">Checkout</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
