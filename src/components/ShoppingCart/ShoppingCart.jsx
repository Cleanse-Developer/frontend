"use client";
import "./ShoppingCart.css";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

import { useCart } from "@/context/CartContext";
import DiscountProgress from "@/components/DiscountProgress/DiscountProgress";
import ShippingChargesInfo from "@/ui/commerce/ShippingChargesInfo";
import { shippingApi } from "@/lib/endpoints";
import { formatPrice, cardPrice } from "@/lib/formatters";

// Loyalty points rate: 1 point per ₹10 spent
const POINTS_PER_RUPEE = 0.1;

// Pull-to-refresh: drag distance (px) that triggers a refresh, and the cap the
// indicator can be dragged to (drag past the threshold gets damped). The
// threshold doubles as the gap the list is pushed down by while refreshing, so
// it stays close to the indicator's own height.
const PULL_THRESHOLD = 48;
const PULL_MAX = 76;

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
              <p className="cross-sell-price">&#8377;{cardPrice(product)}</p>
            </div>
            <button
              className="cross-sell-add"
              onClick={() => addToCart(product)}
              aria-label={`Add ${product.name} to bag`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ShoppingCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, removeFromCart, updateQuantity, cartCount, subtotal, serverPricing, refreshCart } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  // --- Pull to refresh -----------------------------------------------------
  const scrollRef = useRef(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // `source` is "touch" or "wheel": the touch drag follows the finger 1:1 and so
  // must not be transitioned, while discrete wheel ticks need the easing to not
  // look like it is jumping.
  const pullRef = useRef({ startY: 0, tracking: false, distance: 0, raw: 0, source: null });
  const isRefreshingRef = useRef(false);
  const refreshCartRef = useRef(refreshCart);

  isRefreshingRef.current = isRefreshing;
  refreshCartRef.current = refreshCart;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isOpen) return;

    const state = pullRef.current;
    let wheelIdle = null;
    // A "wheel gesture" is a burst of wheel events with no 140ms gap. Tracking
    // it lets a gesture that started mid-list be excluded wholesale, so coasting
    // to the top on trackpad momentum can't turn into a pull.
    let wheelGesture = false;
    let wheelBlocked = false;

    // Shared by touchend and the wheel's idle timer: commit the gesture if it
    // cleared the threshold, otherwise spring back.
    const commit = () => {
      if (!state.tracking) return;
      state.tracking = false;
      const reached = state.distance >= PULL_THRESHOLD;
      state.distance = 0;
      state.raw = 0;
      if (reached) {
        setPullDistance(PULL_THRESHOLD);
        setIsRefreshing(true);
      } else {
        setPullDistance(0);
      }
    };

    const cancel = () => {
      state.tracking = false;
      state.raw = 0;
      if (state.distance !== 0) {
        state.distance = 0;
        setPullDistance(0);
      }
    };

    const onTouchStart = (e) => {
      if (isRefreshingRef.current || e.touches.length !== 1 || el.scrollTop > 0) return;
      state.startY = e.touches[0].clientY;
      state.tracking = true;
      state.source = "touch";
      state.distance = 0;
    };

    const onTouchMove = (e) => {
      if (!state.tracking || state.source !== "touch") return;

      // Scrolled away from the top mid-gesture -- hand the gesture back to the list.
      if (el.scrollTop > 0) {
        cancel();
        return;
      }

      const delta = e.touches[0].clientY - state.startY;
      if (delta <= 0) {
        if (state.distance !== 0) {
          state.distance = 0;
          setPullDistance(0);
        }
        return;
      }

      // Non-passive so this actually suppresses the iOS rubber-band while we
      // own the gesture.
      e.preventDefault();
      const damped =
        delta <= PULL_THRESHOLD
          ? delta
          : PULL_THRESHOLD + (delta - PULL_THRESHOLD) * 0.35;
      state.distance = Math.min(damped, PULL_MAX);
      setPullDistance(state.distance);
    };

    const onTouchEnd = () => {
      if (state.source !== "touch") return;
      commit();
    };

    // Desktop/trackpad: over-scrolling up at the top of the list drives the same
    // pull. Wheel has no end event, so a short idle timer stands in for touchend.
    const onWheel = (e) => {
      if (isRefreshingRef.current) return;

      if (!wheelGesture) {
        wheelGesture = true;
        wheelBlocked = el.scrollTop > 0;
      }
      // Keep the gesture alive on every event, so the timer only fires once the
      // wheel (and any momentum after it) has actually stopped.
      if (wheelIdle) clearTimeout(wheelIdle);
      wheelIdle = setTimeout(() => {
        wheelIdle = null;
        wheelGesture = false;
        wheelBlocked = false;
        commit();
      }, 140);

      if (wheelBlocked || el.scrollTop > 0) return;
      // Nothing pulled yet and the user is scrolling down -- leave the list alone.
      if (e.deltaY >= 0 && state.raw === 0) return;

      const raw = Math.max(0, state.raw - e.deltaY * 0.5);
      if (raw === 0) {
        cancel();
        return;
      }

      e.preventDefault();
      state.raw = raw;
      state.tracking = true;
      state.source = "wheel";
      const damped =
        raw <= PULL_THRESHOLD
          ? raw
          : PULL_THRESHOLD + (raw - PULL_THRESHOLD) * 0.35;
      state.distance = Math.min(damped, PULL_MAX);
      setPullDistance(state.distance);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      if (wheelIdle) clearTimeout(wheelIdle);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [isOpen]);

  // Run the actual refresh once the gesture commits. refreshCart is read from a
  // ref so the fresh cart it produces can't re-trigger this effect.
  useEffect(() => {
    if (!isRefreshing) return;
    let cancelled = false;
    let timer = null;

    const settle = () => {
      // Hold the spinner briefly so a fast response doesn't just flicker.
      timer = setTimeout(() => {
        if (cancelled) return;
        setIsRefreshing(false);
        setPullDistance(0);
      }, 450);
    };

    Promise.resolve(refreshCartRef.current?.()).then(settle, settle);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isRefreshing]);

  // Reset the gesture if the bag is closed mid-pull.
  useEffect(() => {
    if (isOpen) return;
    pullRef.current.tracking = false;
    pullRef.current.distance = 0;
    pullRef.current.raw = 0;
    pullRef.current.source = null;
    setPullDistance(0);
  }, [isOpen]);

  // Per-method delivery charges (prepaid vs COD) for the Shipping info tooltip.
  // Fetched lazily the first time the bag is opened.
  const [shippingBreakdown, setShippingBreakdown] = useState(null);
  useEffect(() => {
    if (!isOpen || shippingBreakdown) return;
    shippingApi
      .getConfig()
      .then((cfg) => setShippingBreakdown(cfg))
      .catch(() => {});
  }, [isOpen, shippingBreakdown]);

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

  // A finger drag has to track 1:1, so it runs untransitioned; discrete wheel
  // ticks and the release spring-back both want the easing.
  const pullTransition =
    pullRef.current.tracking && pullRef.current.source === "touch"
      ? "none"
      : "transform 0.2s ease";

  // No floating cart/bag on the login page
  if (pathname === "/login") return null;

  return (
    <div className="shopping-cart-container">
      <button
        className={`cart-button ${isOpen ? "hidden" : ""}`}
        onClick={toggleCart}
        aria-hidden={isOpen}
        tabIndex={isOpen ? -1 : 0}
      >
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
          {cartItems.length > 0 && (
            <DiscountProgress
              tierProgress={serverPricing?.tierProgress}
              variant="drawer"
            />
          )}
          <div className="cart-pull-area">
            <div
              className={`cart-pull-indicator ${isRefreshing ? "refreshing" : ""}`}
              style={{
                transform: `translateY(${pullDistance - PULL_THRESHOLD}px)`,
                transition: pullTransition,
              }}
              aria-hidden={pullDistance === 0}
            >
              <svg
                className="cart-pull-spinner"
                style={
                  isRefreshing
                    ? undefined
                    : { transform: `rotate(${(pullDistance / PULL_THRESHOLD) * 270}deg)` }
                }
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M21 12a9 9 0 1 1-6.22-8.56" />
              </svg>
              <span>
                {isRefreshing
                  ? "Refreshing bag"
                  : pullDistance >= PULL_THRESHOLD
                  ? "Release to refresh"
                  : "Pull to refresh"}
              </span>
            </div>
            <div
              ref={scrollRef}
              className="cart-items-scroll"
              style={{
                transform: `translateY(${pullDistance}px)`,
                transition: pullTransition,
              }}
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
                        </div>
                        {item.selectedSize && <p className="cart-item-size" style={{ fontSize: "0.75rem", color: "#888", marginTop: "2px" }}>{item.selectedSize}</p>}
                        {/* Price and stepper share a row: it balances the line
                            against the thumbnail and leaves Remove on its own
                            below, instead of crowding both controls together. */}
                        <div className="cart-item-price-row">
                          <p className="cart-item-price">&#8377;{item.price}</p>
                          {/* Deliberately NOT the shared CartQtyButton: that one
                              takes a product and looks the line up itself, and
                              falls back to an ADD TO CART button when it finds
                              none. Here the line is what we already have. */}
                          <div
                            className="cart-item-qty"
                            role="group"
                            aria-label={`${item.name} quantity`}
                          >
                            <button
                              type="button"
                              className="cart-item-qty-btn"
                              /* At 1 the minus removes the line, matching the
                                 product-tile stepper rather than dead-ending —
                                 updateQuantity clamps to 1, so it would other-
                                 wise do nothing at all. */
                              aria-label={quantity <= 1 ? `Remove ${item.name} from bag` : `Decrease ${item.name} quantity`}
                              onClick={() =>
                                quantity <= 1
                                  ? removeFromCart(itemId)
                                  : updateQuantity(itemId, quantity - 1)
                              }
                            >
                              &#8722;
                            </button>
                            <span className="cart-item-qty-value" aria-live="polite">{quantity}</span>
                            <button
                              type="button"
                              className="cart-item-qty-btn"
                              aria-label={`Increase ${item.name} quantity`}
                              onClick={() => updateQuantity(itemId, quantity + 1)}
                            >
                              &#43;
                            </button>
                          </div>
                        </div>
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
          </div>
          {cartItems.length > 0 && (
            <div className="cart-bottom-section">
              <CrossSellProducts cartItems={cartItems} />
              <div className="cart-footer">
                {serverPricing ? (
                  <>
                    <div className="cart-summary-row">
                      <span>Subtotal</span>
                      <span>&#8377;{formatPrice(serverPricing.subtotal)}</span>
                    </div>
                    {serverPricing.bundleDiscountTotal > 0 && (serverPricing.bundleDiscounts || []).map((bd, i) => (
                      <div key={i} className="cart-summary-row cart-discount-row">
                        <span>{bd.bundleName}</span>
                        <span>-&#8377;{formatPrice(bd.discountAmount)}</span>
                      </div>
                    ))}
                    {serverPricing.tierDiscount > 0 && (
                      <div className="cart-summary-row cart-discount-row">
                        <span>{serverPricing.tierLabel || `${serverPricing.tierPercent}% Off`}</span>
                        <span>-&#8377;{formatPrice(serverPricing.tierDiscount)}</span>
                      </div>
                    )}
                    {(serverPricing.specialCouponDiscountTotal || 0) > 0 && (serverPricing.specialCouponDiscounts || []).map((sp, i) => (
                      <div key={`sp-${i}`} className="cart-summary-row cart-discount-row">
                        <span>{sp.title || "Special Discount"}</span>
                        <span>-&#8377;{formatPrice(sp.discountAmount)}</span>
                      </div>
                    ))}
                    {(serverPricing.freeGifts || []).length > 0 && (serverPricing.freeGifts || []).map((gift, i) => (
                      <div key={`gift-${i}`} className="cart-summary-row cart-discount-row">
                        <span>Free Gift: {gift.productName || "Gift"}</span>
                        <span>FREE</span>
                      </div>
                    ))}
                    {serverPricing.shippingCost > 0 && (
                      <div className="cart-summary-row">
                        <span className="cart-summary-shipping-label">
                          Shipping
                          <ShippingChargesInfo breakdown={shippingBreakdown} />
                        </span>
                        <span>&#8377;{formatPrice(serverPricing.shippingCost)}</span>
                      </div>
                    )}
                    <div className="cart-summary-row cart-total-row">
                      <span>Total</span>
                      <span>&#8377;{formatPrice(serverPricing.total)}</span>
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
