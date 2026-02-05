"use client";
import "./FeaturedSection.css";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { useCartStore } from "@/store/cartStore";

const FeaturedSection = () => {
  const addToCart = useCartStore((state) => state.addToCart);
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
      image: "/p1.png",
      link: "/wardrobe",
    },
    {
      id: 2,
      name: "Product 2",
      description: "Description of the product",
      price: "₹400",
      image: "/p2.png",
      link: "/wardrobe",
    },
    {
      id: 3,
      name: "Product 3",
      description: "Description of the product",
      price: "₹400",
      image: "/p3.png",
      link: "/wardrobe",
    },
    {
      id: 4,
      name: "Product 4",
      description: "Description of the product",
      price: "₹400",
      image: "/p4.png",
      link: "/wardrobe",
    },
  ];

  return (
    <>
      {/* Our Featured Products Section */}
      <section className="products-section">
        <h2 className="products-section-title">OUR FEATURED PRODUCTS</h2>
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-card-image">
                <img src={product.image} alt={product.name} />
                <div className="product-card-overlay">
                  <p className="product-card-overlay-text">{product.description}</p>
                </div>
              </div>
              <div className="product-card-info">
                <h3 className="product-card-name">{product.name}</h3>
                <div className="product-card-footer">
                  <span className="product-card-price">{product.price}</span>
                  <button className="product-card-btn" onClick={() => addToCart({ name: product.name, price: parseInt(product.price.replace(/[^\d]/g, '')) })}>Quick Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="featured-section">
        {/* Section Title */}
        <h2 className="featured-section-title">Why your skin deserves the best?</h2>

        {/* Asymmetric Grid - Desktop */}
        <div className="featured-grid">
          {/* Left Tall Card */}
          <div className="featured-card featured-card-tall">
            <Link href={categories[0].link}>
              <div className="featured-card-inner">
                <div className="featured-card-image">
                  <img src={categories[0].image} alt={categories[0].name} />
                </div>
                <span className="featured-card-label">{categories[0].name}</span>
              </div>
            </Link>
          </div>

          {/* Right Grid */}
          <div className="featured-grid-right">
            {categories.slice(1, 4).map((category) => (
              <div
                key={category.id}
                className="featured-card"
              >
                <Link href={category.link}>
                  <div className="featured-card-inner">
                    <div className="featured-card-image">
                      <img src={category.image} alt={category.name} />
                    </div>
                    <span className="featured-card-label">{category.name}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Card Stack */}
        <div
          className="featured-card-stack"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => handleTouchEnd(categories)}
        >
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`featured-stack-card ${index === activeCard ? 'active' : ''}`}
              style={{
                ...getCardStyle(index),
                transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease',
              }}
            >
              <Link href={category.link}>
                <div className="featured-card-inner">
                  <div className="featured-card-image">
                    <img src={category.image} alt={category.name} />
                  </div>
                  <span className="featured-card-label">{category.name}</span>
                </div>
              </Link>
            </div>
          ))}
          {/* Dots indicator */}
          <div className="featured-stack-dots">
            {categories.map((_, index) => (
              <span
                key={index}
                className={`featured-stack-dot ${index === activeCard ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturedSection;
