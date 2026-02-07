"use client";
import "./ShopByProduct.css";
import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

const ShopByProduct = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const addToCart = useCartStore((state) => state.addToCart);

  const categories = [
    {
      id: 1,
      name: "SKIN",
      subtitle: "CARE",
      tagline: "Discover The World Of Step-By-Step Care With Skincare Kit By Cleanse Ayurveda.",
      image: "/skin.jpg",
      navImage: "/category-skin.png",
      link: "/wardrobe?category=skin",
      price: "₹1,199.00",
      textColor: "#f8f6f3",
      imageTransform: "translate(-5%, -5%)",
      mobileImagePosition: "55% 40%",
      products: [
        {
          name: "Golden Elixir Serum",
          size: "30ml/1.0oz",
          oldPrice: "₹899",
          newPrice: "₹749",
          image: "/serum.jpg",
        },
        {
          name: "Turmeric Glow Cream",
          size: "50ml/1.69oz",
          oldPrice: "₹999",
          newPrice: "₹849",
          image: "/cream.jpg",
        },
      ],
    },
    {
      id: 2,
      name: "HAIR",
      subtitle: "CARE",
      tagline: "Nourish Your Hair From Root To Tip With Our Ayurvedic Hair Rituals.",
      image: "/hair.jpg",
      navImage: "/category-hair.png",
      link: "/wardrobe?category=hair",
      price: "₹999.00",
      textColor: "#3d2314",
      imageTransform: "translate(-6%, -2%)",
      mobileImagePosition: "80% 40%",
      products: [
        {
          name: "Herbal Hair Oil",
          size: "100ml/3.38oz",
          oldPrice: "₹699",
          newPrice: "₹599",
          image: "/serum.jpg",
        },
        {
          name: "Amla Shampoo",
          size: "200ml/6.76oz",
          oldPrice: "₹549",
          newPrice: "₹449",
          image: "/cream.jpg",
        },
      ],
    },
    {
      id: 3,
      name: "FACE",
      subtitle: "CARE",
      tagline: "Revitalize Your Face With Pure Ayurvedic Formulations.",
      image: "/face.jpg",
      navImage: "/category-face.png",
      link: "/wardrobe?category=face",
      price: "₹1,499.00",
      textColor: "#023020",
      imageTransform: "translate(-8%, -5%)",
      mobileImagePosition: "55% 40%",
      products: [
        {
          name: "Kumkumadi Face Oil",
          size: "15ml/0.5oz",
          oldPrice: "₹1,299",
          newPrice: "₹1,099",
          image: "/serum.jpg",
        },
        {
          name: "Rose Face Mist",
          size: "100ml/3.38oz",
          oldPrice: "₹599",
          newPrice: "₹499",
          image: "/pink.jpg",
        },
      ],
    },
  ];

  const currentCategory = categories[activeCategory];

  return (
    <section className="shop-by-product">
      <div className="sbp-main-image">
        <img
          src={currentCategory.image}
          alt={currentCategory.name}
          style={{ transform: currentCategory.imageTransform, objectPosition: currentCategory.mobileImagePosition }}
        />

        {/* Left side vertical text */}
        <div className="sbp-side-text" style={{ color: currentCategory.textColor }}>
          <span>SHOP BY</span>
          <span>CATEGORY</span>
        </div>

        {/* Product card right */}
        <div className="sbp-product-card sbp-product-card-right">
          <div className="sbp-product-card-header">
            <h4>{currentCategory.products[0].name.toUpperCase()}</h4>
            <p>{currentCategory.products[0].size}</p>
          </div>
          <div className="sbp-product-card-image">
            <img src={currentCategory.products[0].image} alt={currentCategory.products[0].name} />
          </div>
          <div className="sbp-product-card-footer">
            <div className="sbp-product-card-prices">
              <span className="sbp-old-price">{currentCategory.products[0].oldPrice}</span>
              <span className="sbp-new-price">{currentCategory.products[0].newPrice}</span>
            </div>
            <button className="sbp-product-card-btn" onClick={() => addToCart({ name: currentCategory.products[0].name, price: parseInt(currentCategory.products[0].newPrice.replace(/[^\d]/g, '')) })}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6h15l-1.5 9h-12z"/>
                <circle cx="9" cy="20" r="1"/>
                <circle cx="18" cy="20" r="1"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Rating */}
        <div className="sbp-rating">
          <div className="sbp-rating-stars">
            <span className="star filled">★</span>
            <span className="star filled">★</span>
            <span className="star filled">★</span>
            <span className="star filled">★</span>
            <span className="star">☆</span>
          </div>
          <span className="sbp-rating-value">4.8</span>
        </div>
      </div>

      {/* Bottom left content area */}
      <div className="sbp-content">
        <div className="sbp-text">
          <h2 className="sbp-title">
            {currentCategory.name}<br />
            {currentCategory.subtitle}
          </h2>
          <p className="sbp-tagline">{currentCategory.tagline}</p>
          <Link href={currentCategory.link} className="sbp-cta">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6h15l-1.5 9h-12z"/>
              <circle cx="9" cy="20" r="1"/>
              <circle cx="18" cy="20" r="1"/>
            </svg>
            <span className="sbp-cta-desktop">BUY KIT {currentCategory.price}</span>
            <span className="sbp-cta-mobile">BUY NOW</span>
          </Link>
        </div>
      </div>

      {/* Category navigation - center bottom */}
      <div className="sbp-nav">
        {categories.map((cat, index) => (
          <button
            key={cat.id}
            className={`sbp-nav-btn ${activeCategory === index ? 'active' : ''}`}
            onClick={() => setActiveCategory(index)}
          >
            <span className="sbp-nav-btn-text">{cat.name}</span>
            <span className="sbp-nav-btn-bar"></span>
            <img
              src={cat.navImage}
              alt={cat.name}
              className="sbp-nav-btn-img"
            />
          </button>
        ))}
      </div>
    </section>
  );
};



export default ShopByProduct;
