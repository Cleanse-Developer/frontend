"use client";
import "./cart.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { productApi, shippingApi } from "@/lib/endpoints";
import { normalizeProduct, productUrl } from "@/lib/normalizers";
import Copy from "@/components/Copy/Copy";
import DiscountProgress from "@/components/DiscountProgress/DiscountProgress";
import { toNum, formatPrice } from "@/lib/formatters";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, addToCart, cartCount, subtotal, serverPricing } = useCart();
  const router = useRouter();

  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

  // Admin-configured shipping (rate + free-shipping threshold). Falls back to
  // sensible defaults until the config loads / if the request fails.
  const [shippingConfig, setShippingConfig] = useState({ standardRate: 99, freeAbove: 1200 });

  useEffect(() => {
    shippingApi.getConfig()
      .then((cfg) => {
        if (cfg && typeof cfg.standardRate === "number") setShippingConfig(cfg);
      })
      .catch(() => {});
  }, []);

  const giftWrapCost = giftWrap ? 99 : 0;

  // Prefer backend pricing (respects the admin-managed dynamic tiers); fall back
  // to a local estimate while it loads or if pricing is unavailable. Gift wrap is
  // a cart-page-only toggle not sent to the auto-fetched pricing, so it's added on
  // top here. Values are coerced so a missing field never renders NaN.
  const summarySubtotal = toNum(serverPricing?.subtotal) ?? subtotal;
  const tierDiscount = toNum(serverPricing?.tierDiscount) ?? 0;
  const tierLabel = serverPricing?.tierLabel;
  const spTotal = toNum(serverPricing?.total);
  const shippingCost =
    toNum(serverPricing?.shippingCost) ??
    (subtotal >= shippingConfig.freeAbove ? 0 : shippingConfig.standardRate);
  const qualifiesFreeShipping = shippingCost === 0;
  const summaryTotal =
    spTotal != null
      ? spTotal + giftWrapCost
      : subtotal + shippingCost + giftWrapCost;

  const [recommended, setRecommended] = useState([]);

  // Back-fill descriptions for cart items that don't carry one (older items, or
  // items synced without a description) so the middle column isn't empty.
  const [descMap, setDescMap] = useState({});
  useEffect(() => {
    const missing = cartItems.filter(
      (it) => !it.description && it.slug && descMap[it.slug] === undefined
    );
    if (missing.length === 0) return;
    let cancelled = false;
    Promise.all(
      missing.map((it) =>
        productApi
          .getBySlug(it.slug)
          .then((p) => {
            const np = normalizeProduct(p?.product || p);
            return [it.slug, np?.shortDescription || np?.description || ""];
          })
          .catch(() => [it.slug, ""])
      )
    ).then((entries) => {
      if (!cancelled) setDescMap((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    });
    return () => {
      cancelled = true;
    };
  }, [cartItems, descMap]);

  useEffect(() => {
    productApi.getAll({ limit: 8 }).then((data) => {
      const cartIds = cartItems.map((item) => item.productId || item.name);
      const filtered = (data.products || [])
        .filter((p) => !cartIds.includes(p._id) && !cartIds.includes(p.name))
        .slice(0, 4)
        .map(normalizeProduct);
      setRecommended(filtered);
    }).catch(() => {});
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
        <div className="cart-hero-content">
          <div className="cart-breadcrumb">
            <Link href="/">HOME</Link>/ <span>CART</span>
          </div>
          <h1 className="cart-hero-title">YOUR BAG</h1>
          <p className="cart-hero-count">{cartCount} {cartCount === 1 ? "item" : "items"}</p>
        </div>
      </section>

      {/* Discount Progress (backend-computed; hidden when tiers disabled) */}
      {serverPricing?.tierProgress && (
        <section className="cart-discount-section">
          <DiscountProgress
            tierProgress={serverPricing.tierProgress}
            variant="page"
          />
        </section>
      )}

      {/* Cart Content */}
      <section className="cart-content">
        <div className="cart-items-list">
          {cartItems.map((item, index) => {
            const itemId = item.cartItemId || `${item.productId || item.name}_${item.selectedSize}`;
            const quantity = Number(item.quantity) || 1;
            const desc = item.description || descMap[item.slug] || "";
            return (
              <div key={itemId || index} className="cart-page-item">
                <div className="cart-page-item-image">
                  <img src={item.image || `/images/${(index % 4) + 1}.png`} alt={item.name} />
                </div>
                <div className="cart-page-item-details">
                  <h3 className="cart-page-item-name">{item.name}</h3>
                  {desc && (
                    <p className="cart-page-item-desc">{desc}</p>
                  )}
                  <p className="cart-page-item-unit">&#8377;{item.price} each{item.selectedSize ? ` · ${item.selectedSize}` : ""}</p>
                </div>
                <div className="cart-page-item-side">
                  <span className="cart-page-item-price">&#8377;{(Number(item.price) * quantity).toFixed(0)}</span>
                  <div className="cart-page-item-controls">
                    <div className="cart-quantity-selector">
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(itemId, quantity - 1)}
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="cart-qty-value">{quantity}</span>
                      <button
                        className="cart-qty-btn"
                        onClick={() => updateQuantity(itemId, quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <button className="cart-page-remove" onClick={() => removeFromCart(itemId)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary + Gift Options (right column) */}
        <div className="cart-summary-wrapper">
          <div className="cart-summary-card">
            <h3 className="cart-summary-title">Order Summary</h3>
            <div className="cart-summary-rows">
              <div className="cart-summary-line">
                <span>Subtotal</span>
                <span>&#8377;{formatPrice(summarySubtotal)}</span>
              </div>
              {tierDiscount > 0 && (
                <div className="cart-summary-line cart-summary-discount">
                  <span>{tierLabel || "Discount"}</span>
                  <span>-&#8377;{formatPrice(tierDiscount)}</span>
                </div>
              )}
              {giftWrap && (
                <div className="cart-summary-line cart-summary-gift">
                  <span>Gift Wrapping</span>
                  <span>&#8377;99</span>
                </div>
              )}
              <div className="cart-summary-line cart-summary-shipping">
                <span>Shipping</span>
                <span>{qualifiesFreeShipping ? "Free" : `₹${formatPrice(shippingCost)}`}</span>
              </div>
              <div className="cart-summary-line cart-summary-total">
                <span>Total</span>
                <span>&#8377;{formatPrice(summaryTotal)}</span>
              </div>
            </div>
            <button
              className="cart-checkout-btn"
              onClick={() => router.push("/checkout")}
            >
              Proceed to Checkout
            </button>
            <Link href="/wardrobe" className="cart-continue-link">Continue Shopping</Link>
          </div>

          {/* Gift Options — below the order summary */}
          <div className="gift-options">
            <h3 className="gift-options-title">GIFT OPTIONS</h3>
            <div className="gift-toggle">
              <label className="gift-toggle-switch">
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                />
                <span className="gift-toggle-slider"></span>
              </label>
              <span className="gift-toggle-label">Add Gift Wrapping <span className="gift-toggle-price">(+&#8377;99)</span></span>
            </div>
            {giftWrap && (
              <div className="gift-message-wrapper">
                <textarea
                  className="gift-message"
                  placeholder="Write a personal message..."
                  maxLength={200}
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                />
                <span className="gift-char-count">{giftMessage.length} / 200</span>
              </div>
            )}
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
            {recommended.map((product, i) => {
              return (
                <div key={product._id || i} className="cart-rec-card">
                  <Link href={productUrl(product)} className="cart-rec-card-image">
                    <img src={product.primaryImage || `/images/${(i % 4) + 1}.png`} alt={product.name} />
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
