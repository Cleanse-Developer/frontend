"use client";
import "@/components/FeaturedSection/FeaturedSection.css";
import "./wardrobe.css";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { gsap } from "gsap";
import { productApi } from "@/lib/endpoints";
import { normalizeProduct, productUrl } from "@/lib/normalizers";

export default function Wardrobe() {
  return (
    <Suspense>
      <WardrobeContent />
    </Suspense>
  );
}

const TAG_MAP = {
  face: "Face Care",
  "face care": "Face Care",
  "face-care": "Face Care",
  hair: "Hair Care",
  "hair care": "Hair Care",
  "hair-care": "Hair Care",
  body: "Body Care",
  "body care": "Body Care",
  "body-care": "Body Care",
  skin: "Face Care",
  "skin care": "Face Care",
  "skin-care": "Face Care",
};

function resolveTag(param) {
  if (!param) return "All";
  const key = param.toLowerCase().trim();
  return TAG_MAP[key] || "All";
}

function WardrobeContent() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const initialTag = resolveTag(categoryParam);
  const [allProducts, setAllProducts] = useState([]);
  const [activeTag, setActiveTag] = useState(initialTag);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState("all");
  const [loading, setLoading] = useState(true);
  const productRefs = useRef([]);
  const isInitialMount = useRef(true);

  // Fetch all products from API on mount
  const activeTagRef = useRef(activeTag);
  activeTagRef.current = activeTag;

  useEffect(() => {
    productApi.getAll({ limit: 50 }).then((data) => {
      const normalized = (data.products || []).map(normalizeProduct);
      setAllProducts(normalized);
      const tag = activeTagRef.current;
      const initial = tag === "All" ? normalized : normalized.filter((p) => p.tag === tag);
      setFilteredProducts(initial);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      ? allProducts
      : allProducts.filter((product) => product.tag === tag);
    result = filterByPrice(result, price);
    result = sortProducts(result, sort);
    return result;
  };

  const router = useRouter();

  const handleFilterChange = (newTag) => {
    if (isAnimating) return;
    if (newTag === activeTag) return;

    setActiveTag(newTag);

    // Sync URL with selected tag
    const url = newTag === "All" ? "/wardrobe" : `/wardrobe?category=${newTag.toLowerCase().replace(/\s+/g, "-")}`;
    router.replace(url, { scroll: false });

    // If still loading, just update the tag — products will filter once they arrive
    if (loading) return;

    setIsAnimating(true);
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
      {/* Hero Section - same as home */}
      <section className="wardrobe-hero">
        <div className="wardrobe-hero-content">
          <div className="wardrobe-breadcrumb">
            <Link href="/">HOME</Link>/ <Link href="/wardrobe">SHOP</Link>/ <span>{activeTag === "All" ? "ALL" : activeTag.toUpperCase()}</span>
          </div>
          <h1 className="wardrobe-hero-title">
            {activeTag === "All" ? "ALL PRODUCTS" : activeTag.toUpperCase()}
          </h1>
        </div>
      </section>

      {/* Category Filter + Sort */}
      <section className="wardrobe-filters">
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

      {loading && (
        <section className="wardrobe-section section-row-2" style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ opacity: 0.5, fontSize: "1rem", letterSpacing: "0.1em" }}>LOADING PRODUCTS...</p>
        </section>
      )}

      {!loading && (
        <>
          {/* Section 1: 2 Products + Spotlight Banner */}
          <section className="wardrobe-section section-row-1">
            <div className="products-pair">
              {filteredProducts.slice(0, 2).map((product, index) => {
                const imgIndex = ((allProducts.indexOf(product)) % 4) + 1;
                return (
                  <div key={product.name + index} className="product-card" ref={(el) => (productRefs.current[index] = el)} style={{ opacity: 0 }}>
                    <Link href={productUrl(product)} className="product-card-image">
                      <img src={product.primaryImage || `/images/${imgIndex}.png`} alt={product.name} loading="lazy" />
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
                      <p className="product-card-desc">{product.description}</p>
                      <div className="product-card-footer">
                        <span className="product-card-price">₹{product.price}</span>
                        <button className="product-card-buy-btn" onClick={() => { addToCart(product); router.push("/cart"); }}>Buy Now</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="spotlight-banner">
              <img src="/images/top.png" alt="Featured Collection" className="spotlight-banner-img" />
            </div>
          </section>

          {/* Section 2: 4 Products in a Row */}
          <section className="wardrobe-section section-row-2">
            {filteredProducts.slice(2, 6).map((product, index) => {
              const imgIndex = ((allProducts.indexOf(product)) % 4) + 1;
              return (
                <div key={product.name + index} className="product-card" ref={(el) => (productRefs.current[index + 2] = el)} style={{ opacity: 0 }}>
                  <Link href={productUrl(product)} className="product-card-image">
                    <img src={product.primaryImage || `/images/${imgIndex}.png`} alt={product.name} loading="lazy" />
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
                    <p className="product-card-desc">{product.description}</p>
                    <div className="product-card-footer">
                      <span className="product-card-price">₹{product.price}</span>
                      <button className="product-card-buy-btn" onClick={() => { addToCart(product); router.push("/cart"); }}>Buy Now</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Section 3: Side Banner + 4 Products */}
          <section className="wardrobe-section section-row-3">
            <div className="side-banner">
              <img src="/images/banner.png" alt="Ayurvedic Collection" className="side-banner-img" />
            </div>
            <div className="products-beside-banner">
              {filteredProducts.slice(6, 10).map((product, index) => {
                const imgIndex = ((allProducts.indexOf(product)) % 4) + 1;
                return (
                  <div key={product.name + index} className="product-card" ref={(el) => (productRefs.current[index + 6] = el)} style={{ opacity: 0 }}>
                    <Link href={productUrl(product)} className="product-card-image">
                      <img src={product.primaryImage || `/images/${imgIndex}.png`} alt={product.name} loading="lazy" />
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
                      <p className="product-card-desc">{product.description}</p>
                      <div className="product-card-footer">
                        <span className="product-card-price">₹{product.price}</span>
                        <button className="product-card-buy-btn" onClick={() => { addToCart(product); router.push("/cart"); }}>Buy Now</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
