"use client";
import "./FeaturedSection.css";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { useCart } from "@/context/CartContext";

const FeaturedSection = () => {
  const { addToCart } = useCart();
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

  const featuredProducts = [
    {
      id: 1,
      name: "Product 1",
      description: "Description of the product",
      price: "₹400",
      image: "/images/1.png",
      link: "/wardrobe",
    },
    {
      id: 2,
      name: "Product 1",
      description: "Description of the product",
      price: "₹400",
      image: "/images/2.png",
      link: "/wardrobe",
    },
    {
      id: 3,
      name: "Product 1",
      description: "Description of the product",
      price: "₹400",
      image: "/images/3.png",
      link: "/wardrobe",
    },
    {
      id: 4,
      name: "Product 1",
      description: "Description of the product",
      price: "₹400",
      image: "/images/4.png",
      link: "/wardrobe",
    },
  ];

  return (
    <>
      {/* Our Featured Products Section */}
      <section className="products-section">
        <h2 className="products-section-title">OUR BEST SELLERS</h2>
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-card-image">
                <img src={product.image} alt={product.name} loading="lazy" />
              </div>
              <button className="product-card-cart-btn" onClick={() => addToCart({ name: product.name, price: parseInt(product.price.replace(/[^\d]/g, '')) })}>
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
                <h3 className="product-card-name">{product.name}</h3>
                <p className="product-card-desc">{product.description}</p>
                <div className="product-card-footer">
                  <span className="product-card-price">{product.price}</span>
                  <Link href={product.link} className="product-card-buy-btn">Buy Now</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export const WhySkinSection = () => {
  const { addToCart } = useCart();

  const bottomProducts = [
    { id: 1, name: "Cleanse Perfume", price: 700, image: "/images/why2.png", link: "/wardrobe" },
    { id: 2, name: "Cleanse Perfume", price: 700, image: "/images/why2.png", link: "/wardrobe" },
  ];

  return (
    <section className="featured-section">
      <div className="featured-section-header">
        <h2 className="featured-section-title">Why your skin deserves<br />the best?</h2>
        <div className="featured-rating-badge">
          <div className="featured-rating-top">
            <span className="featured-rating-text">4+ Star Ratings</span>
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
              <img src="/images/why1.png" alt="100% Ayurvedic skincare" loading="lazy" />
            </div>
            <div className="featured-ayurvedic-label">
              <h3 className="ayurvedic-title">100% AYURVEDIC</h3>
              <p className="ayurvedic-desc">Lab tested products for all skin types and all age groups</p>
            </div>
          </div>
        </div>

        <div className="featured-grid-right">
          <div className="featured-card featured-ingredients-card">
            <img src="/images/why3.png" alt="Ayurvedic ingredients" className="ingredients-bg" loading="lazy" />
            <div className="ingredients-content">
              <h3 className="ingredients-heading">5 AYURVEDIC INGREDIENTS</h3>
              <p className="ingredients-desc">lorem sit officia sint esse veniam aliquip ullamco ea consequat aute in consectetur exercitation quis do lorem veniam mollit ut nostrud commodo aute</p>
            </div>
          </div>

          {bottomProducts.map((product) => (
            <div key={product.id} className="featured-card featured-product-card">
              <img src={product.image} alt={product.name} className="featured-product-bg" loading="lazy" />
              <div className="featured-product-info">
                <h4 className="featured-product-name">Cleanse<br />Perfume</h4>
                <span className="featured-product-price">₹{product.price}</span>
              </div>
              <button className="product-card-cart-btn featured-product-cart-btn" onClick={() => addToCart({ name: product.name, price: product.price })}>
                <span className="cart-btn-circle">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </span>
                <span className="cart-btn-text">Add to Cart</span>
              </button>
            </div>
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
  const [bundle, setBundle] = useState([]);

  const products = [
    { id: 1, name: "Cleanse Hair Oil", price: 700, image: "/images/c1.png" },
    { id: 2, name: "Cleanse Shampoo", price: 600, image: "/images/c2.png" },
    { id: 3, name: "Cleanse Perfume", price: 800, image: "/images/c3.png" },
    { id: 4, name: "Cleanse Shampoo", price: 600, image: "/images/c2.png" },
    { id: 5, name: "Cleanse Hair Oil", price: 700, image: "/images/c1.png" },
    { id: 6, name: "Cleanse Perfume", price: 800, image: "/images/c3.png" },
  ];

  const toggleBundle = (product) => {
    setBundle((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= 3) return prev;
      return [...prev, product];
    });
  };

  const total = bundle.reduce((sum, p) => sum + p.price, 0);
  const discount = bundle.length === 3 ? Math.round(total * 0.15) : 0;

  return (
    <section className="byr-section">
      <div className="byr-header">
        <h2 className="byr-title">BUILD YOUR RITUAL</h2>
        <p className="byr-subtitle">Buy 3 products and save upto 15%</p>
      </div>
      <div className="byr-layout">
        <div className="byr-grid">
          {products.map((product) => (
            <div key={product.id} className={`byr-card ${bundle.find((p) => p.id === product.id) ? 'byr-card-selected' : ''}`}>
              <div className="byr-card-image">
                <img src={product.image} alt={product.name} loading="lazy" />
              </div>
              <button className="product-card-cart-btn byr-cart-btn" onClick={() => toggleBundle(product)}>
                <span className="cart-btn-circle">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </span>
                <span className="cart-btn-text">Add to Cart</span>
              </button>
            </div>
          ))}
        </div>
        <div className="byr-bundle">
          <h3 className="byr-bundle-title">YOUR BUNDLE</h3>
          <p className="byr-bundle-desc">Add 3 products and save 15%</p>
          <div className="byr-bundle-divider" />
          <div className="byr-bundle-slots">
            {[0, 1, 2].map((i) => (
              <div key={i} className="byr-bundle-slot">
                {bundle[i] ? (
                  <>
                    <div className="byr-slot-img">
                      <img src={bundle[i].image} alt={bundle[i].name} />
                    </div>
                    <div className="byr-slot-info">
                      <div className="byr-slot-line byr-slot-line-long" />
                      <div className="byr-slot-line byr-slot-line-short" />
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
            ))}
          </div>
          <div className="byr-bundle-divider" />
          <div className="byr-bundle-total">
            <span>Total</span>
            <span>₹{bundle.length === 3 ? total - discount : total || '000'}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export const LatestLaunches = () => {
  const { addToCart } = useCart();

  const products = [
    {
      id: 1,
      name: "Product 1",
      description: "Description of the product",
      price: "₹400",
      image: "/images/1.png",
      link: "/wardrobe",
    },
    {
      id: 2,
      name: "Product 1",
      description: "Description of the product",
      price: "₹400",
      image: "/images/2.png",
      link: "/wardrobe",
    },
    {
      id: 3,
      name: "Product 1",
      description: "Description of the product",
      price: "₹400",
      image: "/images/3.png",
      link: "/wardrobe",
    },
    {
      id: 4,
      name: "Product 1",
      description: "Description of the product",
      price: "₹400",
      image: "/images/4.png",
      link: "/wardrobe",
    },
  ];

  return (
    <section className="products-section">
      <h2 className="products-section-title">OUR LATEST LAUNCHES</h2>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-card-image">
              <img src={product.image} alt={product.name} loading="lazy" />
            </div>
            <button className="product-card-cart-btn" onClick={() => addToCart({ name: product.name, price: parseInt(product.price.replace(/[^\d]/g, '')) })}>
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
              <h3 className="product-card-name">{product.name}</h3>
              <p className="product-card-desc">{product.description}</p>
              <div className="product-card-footer">
                <span className="product-card-price">{product.price}</span>
                <Link href={product.link} className="product-card-buy-btn">Buy Now</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedSection;
