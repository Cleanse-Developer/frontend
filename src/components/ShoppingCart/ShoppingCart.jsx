"use client";
import "./ShoppingCart.css";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";

const discountTiers = [
  { threshold: 500, label: "5% Off", discount: 5 },
  { threshold: 1200, label: "Free Shipping", discount: 0 },
  { threshold: 2000, label: "10% Off", discount: 10 },
  { threshold: 3500, label: "15% Off", discount: 15 },
];

const maxThreshold = discountTiers[discountTiers.length - 1].threshold;

// Loyalty points rate: 1 point per ₹10 spent
const POINTS_PER_RUPEE = 0.1;

// Cart timer duration in seconds (15 minutes)
const CART_TIMER_DURATION = 15 * 60;

// Cart Timer Component
const CartTimer = ({ cartItems }) => {
  const [timeLeft, setTimeLeft] = useState(CART_TIMER_DURATION);
  const timerRef = useRef(null);
  const lastCartUpdateRef = useRef(Date.now());

  // Reset timer when cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      lastCartUpdateRef.current = Date.now();
      setTimeLeft(CART_TIMER_DURATION);
    }
  }, [cartItems.length]);

  // Countdown logic
  useEffect(() => {
    if (cartItems.length === 0) {
      setTimeLeft(CART_TIMER_DURATION);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [cartItems.length]);

  if (cartItems.length === 0) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft <= 120; // Last 2 minutes

  return (
    <div className={`cart-timer ${isUrgent ? "urgent" : ""}`}>
      <div className="cart-timer-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      </div>
      <div className="cart-timer-content">
        <span className="cart-timer-label">Items reserved for</span>
        <span className="cart-timer-time">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
};

// Loyalty Points Component
const LoyaltyPoints = ({ subtotal }) => {
  const pointsEarned = Math.floor(subtotal * POINTS_PER_RUPEE);

  if (pointsEarned === 0) return null;

  return (
    <div className="loyalty-points">
      <div className="loyalty-points-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      </div>
      <div className="loyalty-points-content">
        <span className="loyalty-points-value">+{pointsEarned}</span>
        <span className="loyalty-points-label">Loyalty Points</span>
      </div>
    </div>
  );
};

// Cross-sell Products Component
const CrossSellProducts = ({ cartItems }) => {
  const { addToCart } = useCart();
  const [crossSellProducts, setCrossSellProducts] = useState([]);

  useEffect(() => {
    import("@/lib/endpoints").then(({ productApi }) => {
      productApi.getAll({ limit: 6 }).then((data) => {
        const cartIds = cartItems.map((item) => item.productId || item.name);
        const filtered = (data.products || [])
          .filter((p) => !cartIds.includes(p._id) && !cartIds.includes(p.name))
          .slice(0, 2);
        import("@/lib/normalizers").then(({ normalizeProduct }) => {
          setCrossSellProducts(filtered.map(normalizeProduct));
        });
      }).catch(() => {});
    });
  }, [cartItems]);

  if (crossSellProducts.length === 0 || cartItems.length === 0) return null;

  return (
    <div className="cross-sell">
      <h4 className="cross-sell-title">Complete Your Routine</h4>
      <div className="cross-sell-products">
        {crossSellProducts.map((product, i) => (
          <div key={product._id || i} className="cross-sell-item">
            <div className="cross-sell-image">
              <img
                src={product.primaryImage || `/images/${(i % 4) + 1}.png`}
                alt={product.name}
              />
            </div>
            <div className="cross-sell-details">
              <p className="cross-sell-name">{product.name}</p>
              <p className="cross-sell-price">&#8377;{product.price}</p>
            </div>
            <button
              className="cross-sell-add"
              onClick={() => addToCart(product)}
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const DiscountProgress = ({ subtotal }) => {
  const progress = Math.min((subtotal / maxThreshold) * 100, 100);
  const [showConfetti, setShowConfetti] = useState(false);
  const prevTierRef = useRef(null);

  const currentTier = [...discountTiers].reverse().find((t) => subtotal >= t.threshold);
  const nextTier = discountTiers.find((t) => subtotal < t.threshold);

  // Check if a new tier was unlocked
  useEffect(() => {
    if (currentTier && currentTier !== prevTierRef.current) {
      if (prevTierRef.current !== null || subtotal >= discountTiers[0].threshold) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }
    prevTierRef.current = currentTier;
  }, [currentTier, subtotal]);

  // Generate confetti particles
  const confettiParticles = showConfetti ? Array.from({ length: 30 }, (_, i) => (
    <div
      key={i}
      className="confetti-particle"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 0.5}s`,
        backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A855F7', '#FF9F43', '#54A0FF', '#5FD068', '#FF78C4', '#F9CA24', '#00D2D3'][Math.floor(Math.random() * 10)],
      }}
    />
  )) : null;

  return (
    <div className={`discount-progress ${showConfetti ? 'celebrating' : ''}`}>
      {showConfetti && <div className="confetti-container">{confettiParticles}</div>}
      <div className="discount-progress-top">
        {currentTier ? (
          <p className="discount-progress-msg unlocked">
            🎉 {currentTier.label} unlocked!
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
  const { cartItems, removeFromCart, cartCount, subtotal, serverPricing } = useCart();
  const router = useRouter();

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
          const cartItemsEl = target.querySelector(".cart-items");
          if (cartItemsEl) {
            const { scrollTop, scrollHeight, clientHeight } = cartItemsEl;
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
          <CartTimer cartItems={cartItems} />
          {cartItems.length > 0 && <DiscountProgress subtotal={subtotal} />}
          <div
            className="cart-items-scroll"
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
                const itemId = item.cartItemId || `${item.productId || item.name}_${item.selectedSize}`;
                const quantity = Number(item.quantity) || 1;
                return (
                  <div key={itemId || index} className="cart-item">
                    <div className="cart-item-image">
                      <img
                        src={item.image || `/images/${(index % 4) + 1}.png`}
                        alt={item.name}
                      />
                    </div>
                    <div className="cart-item-details">
                      <div className="cart-item-name-row">
                        <p className="cart-item-name">{item.name}</p>
                        {quantity > 1 && (
                          <span className="cart-item-quantity">x{quantity}</span>
                        )}
                      </div>
                      {item.selectedSize && <p className="cart-item-size" style={{ fontSize: "0.75rem", color: "#888", marginTop: "2px" }}>{item.selectedSize}</p>}
                      <p className="cart-item-price">&#8377;{item.price}</p>
                      <button
                        className="cart-item-remove"
                        onClick={() => removeFromCart(itemId)}
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
            <div className="cart-bottom-section">
              <CrossSellProducts cartItems={cartItems} />
              <div className="cart-footer">
                {serverPricing ? (
                  <>
                    <div className="cart-summary-row">
                      <span>Subtotal</span>
                      <span>&#8377;{serverPricing.subtotal.toFixed(2)}</span>
                    </div>
                    {serverPricing.bundleDiscountTotal > 0 && serverPricing.bundleDiscounts.map((bd, i) => (
                      <div key={i} className="cart-summary-row cart-discount-row">
                        <span>{bd.bundleName}</span>
                        <span>-&#8377;{bd.discountAmount.toFixed(2)}</span>
                      </div>
                    ))}
                    {serverPricing.tierDiscount > 0 && (
                      <div className="cart-summary-row cart-discount-row">
                        <span>{serverPricing.tierLabel || `${serverPricing.tierPercent}% Off`}</span>
                        <span>-&#8377;{serverPricing.tierDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    {serverPricing.shippingCost > 0 && (
                      <div className="cart-summary-row">
                        <span>Shipping</span>
                        <span>&#8377;{serverPricing.shippingCost.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="cart-summary-row cart-total-row">
                      <span>Total</span>
                      <span>&#8377;{serverPricing.total.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="cart-summary-row">
                      <span>Subtotal</span>
                      <span>&#8377;{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="cart-summary-row cart-total-row">
                      <span>Total</span>
                      <span>&#8377;{subtotal.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <LoyaltyPoints subtotal={subtotal} />
                <button
                  className="cart-checkout"
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/checkout");
                  }}
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
