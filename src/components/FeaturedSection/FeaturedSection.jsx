"use client";
import "./FeaturedSection.css";
import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useSettings } from "@/context/SettingsContext";
import { productApi, bundleApi } from "@/lib/endpoints";
import { normalizeProduct, productUrl } from "@/lib/normalizers";

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
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* Our Featured Products Section */}
      <section className="products-section">
        <h2 className="products-section-title">OUR BEST SELLERS</h2>
        <div className="products-grid">
          {featuredProducts.map((product, i) => (
            <div key={product._id || i} className="product-card">
              <Link href={productUrl(product)} className="product-card-image">
                <img src={product.primaryImage || `/images/${(i % 4) + 1}.png`} alt={product.name} loading="lazy" />
              </Link>
              <button className="product-card-cart-btn" onClick={() => addToCart(product)}>
                <span className="cart-btn-circle">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </span>
                <span className="cart-btn-text">Add to Cart</span>
              </button>
              <div className="product-card-info">
                <Link href={productUrl(product)}><h3 className="product-card-name">{product.name}</h3></Link>
                <p className="product-card-desc">{product.shortDescription || product.description}</p>
                <div className="product-card-footer">
                  <span className="product-card-price">₹{product.price}</span>
                  <button className="product-card-buy-btn" onClick={() => { addToCart(product); router.push("/cart"); }}>Buy Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export const BentoSection = () => {
  const { addToCart } = useCart();
  const settings = useSettings();
  const cmsBento = settings.cmsBento || {};
  const leftCard = cmsBento.leftCard || {};
  const ingredientsCard = cmsBento.ingredientsCard || {};

  const defaultProducts = [
    { id: 1, name: "Cleanse Perfume", price: 700, image: "/images/why2.png", link: "/wardrobe" },
    { id: 2, name: "Cleanse Perfume", price: 700, image: "/images/why2.png", link: "/wardrobe" },
  ];

  const featuredProducts = cmsBento.featuredProducts?.length > 0
    ? cmsBento.featuredProducts.map((p) => {
        const np = normalizeProduct(p);
        return { id: np._id, name: np.name, price: np.price, image: np.primaryImage || "/images/why2.png", link: productUrl(np) };
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
              <h3 className="ayurvedic-title">{leftCard.label || "100% AYURVEDIC"}</h3>
              <p className="ayurvedic-desc">{leftCard.description || "Lab tested products for all skin types and all age groups"}</p>
            </div>
          </div>
        </div>

        <div className="featured-grid-right">
          <div className="featured-card featured-ingredients-card">
            <img src={ingredientsCard.image?.url || "/images/why3.png"} alt="Ayurvedic ingredients" className="ingredients-bg" loading="lazy" />
            <div className="ingredients-content">
              <h3 className="ingredients-heading">{ingredientsCard.heading || "5 AYURVEDIC INGREDIENTS"}</h3>
              <p className="ingredients-desc">{ingredientsCard.description || "lorem sit officia sint esse veniam aliquip ullamco ea consequat aute in consectetur exercitation quis do lorem veniam mollit ut nostrud commodo aute"}</p>
            </div>
          </div>

          {featuredProducts.map((product) => (
            <Link key={product.id} href={product.link || "/wardrobe"} className="featured-card featured-product-card">
              <img src={product.image} alt={product.name} className="featured-product-bg" loading="lazy" />
              <div className="featured-product-info">
                <h4 className="featured-product-name" dangerouslySetInnerHTML={{ __html: product.name.replace(/\s+/g, "<br />") }} />
                <span className="featured-product-price">₹{product.price}</span>
              </div>
              <button className="product-card-cart-btn featured-product-cart-btn" onClick={(e) => { e.preventDefault(); addToCart({ _id: product.id, name: product.name, price: product.price }); }}>
                <span className="cart-btn-circle">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </span>
                <span className="cart-btn-text">Add to Cart</span>
              </button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export const ShopByCategory = () => {
  const categories = [
    { id: 1, name: "SKIN CARE", image: "/images/c1.png", link: "/wardrobe?category=skin" },
    { id: 2, name: "HAIR CARE", image: "/images/c2.png", link: "/wardrobe?category=hair" },
    { id: 3, name: "FACE CARE", image: "/images/c3.png", link: "/wardrobe?category=face" },
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
    }).catch(() => {});
  }, []);

  const toggleItem = (index) => {
    setSelected((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
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

  return (
    <section className="byr-section">
      <div className="byr-header">
        <h2 className="byr-title">{bundleData.name || "BUILD YOUR RITUAL"}</h2>
        <p className="byr-subtitle">
          {bundleData.subtitle || `Buy ${minProducts}+ products and save upto ${discountLabel}`}
        </p>
      </div>
      <div className="byr-layout">
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
                </div>
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
            );
          })}
        </div>
        <div className="byr-bundle">
          <h3 className="byr-bundle-title">YOUR BUNDLE</h3>
          <p className="byr-bundle-desc">
            {meetsMin
              ? `Save ${discountLabel} on this bundle`
              : `Add ${minProducts - selectedCount} more to unlock ${discountLabel} off`}
          </p>
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
          {meetsMin && savings > 0 && (
            <p className="byr-savings">YOU SAVE ₹{savings}</p>
          )}
          {selectedCount > 0 && (
            <button className="byr-add-btn" onClick={handleAddToCart}>
              ADD BUNDLE TO CART
            </button>
          )}
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
    }).catch(() => {});
  }, []);

  return (
    <section className="products-section">
      <h2 className="products-section-title">OUR LATEST LAUNCHES</h2>
      <div className="products-grid">
        {products.map((product, i) => (
          <div key={product._id || i} className="product-card">
            <Link href={productUrl(product)} className="product-card-image">
              <img src={product.primaryImage || `/images/${(i % 4) + 1}.png`} alt={product.name} loading="lazy" />
            </Link>
            <button className="product-card-cart-btn" onClick={() => addToCart(product)}>
              <span className="cart-btn-circle">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </span>
              <span className="cart-btn-text">Add to Cart</span>
            </button>
            <div className="product-card-info">
              <Link href={productUrl(product)}><h3 className="product-card-name">{product.name}</h3></Link>
              <p className="product-card-desc">{product.shortDescription || product.description}</p>
              <div className="product-card-footer">
                <span className="product-card-price">₹{product.price}</span>
                <button className="product-card-buy-btn" onClick={() => { addToCart(product); router.push("/cart"); }}>Buy Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedSection;
