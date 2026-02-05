"use client";
import "./wardrobe.css";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { products } from "./products";
import { useCartStore } from "@/store/cartStore";
import Copy from "@/components/Copy/Copy";
import { gsap } from "gsap";

const ProductCard = ({ product, productIndex, innerRef, style }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const imgIndex = ((productIndex - 1) % 4) + 1;
  const imgPath = `/p${imgIndex}.png`;

  return (
    <div className="product-card" ref={innerRef} style={style}>
      <Link href="/unit" className="product-card-image">
        <img src={imgPath} alt={product.name} />
      </Link>
      <div className="product-card-info">
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-description">{product.description}</p>
        <div className="product-card-footer">
          <span className="product-card-price">₹{product.price}</span>
          <button
            className="quick-add-btn"
            onClick={() => addToCart(product)}
          >
            Quick Add
          </button>
        </div>
      </div>
    </div>
  );
};

const FaceCareCard = ({ product, productIndex, innerRef, style }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const imgIndex = ((productIndex - 1) % 4) + 1;
  const imgPath = `/p${imgIndex}.png`;

  return (
    <div className="face-care-card" ref={innerRef} style={style}>
      <Link href="/unit" className="face-care-card-image">
        <img src={imgPath} alt={product.name} />
      </Link>
      <div className="face-care-card-info">
        <h3 className="face-care-card-name">{product.name}</h3>
        <div className="face-care-card-footer">
          <span className="face-care-card-price">₹{product.price}</span>
          <button className="face-care-view-clinicals" onClick={() => addToCart(product)}>ADD TO BAG</button>
        </div>
      </div>
    </div>
  );
};

