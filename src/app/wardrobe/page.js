"use client";
import "@/components/FeaturedSection/FeaturedSection.css";
import "./wardrobe.css";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { gsap } from "gsap";
import { productApi, categoryApi } from "@/lib/endpoints";
import { normalizeProduct, productUrl } from "@/lib/normalizers";
import { cardPrice } from "@/lib/formatters";
import ProductCard from "@/components/ProductCard/ProductCard";
import BannerOverlay from "@/components/BannerOverlay/BannerOverlay";

export default function Wardrobe() {
  return (
    <Suspense>
      <WardrobeContent />
    </Suspense>
  );
}

// Legacy URL params (used by older nav links) mapped to real category slugs.
const LEGACY_ALIAS = {
  skin: "face-care",
  "skin-care": "face-care",
  face: "face-care",
  hair: "hair-care",
  body: "body-care",
};

function slugify(s) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Best-effort synchronous resolve before categories load: title-cases the slug.
function initialResolve(param) {
  if (!param) return "All";
  const key = LEGACY_ALIAS[param.toLowerCase().trim()] || param.toLowerCase().trim();
  return key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// Resolve a URL param to a real category NAME, given the fetched categories.
function resolveCategoryName(param, categories) {
  if (!param) return "All";
  const key = LEGACY_ALIAS[param.toLowerCase().trim()] || param.toLowerCase().trim();
  const match = categories.find(
    (c) => c.slug === key || slugify(c.name) === key || c.name.toLowerCase() === key
  );
  return match ? match.name : "All";
}

// A product matches a category name by its assigned category, falling back to
// its tag for products that have no category assigned yet.
function matchesCategory(product, cat) {
  return (
    cat === "All" ||
    product.category?.name === cat ||
    (!product.category && product.tag === cat)
  );
}

// A product matches a free-text search across name + descriptions.
function matchesSearch(product, q) {
  if (!q) return true;
  const s = q.toLowerCase();
  return (
    product.name?.toLowerCase().includes(s) ||
    product.shortDescription?.toLowerCase().includes(s) ||
    product.description?.toLowerCase().includes(s)
  );
}

function WardrobeContent() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const searchQuery = searchParams.get("search") || "";
  const initialTag = initialResolve(categoryParam);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTag, setActiveTag] = useState(initialTag);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [priceRange, setPriceRange] = useState("all");
  const [loading, setLoading] = useState(true);
  const productRefs = useRef([]);
  const isInitialMount = useRef(true);

  // Fetch products + categories from API on mount
  const categoryParamRef = useRef(categoryParam);
  categoryParamRef.current = categoryParam;
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  useEffect(() => {
    Promise.all([
      productApi.getAll({ limit: 50 }),
      categoryApi.list().catch(() => []),
    ])
      .then(([data, cats]) => {
        const normalized = (data.products || []).map(normalizeProduct);
        const catList = Array.isArray(cats) ? cats : [];
        setAllProducts(normalized);
        setCategories(catList);
        const resolved = resolveCategoryName(categoryParamRef.current, catList);
        setActiveTag(resolved);
        const initial = normalized.filter(
          (p) => matchesCategory(p, resolved) && matchesSearch(p, searchQueryRef.current)
        );
        setFilteredProducts(initial);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-apply filters when the URL search term changes (e.g. a new search is
  // submitted from the header while already on this page).
  useEffect(() => {
    if (loading) return;
    setFilteredProducts(applyFilters(activeTag, priceRange));
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const filterByPrice = (productsToFilter, range) => {
    switch (range) {
      case "under-500":
        return productsToFilter.filter((p) => cardPrice(p) < 500);
      case "500-1000":
        return productsToFilter.filter((p) => cardPrice(p) >= 500 && cardPrice(p) <= 1000);
      case "above-1000":
        return productsToFilter.filter((p) => cardPrice(p) > 1000);
      default:
        return productsToFilter;
    }
  };

  const applyFilters = (tag, price) => {
    let result = allProducts.filter(
      (product) => matchesCategory(product, tag) && matchesSearch(product, searchQueryRef.current)
    );
    result = filterByPrice(result, price);
    return result;
  };

  const router = useRouter();

  const handleFilterChange = (newTag) => {
    if (isAnimating) return;
    if (newTag === activeTag) return;

    setActiveTag(newTag);

    // Sync URL with selected category (use the real slug when available)
    const slug = categories.find((c) => c.name === newTag)?.slug || slugify(newTag);
    const url = newTag === "All" ? "/wardrobe" : `/wardrobe?category=${slug}`;
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
        const filtered = applyFilters(newTag, priceRange);
        setFilteredProducts(filtered);
      },
    });
  };

  const handlePriceFilterChange = (e) => {
    const newPrice = e.target.value;
    setPriceRange(newPrice);
    const filtered = applyFilters(activeTag, newPrice);
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

  const activeCategory = categories.find((c) => c.name === activeTag);

  return (
    <div className="wardrobe-page">
      {/* Hero Section - same as home */}
      <section className="wardrobe-hero">
        <div className="wardrobe-hero-content">
          <div className="wardrobe-breadcrumb">
            <Link href="/">HOME</Link>/ <Link href="/wardrobe">SHOP</Link>/ <span>{searchQuery ? "SEARCH" : activeTag === "All" ? "ALL" : activeTag.toUpperCase()}</span>
          </div>
          <h1 className="wardrobe-hero-title">
            {searchQuery ? `SEARCH: ${searchQuery.toUpperCase()}` : activeTag === "All" ? "ALL PRODUCTS" : activeTag.toUpperCase()}
          </h1>
        </div>
      </section>

      {/* Category Filter + Price Filter */}
      <section className="wardrobe-filters">
        <div className="category-filter">
          {["All", ...categories.map((c) => c.name)].map((tag) => (
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
        </div>
      </section>

      {loading && (
        <section className="wardrobe-section section-row-2" style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ opacity: 0.5, fontSize: "1rem", letterSpacing: "0.1em" }}>LOADING PRODUCTS...</p>
        </section>
      )}

      {/* During a search, always show a flat grid of all matches (skip the
          category banner sections so results aren't interleaved with banners). */}
      {!loading && searchQuery && filteredProducts.length === 0 && (
        <section className="wardrobe-section" style={{ minHeight: "30vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ opacity: 0.55, fontSize: "1rem", letterSpacing: "0.05em" }}>
            No products found for &ldquo;{searchQuery}&rdquo;
          </p>
        </section>
      )}

      {!loading && !searchQuery && filteredProducts.length >= 7 && (
        <>
          {/* Section 1: 2 Products + Spotlight Banner */}
          <section className="wardrobe-section section-row-1">
            <div className="products-pair">
              {filteredProducts.slice(0, 2).map((product, index) => (
                <ProductCard
                  key={product.name + index}
                  product={product}
                  index={allProducts.indexOf(product)}
                  ref={(el) => (productRefs.current[index] = el)}
                  style={{ opacity: 0 }}
                />
              ))}
            </div>
            <div className="spotlight-banner">
              {activeCategory?.bannerTop ? (
                <img src={activeCategory.bannerTop} alt="Featured Collection" className="spotlight-banner-img" />
              ) : (
                /* Desktop shows the portrait top banner; mobile shows the landscape one. */
                <picture className="spotlight-banner-pic">
                  <source media="(max-width: 1024px)" srcSet="/top-banner-mobile.png" />
                  <img src="/top-banner-desktop.png" alt="Featured Collection" className="spotlight-banner-img" />
                </picture>
              )}
              <BannerOverlay
                title={activeCategory?.name ? `The ${activeCategory.name} edit` : "Ayurvedic care, real results"}
                ctaText="Shop the collection"
                ctaLink={activeCategory?.link || "/wardrobe"}
              />
            </div>
          </section>

          {/* Section 2: 4 Products in a Row */}
          <section className="wardrobe-section section-row-2">
            {filteredProducts.slice(2, 6).map((product, index) => (
              <ProductCard
                key={product.name + index}
                product={product}
                index={allProducts.indexOf(product)}
                ref={(el) => (productRefs.current[index + 2] = el)}
                style={{ opacity: 0 }}
              />
            ))}
          </section>

          {/* Section 3: Side Banner + 4 Products */}
          <section className="wardrobe-section section-row-3">
            <div className="side-banner">
              {/* Desktop shows the square banner; mobile shows the long one. */}
              <picture className="side-banner-pic">
                <source media="(max-width: 1024px)" srcSet="/banner-bottom.webp" />
                <img
                  src="/banner-bottom-desktop.png"
                  alt={activeTag || "Ayurvedic Care, Real Results"}
                  className="side-banner-img"
                />
              </picture>
              {/* Editorial line, not activeTag — that's a filter name ("All",
                  "Face Care"), which reads as a stray label rather than copy. */}
              <BannerOverlay
                title="Clinically-backed, rooted in Ayurveda"
                ctaText="Discover the ritual"
                ctaLink="/ritual"
              />
            </div>
            <div className="products-beside-banner">
              {filteredProducts.slice(6, 10).map((product, index) => (
                <ProductCard
                  key={product.name + index}
                  product={product}
                  index={allProducts.indexOf(product)}
                  ref={(el) => (productRefs.current[index + 6] = el)}
                  style={{ opacity: 0 }}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {!loading && (searchQuery ? filteredProducts.length > 0 : filteredProducts.length < 7) && (
        <section className="wardrobe-section wardrobe-category-grid">
          {filteredProducts.map((product, index) => (
            <ProductCard
              key={product.name + index}
              product={product}
              index={allProducts.indexOf(product)}
              ref={(el) => (productRefs.current[index] = el)}
              style={{ opacity: 0 }}
            />
          ))}
        </section>
      )}
    </div>
  );
}
