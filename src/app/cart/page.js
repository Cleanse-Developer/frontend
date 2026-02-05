"use client";
import "./cart.css";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { products } from "@/app/wardrobe/products";
import { useCartStore, useCartCount, useCartSubtotal } from "@/store/cartStore";
import Copy from "@/components/Copy/Copy";

const discountTiers = [
  { threshold: 500, label: "5% Off", discount: 5 },
  { threshold: 1200, label: "Free Shipping", discount: 0 },
  { threshold: 2000, label: "10% Off", discount: 10 },
  { threshold: 3500, label: "15% Off", discount: 15 },
];

const maxThreshold = discountTiers[discountTiers.length - 1].threshold;

export default function CartPage() {
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const cartCount = useCartCount();
  const subtotal = useCartSubtotal();

  const activeTier = [...discountTiers].reverse().find((t) => subtotal >= t.threshold && t.discount > 0);
  const nextTier = discountTiers.find((t) => subtotal < t.threshold);
  const discountAmount = activeTier ? (subtotal * activeTier.discount) / 100 : 0;
  const finalTotal = subtotal - discountAmount;
  const progress = Math.min((subtotal / maxThreshold) * 100, 100);

  const recommended = useMemo(() => {
    const cartNames = cartItems.map((item) => item.name);
    const available = products.filter((p) => !cartNames.includes(p.name));
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [cartItems]);

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <section className="cart-empty-state">
          <div className="cart-empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6h12l1.5 12H4.5L6 6z" />
              <path d="M9 6V4a3 3 0 016 0v2" />
            </svg>
          </div>
          <Copy animateOnScroll={false} delay={0.2}>
            <h1 className="cart-empty-heading">Your Bag is Empty</h1>
          </Copy>
          <Copy animateOnScroll={false} delay={0.4}>
            <p className="cart-empty-subtitle">Discover our curated Ayurvedic collection</p>
          </Copy>
          <Copy animateOnScroll={false} delay={0.6}>
            <Link href="/wardrobe" className="cart-shop-now-btn">Shop Now</Link>
          </Copy>
        </section>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <section className="cart-hero">
        <Copy animateOnScroll={false} delay={0.2}>
          <p className="cart-hero-label">Your Bag</p>
        </Copy>
        <Copy animateOnScroll={false} delay={0.4}>
          <h1 className="cart-hero-heading">Cart</h1>
        </Copy>
        <Copy animateOnScroll={false} delay={0.6}>
          <p className="cart-hero-count">{cartCount} {cartCount === 1 ? "item" : "items"} in your bag</p>
        </Copy>
      </section>

      {/* Discount Progress */}
      <section className="cart-discount-section">
        <div className="cart-discount-card">
          <div className="cart-discount-msg">
            {activeTier ? (
              <span className="cart-discount-unlocked">{activeTier.label} unlocked</span>
            ) : nextTier ? (
              <span>&#8377;{(nextTier.threshold - subtotal).toFixed(0)} away from {nextTier.label}</span>
            ) : null}
          </div>
          <div className="cart-discount-bar-track">
            <div className="cart-discount-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="cart-discount-tiers">
            {discountTiers.map((tier) => (
              <div key={tier.threshold} className={`cart-discount-tier ${subtotal >= tier.threshold ? "unlocked" : ""}`}>
                <span className="cart-tier-price">&#8377;{tier.threshold.toLocaleString()}</span>
                <span className="cart-tier-label">{tier.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cart Content */}
      <section className="cart-content">
        <div className="cart-items-list">
          {cartItems.map((item, index) => {
            const productIndex = products.findIndex((p) => p.name === item.name) + 1;
            const imgIndex = ((productIndex - 1) % 4) + 1;
            const quantity = Number(item.quantity) || 1;
            return (
              <div key={`${item.name}-${index}`} className="cart-page-item">
                <div className="cart-page-item-image">
                  <img src={`/p${imgIndex}.png`} alt={item.name} />
                </div>
                <div className="cart-page-item-details">
                  <div className="cart-page-item-top">
                    <h3 className="cart-page-item-name">{item.name}</h3>
                    <span className="cart-page-item-price">&#8377;{(parseFloat(item.price) * quantity).toFixed(0)}</span>
                  </div>
                  <p className="cart-page-item-unit">&#8377;{item.price} each</p>
                  <div className="cart-page-item-controls">
                    <div className="cart-quantity-selector">
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(item.name, quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="cart-qty-value">{quantity}</span>
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(item.name, quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button className="cart-page-remove" onClick={() => removeFromCart(item.name)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="cart-summary-wrapper">
          <div className="cart-summary-card">
            <h3 className="cart-summary-title">Order Summary</h3>
            <div className="cart-summary-rows">
              <div className="cart-summary-line">
                <span>Subtotal</span>
                <span>&#8377;{subtotal.toFixed(2)}</span>
              </div>
              {activeTier && (
                <div className="cart-summary-line cart-summary-discount">
                  <span>{activeTier.label}</span>
                  <span>-&#8377;{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="cart-summary-line cart-summary-shipping">
                <span>Shipping</span>
                <span>{subtotal >= 1200 ? "Free" : "&#8377;99"}</span>
              </div>
              <div className="cart-summary-line cart-summary-total">
                <span>Total</span>
                <span>&#8377;{(subtotal >= 1200 ? finalTotal : finalTotal + 99).toFixed(2)}</span>
              </div>
            </div>
            <button className="cart-checkout-btn">Proceed to Checkout</button>
            <Link href="/wardrobe" className="cart-continue-link">Continue Shopping</Link>
          </div>
        </div>
      </section>

      {/* Recommended */}
      {recommended.length > 0 && (
        <section className="cart-recommended">
          <Copy animateOnScroll={true} delay={0.1}>
            <p className="cart-recommended-label">You Might Also Like</p>
          </Copy>
          <Copy animateOnScroll={true} delay={0.2}>
            <h2 className="cart-recommended-heading">Recommended</h2>
          </Copy>
          <div className="cart-recommended-grid">
            {recommended.map((product) => {
              const productIndex = products.indexOf(product) + 1;
              const imgIndex = ((productIndex - 1) % 4) + 1;
              const addToCart = useCartStore.getState().addToCart;
              return (
                <div key={product.name} className="cart-rec-card">
                  <Link href="/unit" className="cart-rec-card-image">
                    <img src={`/p${imgIndex}.png`} alt={product.name} />
                  </Link>
                  <div className="cart-rec-card-info">
                    <h4 className="cart-rec-card-name">{product.name}</h4>
                    <div className="cart-rec-card-footer">
                      <span className="cart-rec-card-price">&#8377;{product.price}</span>
                      <button className="cart-rec-add-btn" onClick={() => addToCart(product)}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