export default function Wardrobe() {
  const [activeTag, setActiveTag] = useState("All");
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState("all");
  const productRefs = useRef([]);
  const isInitialMount = useRef(true);

  const sortProducts = (productsToSort, sortOption) => {
    const sorted = [...productsToSort];
    switch (sortOption) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "name-az":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-za":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return sorted;
    }
  };

  const filterByPrice = (productsToFilter, range) => {
    switch (range) {
      case "under-500":
        return productsToFilter.filter((p) => p.price < 500);
      case "500-1000":
        return productsToFilter.filter((p) => p.price >= 500 && p.price <= 1000);
      case "above-1000":
        return productsToFilter.filter((p) => p.price > 1000);
      default:
        return productsToFilter;
    }
  };

  const applyFiltersAndSort = (tag, sort, price) => {
    let result = tag === "All"
      ? products
      : products.filter((product) => product.tag === tag);
    result = filterByPrice(result, price);
    result = sortProducts(result, sort);
    return result;
  };

  const handleFilterChange = (newTag) => {
    if (isAnimating) return;
    if (newTag === activeTag) return;

    setIsAnimating(true);
    setActiveTag(newTag);

    window.dispatchEvent(new CustomEvent("page-transition", { detail: { active: true } }));

    gsap.to(productRefs.current.filter(Boolean), {
      opacity: 0,
      y: 20,
      duration: 0.25,
      stagger: 0.03,
      ease: "power3.out",
      onComplete: () => {
        const filtered = applyFiltersAndSort(newTag, sortBy, priceRange);
        setFilteredProducts(filtered);
      },
    });
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    const filtered = applyFiltersAndSort(activeTag, newSort, priceRange);
    setFilteredProducts(filtered);
  };

  const handlePriceFilterChange = (e) => {
    const newPrice = e.target.value;
    setPriceRange(newPrice);
    const filtered = applyFiltersAndSort(activeTag, sortBy, newPrice);
    setFilteredProducts(filtered);
  };

  useEffect(() => {
    productRefs.current = productRefs.current.slice(0, filteredProducts.length);

    gsap.fromTo(
      productRefs.current.filter(Boolean),
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: isInitialMount.current ? 0.6 : 0.3,
        stagger: isInitialMount.current ? 0.05 : 0.03,
        ease: "power3.out",
        onComplete: () => {
          setIsAnimating(false);
          isInitialMount.current = false;
          window.dispatchEvent(new CustomEvent("page-transition", { detail: { active: false } }));
        },
      }
    );
  }, [filteredProducts]);

  return (
    <div className="wardrobe-page">
      {/* Hero Section */}
      <section className="wardrobe-hero">
        <div className="wardrobe-hero-content">
          <Copy animateOnScroll={false} delay={0.3}>
            <p className="wardrobe-hero-label">Shop Collection</p>
          </Copy>
          <Copy animateOnScroll={false} delay={0.5}>
            <h1>Sacred Beauty</h1>
          </Copy>
          <Copy animateOnScroll={false} delay={0.7}>
            <p className="wardrobe-hero-subtitle">
              Discover our curated collection of Ayurvedic skincare rituals
            </p>
          </Copy>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          {["All", "Face Care", "Hair Care", "Body Care"].map((tag) => (
            <button
              key={tag}
              className={`category-btn ${activeTag === tag ? "active" : ""}`}
              onClick={() => handleFilterChange(tag)}
              disabled={isAnimating}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Sort and Filter Options */}
        <div className="sort-filter-bar">
          <div className="filter-group">
            <label htmlFor="price-filter">Filter</label>
            <select
              id="price-filter"
              value={priceRange}
              onChange={handlePriceFilterChange}
              className="filter-select"
            >
              <option value="all">All Prices</option>
              <option value="under-500">Under ₹500</option>
              <option value="500-1000">₹500 - ₹1000</option>
              <option value="above-1000">Above ₹1000</option>
            </select>
          </div>
          <span className="filter-divider"></span>
          <div className="filter-group">
            <label htmlFor="sort-by">Sort</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={handleSortChange}
              className="filter-select"
            >
              <option value="default">Featured</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="name-az">A → Z</option>
              <option value="name-za">Z → A</option>
            </select>
          </div>
        </div>
      </section>

      {activeTag === "Face Care" || activeTag === "Hair Care" || activeTag === "Body Care" ? (
        /* Category Layout - Card Style */
        <section className="face-care-section">
          {filteredProducts.slice(0, 3).map((product, index) => (
            <FaceCareCard
              key={product.name}
              product={product}
              productIndex={products.indexOf(product) + 1}
              innerRef={(el) => (productRefs.current[index] = el)}
              style={{ opacity: 0 }}
            />
          ))}
        </section>
      ) : (
        /* Default Layout for All */
        <>
          {/* Section 1: 2 Products + Spotlight Banner */}
          <section className="wardrobe-section section-row-1">
            <div className="products-pair">
              {filteredProducts.slice(0, 2).map((product, index) => (
                <ProductCard
                  key={product.name}
                  product={product}
                  productIndex={products.indexOf(product) + 1}
                  innerRef={(el) => (productRefs.current[index] = el)}
                  style={{ opacity: 0 }}
                />
              ))}
            </div>
            <div className="spotlight-banner">
              <div className="spotlight-content">
                <span>Featured</span>
                <h2>Product</h2>
                <h2>Spotlight</h2>
              </div>
            </div>
          </section>

          {/* Section 2: 4 Products in a Row */}
          <section className="wardrobe-section section-row-2">
            {filteredProducts.slice(2, 6).map((product, index) => (
              <ProductCard
                key={product.name}
                product={product}
                productIndex={products.indexOf(product) + 1}
                innerRef={(el) => (productRefs.current[index + 2] = el)}
                style={{ opacity: 0 }}
              />
            ))}
          </section>

          {/* Section 3: Banner (2 products wide) + 2 Products */}
          <section className="wardrobe-section section-row-4">
            <div className="side-banner">
              <div className="banner-content">
                <span>Ayurvedic</span>
                <h2>Banner</h2>
                <p>Pure ingredients for radiant skin</p>
              </div>
            </div>
            <div className="products-beside-banner">
              {filteredProducts.slice(6, 10).map((product, index) => (
                <ProductCard
                  key={product.name}
                  product={product}
                  productIndex={products.indexOf(product) + 1}
                  innerRef={(el) => (productRefs.current[index + 6] = el)}
                  style={{ opacity: 0 }}
                />
              ))}
            </div>
          </section>
        </>
      )}

    </div>
  );
}
