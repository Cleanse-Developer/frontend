"use client";
import "./FeaturedSection.css";
import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { productApi, bundleApi } from "@/lib/endpoints";
import { normalizeProduct, productUrl } from "@/lib/normalizers";
import { cardPrice } from "@/lib/formatters";
import ProductCard from "@/components/ProductCard/ProductCard";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// These sections fetch async and sit ABOVE the pinned PeelReveal section on the
// home page. When their height settles, recompute ScrollTrigger positions so the
// pin/start offsets aren't stale (root cause of the "SHOP NOW" scroll shift).
const refreshScrollTriggers = () => {
  requestAnimationFrame(() => ScrollTrigger.refresh());
};

const FeaturedSection = () => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [activeCard, setActiveCard] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    touchCurrentX.current = e.touches[0].clientX;
    const diff = touchCurrentX.current - touchStartX.current;
    setDragX(diff);
  }, [isDragging]);

  const handleTouchEnd = useCallback((categories) => {
    if (!isDragging) return;
    const diff = touchCurrentX.current - touchStartX.current;
    const threshold = 60;

    if (diff < -threshold && activeCard < categories.length - 1) {
      setActiveCard((prev) => prev + 1);
    } else if (diff > threshold && activeCard > 0) {
      setActiveCard((prev) => prev - 1);
    }

    setDragX(0);
    setIsDragging(false);
  }, [isDragging, activeCard]);

  const getCardStyle = (index) => {
    const diff = index - activeCard;

    if (diff < -1) {
      return { transform: "translateX(-120%) scale(0.9)", opacity: 0, zIndex: 0 };
    }
    if (diff === -1) {
      const drag = isDragging ? Math.max(dragX * 0.3, 0) : 0;
      return {
        transform: `translateX(calc(-110% + ${drag}px)) scale(0.95) rotate(-3deg)`,
        opacity: 0.5,
        zIndex: 1,
      };
    }
    if (diff === 0) {
      const drag = isDragging ? dragX : 0;
      const rotate = isDragging ? dragX * 0.04 : 0;
      return {
        transform: `translateX(${drag}px) scale(1) rotate(${rotate}deg)`,
        opacity: 1,
        zIndex: 2,
      };
    }
    if (diff === 1) {
      // Next card peeks from right edge of screen, tilted
      const drag = isDragging ? Math.min(dragX * 0.5, 0) : 0;
      return {
        transform: `translateX(calc(103% + ${drag}px)) translateY(-25px) scale(0.95) rotate(-12deg)`,
        opacity: 1,
        zIndex: 3,
      };
    }
    return { transform: "translateX(100%) scale(0.9) rotate(6deg)", opacity: 0, zIndex: 0 };
  };
  const categories = [
    {
      id: 1,
      name: "SERUMS",
      image: "/tall.jpg",
      size: "tall",
      link: "/wardrobe",
    },
    {
      id: 2,
      name: "FACE CREAM",
      image: "/cream.jpg",
      size: "normal",
      link: "/wardrobe",
    },
    {
      id: 3,
      name: "LOTION",
      image: "/serum.jpg",
      size: "normal",
      link: "/wardrobe",
    },
    {
      id: 4,
      name: "CLEANSE",
      image: "/pink.jpg",
      size: "normal",
      link: "/wardrobe",
    },
  ];

  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    productApi.getAll({ limit: 4, sort: "featured" }).then((data) => {
      setFeaturedProducts((data.products || []).map(normalizeProduct));
    }).catch(() => {}).finally(refreshScrollTriggers);
  }, []);

  return (
    <>
      {/* Our Featured Products Section */}
      <section className="products-section">
        <h2 className="products-section-title">OUR BEST SELLERS</h2>
        <div className="products-grid">
          {featuredProducts.map((product, i) => (
            <ProductCard key={product._id || i} product={product} index={i} />
          ))}
        </div>
      </section>
    </>
  );
};

// Normalise ALL-CAPS CMS values to Title Case (the design no longer uses caps).
const toTitle = (s) => (s || "").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export const BentoSection = () => {
  const { addToCart } = useCart();
  const settings = useSettings();
  const cmsBento = settings.cmsBento || {};
  const leftCard = cmsBento.leftCard || {};
  const ingredientsCard = cmsBento.ingredientsCard || {};

  /* Driven by the CMS Ingredients Card description; falls back to default copy
     only when the field is empty. */
  const ingredientsDesc =
    ingredientsCard.description ||
    "Turmeric, Neem, Tulsi, Aloe Vera and Rose, time-honoured botanicals that calm, nourish and renew your skin.";

  const defaultProducts = [
    { id: 1, name: "Cleanse Perfume", price: 700, image: "/images/why2.png", link: "/wardrobe" },
    { id: 2, name: "Cleanse Perfume", price: 700, image: "/images/why2.png", link: "/wardrobe" },
  ];

  const featuredProducts = cmsBento.featuredProducts?.length > 0
    ? cmsBento.featuredProducts.map((p) => {
        const np = normalizeProduct(p);
        return { id: np._id, name: np.name, price: cardPrice(np), image: np.primaryImage || "/images/why2.png", link: productUrl(np) };
      })
    : defaultProducts;

  return (
    <section className="featured-section">
      <div className="featured-section-header">
        <h2 className="featured-section-title" dangerouslySetInnerHTML={{ __html: (cmsBento.sectionTitle || "Why your skin deserves the best?").replace(/\n/g, "<br />") }} />
        <div className="featured-rating-badge">
          <div className="featured-rating-top">
            <span className="featured-rating-text">{cmsBento.ratingText || "4+ Star Ratings"}</span>
            <div className="featured-rating-ellipses">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rating-ellipse" />
              ))}
            </div>
          </div>
          <div className="featured-rating-stars">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#1a1a1a" stroke="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            ))}
          </div>
        </div>
      </div>

      <div className="featured-grid">
        <div className="featured-card featured-card-tall">
          <div className="featured-card-inner">
            <div className="featured-card-image">
              <img src={leftCard.image?.url || "/images/why1.png"} alt={leftCard.label || "100% Ayurvedic skincare"} loading="lazy" />
            </div>
            <div className="featured-ayurvedic-label">
              <h3 className="ayurvedic-title">{toTitle(leftCard.label || "100% Ayurvedic")}</h3>
              <p className="ayurvedic-desc">{leftCard.description || "Lab tested products for all skin types and all age groups"}</p>
            </div>
          </div>
        </div>

        <div className="featured-grid-right">
          <div className="featured-card featured-ingredients-card">
            <img src={ingredientsCard.image?.url || "/images/why3.png"} alt="Ayurvedic ingredients" className="ingredients-bg" loading="lazy" />
            <div className="ingredients-content">
              <h3 className="ingredients-heading">{toTitle(ingredientsCard.heading || "5 Ayurvedic Ingredients")}</h3>
              <p className="ingredients-desc">{ingredientsDesc}</p>
            </div>
          </div>

          {featuredProducts.map((product) => (
            <div key={product.id} className="featured-card featured-product-card">
              {/* Only image+info navigate; cart button sits OUTSIDE the link so a
                  tap adds to cart + expands (never opens the product page). */}
              <Link href={product.link || "/wardrobe"} className="featured-product-link">
                <img src={product.image} alt={product.name} className="featured-product-bg" loading="lazy" />
                <div className="featured-product-info">
                  <h4 className="featured-product-name" dangerouslySetInnerHTML={{ __html: product.name.replace(/\s+/g, "<br />") }} />
                  <span className="featured-product-price">₹{product.price}</span>
                </div>
              </Link>
              <button className="product-card-cart-btn featured-product-cart-btn" onClick={() => addToCart({ _id: product.id, name: product.name, price: product.price })}>
                <span className="cart-btn-circle">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </span>
                <span className="cart-btn-text">Add to cart</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* The supplied root/branch artwork, cropped to its content bounds and saved as
   /root-branch.png. It grows out of the card's bottom-right corner on hover —
   see the mask sweep in .sbc-flora-roots. Identical on all three cards. */
const SbcFlora = () => (
  <span className="sbc-card-flora" aria-hidden="true">
    <img src="/root-branch.png" alt="" className="sbc-flora-roots" loading="lazy" />
  </span>
);

export const ShopByCategory = () => {
  const categories = [
    { id: 1, name: "skin care", image: "/images/cat-skin.png", link: "/wardrobe?category=face-care" },
    { id: 2, name: "hair care", image: "/images/cat-hair.png", link: "/wardrobe?category=hair-care" },
    { id: 3, name: "face care", image: "/images/cat-face.png", link: "/wardrobe?category=face-care" },
  ];

  return (
    <section className="shop-by-category">
      <h2 className="sbc-title">SHOP BY CATEGORY</h2>
      <div className="sbc-grid">
        {categories.map((cat) => (
          <a key={cat.id} href={cat.link} className="sbc-card">
            <div className="sbc-card-box">
              <span className="sbc-card-name">{cat.name}</span>
            </div>
            {/* Before the product in the DOM so it grows out from BEHIND it. */}
            <SbcFlora />
            <img src={cat.image} alt={cat.name} className="sbc-card-img" loading="lazy" />
          </a>
        ))}
      </div>
    </section>
  );
};

export const BuildYourRitual = () => {
  const { addToCart } = useCart();
  const [bundleData, setBundleData] = useState(null);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    bundleApi.getAll().then((data) => {
      const bundles = data.bundles || data || [];
      if (bundles.length > 0) {
        const b = bundles[0];
        setBundleData(b);
        setSelected((b.products || []).map(() => true));
      }
    }).catch(() => {}).finally(refreshScrollTriggers);
  }, []);

  const bundleRef = useRef(null);

  const toggleItem = (index) => {
    setSelected((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
    // On mobile, reveal the bundle summary + "Add to Cart" button near the
    // bottom of the viewport (with a little breathing room below).
    if (typeof window !== "undefined" && window.innerWidth <= 480) {
      requestAnimationFrame(() => {
        const el = bundleRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const extra = 140; // scroll a bit further so the bar isn't at the very edge
        const top = window.scrollY + rect.bottom - window.innerHeight + extra;
        window.scrollTo({ top, behavior: "smooth" });
      });
    }
  };

  const products = bundleData ? (bundleData.products || []) : [];
  const minProducts = bundleData?.minProducts || 3;
  const selectedCount = selected.filter(Boolean).length;
  const meetsMin = selectedCount >= minProducts;

  const originalTotal = products.reduce((sum, p, i) => selected[i] ? sum + Number(p.price || 0) : sum, 0);
  const discountedTotal = bundleData && meetsMin
    ? bundleData.discountType === "percentage"
      ? Math.round(originalTotal * (1 - bundleData.discountValue / 100))
      : Math.max(0, originalTotal - bundleData.discountValue)
    : originalTotal;
  const savings = originalTotal - discountedTotal;

  const discountLabel = bundleData
    ? bundleData.discountType === "percentage"
      ? `${bundleData.discountValue}%`
      : `₹${bundleData.discountValue}`
    : "";

  const handleAddToCart = async () => {
    for (let i = 0; i < products.length; i++) {
      if (selected[i]) await addToCart(products[i]);
    }
  };

  if (!bundleData) return null;

  // One band's worth of text. Duplicated inside each band so the loop is
  // seamless: the track shifts by exactly half its width, landing the copy
  // where the original started.
  const bandText = `Bundle · Save ${discountLabel} · `.repeat(8);

  return (
    <section className="byr-section">
      <div className="byr-header">
        <span className="byr-badge">Bundle · Save {discountLabel}</span>
        <h2 className="byr-title">{bundleData.name || "BUILD YOUR RITUAL"}</h2>
        <p className="byr-subtitle">
          {bundleData.subtitle || `Buy ${minProducts}+ products and save upto ${discountLabel}`}
        </p>
      </div>

      {/* Marquee band below the heading. In the flow rather than behind the
          bundle: the cards are opaque and fill the centre, so a backdrop band
          there is never actually seen. */}
      <div className="byr-cross-band byr-cross-band-a" aria-hidden="true">
        <div className="byr-cross-track">
          <span>{bandText}</span>
          <span>{bandText}</span>
        </div>
      </div>

      <div className="byr-layout">
        <span className="byr-ribbon" aria-hidden="true">Save {discountLabel}</span>
        <div className="byr-grid">
          {products.map((product, i) => {
            const isSelected = selected[i];
            const imgSrc = (product.images?.find((img) => img.isPrimary) || product.images?.[0])?.url || `/images/${(i % 4) + 1}.png`;
            return (
              <div
                key={product._id || i}
                className={`byr-card ${isSelected ? "byr-card-selected" : ""}`}
                onClick={() => toggleItem(i)}
                style={{ cursor: "pointer" }}
              >
                <div className="byr-card-image">
                  <img src={imgSrc} alt={product.name} loading="lazy" />
                  <div className="byr-check-btn">
                    <div className={`byr-check-circle ${isSelected ? "byr-check-circle-checked" : ""}`}>
                      {isSelected ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#663532" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
                <div className="byr-card-info">
                  <h4 className="byr-card-name">{product.name}</h4>
                  {product.shortDescription && <p className="byr-card-desc">{product.shortDescription}</p>}
                  <span className="byr-card-price">₹{product.price}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="byr-bundle" ref={bundleRef}>
          {/* Compact "zomato-style" bar — shown on mobile only */}
          <div className="byr-bundle-compact">
            <div className="byr-compact-left">
              <div className="byr-compact-thumbs">
                {products
                  .filter((_, i) => selected[i])
                  .slice(0, 3)
                  .map((product, i) => {
                    const imgSrc = (product.images?.find((img) => img.isPrimary) || product.images?.[0])?.url || `/images/${(i % 4) + 1}.png`;
                    return (
                      <div className="byr-compact-thumb" key={product._id || i}>
                        <img src={imgSrc} alt={product.name} />
                      </div>
                    );
                  })}
              </div>
              <div className="byr-compact-text">
                <span className="byr-compact-count">{selectedCount} item{selectedCount === 1 ? "" : "s"} added</span>
                <span className="byr-compact-sub">
                  ₹{meetsMin ? discountedTotal : originalTotal}
                  {meetsMin && savings > 0 ? ` · Save ₹${savings}` : ""}
                </span>
              </div>
            </div>
            {selectedCount > 0 && (
              <button className="byr-compact-btn" onClick={handleAddToCart}>
                Add <span aria-hidden="true">›</span>
              </button>
            )}
          </div>

          <div className="byr-bundle-full">
          <h3 className="byr-bundle-title">YOUR BUNDLE</h3>
          {/* Turns the passive "add N more" line into a visible goal: the bar
              fills toward minProducts, so the discount reads as something you
              are close to unlocking rather than a rule you have to parse. */}
          <div
            className={`byr-progress${meetsMin ? " byr-progress-unlocked" : ""}`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={minProducts}
            aria-valuenow={Math.min(selectedCount, minProducts)}
          >
            <div className="byr-progress-track">
              <div
                className="byr-progress-fill"
                style={{ width: `${Math.min(100, (selectedCount / minProducts) * 100)}%` }}
              />
            </div>
            <p className="byr-progress-label">
              {meetsMin
                ? `${discountLabel} off unlocked`
                : `${selectedCount} of ${minProducts} — add ${minProducts - selectedCount} more for ${discountLabel} off`}
            </p>
          </div>
          <div className="byr-bundle-divider" />
          <div className="byr-bundle-slots">
            {products.map((product, i) => {
              const isSelected = selected[i];
              const imgSrc = (product.images?.find((img) => img.isPrimary) || product.images?.[0])?.url || `/images/${(i % 4) + 1}.png`;
              return (
                <div key={product._id || i} className="byr-bundle-slot">
                  {isSelected ? (
                    <>
                      <div className="byr-slot-img">
                        <img src={imgSrc} alt={product.name} />
                      </div>
                      <div className="byr-slot-info">
                        <span className="byr-slot-name">{product.name}</span>
                        <span className="byr-slot-price">₹{product.price}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="byr-slot-img byr-slot-empty" />
                      <div className="byr-slot-info">
                        <div className="byr-slot-line byr-slot-line-long" />
                        <div className="byr-slot-line byr-slot-line-short" />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="byr-bundle-divider" />
          <div className="byr-bundle-total">
            <span>TOTAL</span>
            <div className="byr-total-prices">
              {meetsMin && savings > 0 && (
                <span className="byr-total-original">₹{originalTotal}</span>
              )}
              <span className="byr-total-final">₹{meetsMin ? discountedTotal : originalTotal}</span>
            </div>
          </div>
          {/* Both stay mounted and are hidden/disabled rather than unmounted:
              dropping them out of the DOM collapsed the summary's height, and
              since the summary is the tallest column it dragged the whole
              section up — the layout jumped on every select/deselect. */}
          <p className={`byr-savings${meetsMin && savings > 0 ? "" : " byr-savings-placeholder"}`}>
            YOU SAVE ₹{savings}
          </p>
          <button
            className="byr-add-btn"
            onClick={handleAddToCart}
            disabled={selectedCount === 0}
          >
            ADD BUNDLE TO CART
          </button>
          </div>
        </div>
      </div>

      {/* Second band, running the opposite way. */}
      <div className="byr-cross-band byr-cross-band-b" aria-hidden="true">
        <div className="byr-cross-track">
          <span>{bandText}</span>
          <span>{bandText}</span>
        </div>
      </div>
    </section>
  );
};

export const LatestLaunches = () => {
  const { addToCart } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productApi.getAll({ limit: 4, sort: "newest" }).then((data) => {
      setProducts((data.products || []).map(normalizeProduct));
    }).catch(() => {}).finally(refreshScrollTriggers);
  }, []);

  return (
    <section className="products-section latest-launches-section">
      <h2 className="products-section-title">OUR LATEST LAUNCHES</h2>
      <div className="products-grid">
        {products.map((product, i) => (
          <ProductCard key={product._id || i} product={product} index={i} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedSection;
