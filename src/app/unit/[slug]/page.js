"use client";
import "./unit.css";
import "@/components/FeaturedSection/FeaturedSection.css";
import { Suspense, use, useState, useEffect, useCallback } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { productApi, shippingApi, reviewApi, bundleApi } from "@/lib/endpoints";
import { normalizeProduct } from "@/lib/normalizers";
import { productUrl } from "@/lib/normalizers";
// Realistic, name-matched icons from react-icons — botanicals from Game Icons,
// everything else from Font Awesome 6 (solid) for one consistent, filled look.
import { GiBerryBush, GiDaisy, GiThreeLeaves, GiHerbsBundle, GiVineLeaf, GiAgave, GiLotus, GiVineFlower } from "react-icons/gi";
import {
  FaSeedling, FaDroplet, FaLeaf, FaPaw, FaFlask, FaHandsBubbles,
  FaHandHoldingDroplet, FaHandsHolding, FaHandSparkles, FaMoon, FaArrowsRotate,
  FaTruckFast, FaClock, FaBolt, FaEarthAmericas, FaRotateLeft, FaShieldHalved,
  FaCertificate, FaCalendarDays, FaSun, FaVial, FaHand, FaCircleCheck,
  FaChevronUp, FaChevronDown,
} from "react-icons/fa6";

const productImages = [
  "/images/1.png",
  "/images/2.png",
  "/images/3.png",
  "/images/4.png",
];

// Empty fallback — never show fake reviews. Empty state is shown instead.
const fallbackReviews = [];

// Default highlights used when product has no tabHighlights data
const DEFAULT_HIGHLIGHTS = {
  ingredients: [
    { icon: "amla", label: "Amla" },
    { icon: "bhringraj", label: "Bhringraj" },
    { icon: "neem", label: "Neem" },
    { icon: "tulsi", label: "Tulsi" },
    { icon: "brahmi", label: "Brahmi" },
    { icon: "aloe", label: "Aloe Vera" },
  ],
  values: [
    { icon: "plant", label: "Plant Based" },
    { icon: "dropper", label: "No Artificial Color" },
    { icon: "leaf", label: "Plant Based" },
    { icon: "paw", label: "Cruelty Free" },
    { icon: "chemical", label: "No Synthetic Chemicals" },
    { icon: "lotus", label: "100% Ayurvedic" },
  ],
  howToUse: [
    { icon: "wash", label: "Cleanse Face" },
    { icon: "drops", label: "3-4 Drops" },
    { icon: "hands", label: "Warm in Palms" },
    { icon: "massage", label: "Massage Upward" },
    { icon: "moon", label: "Leave Overnight" },
    { icon: "repeat", label: "Use Nightly" },
  ],
  shippingInfo: [
    { icon: "truck", label: "Free Shipping" },
    { icon: "clock", label: "3-5 Business Days" },
    { icon: "express", label: "Express Delivery" },
    { icon: "globe", label: "Ships Worldwide" },
    { icon: "returnbox", label: "7-Day Returns" },
    { icon: "shield", label: "Damage Protection" },
  ],
  policies: [
    { icon: "certificate", label: "Certified Safe" },
    { icon: "calendar", label: "24 Month Shelf Life" },
    { icon: "sun", label: "Store Cool & Dry" },
    { icon: "test", label: "Patch Test First" },
    { icon: "external", label: "External Use Only" },
    { icon: "check", label: "Quality Assured" },
  ],
};

const DEFAULT_TEXT = {
  ingredients: "Every formula is built on pure Ayurvedic herbs and cold-pressed botanical extracts, from Amla and Bhringraj to Neem, Tulsi, Brahmi and Aloe Vera. Each ingredient is chosen for its proven benefits and blended with nothing synthetic, so your skin receives only what nature intended. Centuries of traditional wisdom meet modern, clinically minded care in every drop.",
  values: "All our products are natural, plant-based and free from toxins. Our formulations help you care for your skin without harming yourself or the environment. We never test on animals, and every blend is crafted to be as gentle on the planet as it is on you, from the botanicals we source to the packaging we choose.",
  howToUse: "Begin with freshly cleansed skin. Warm three to four drops between your palms and press gently into the face and neck using slow, upward strokes. Leave on overnight for the deepest absorption, and use nightly as part of your ritual to see visible results over time.",
  shippingInfo: "Enjoy free shipping on all orders above ₹999, with standard delivery in three to five business days and express options available at checkout. We ship worldwide, and every order is carefully packed and protected so it reaches you in perfect condition.",
  policies: "Every product is dermatologically tested, certified safe and intended for external use only. We offer a seven-day return policy on unopened items and recommend a patch test before first use. Store in a cool, dry place away from direct sunlight to preserve potency.",
};

function buildProductInfoTabs(product) {
  const th = product?.tabHighlights || {};
  const TAB_MAP = [
    { id: "ingredients", label: "Ingredients", textKey: "ingredients", hlKey: "ingredients" },
    { id: "values", label: "Our Values", textKey: "values", hlKey: "values" },
    { id: "howto", label: "How to Use", textKey: "howToUse", hlKey: "howToUse" },
    { id: "shipping", label: "Shipping and Returns", textKey: "shippingInfo", hlKey: "shippingInfo" },
    { id: "policies", label: "Policies", textKey: "policies", hlKey: "policies" },
  ];

  return TAB_MAP.map(({ id, label, textKey, hlKey }) => ({
    id,
    label,
    content: product?.[textKey] || DEFAULT_TEXT[textKey],
    values: th[hlKey]?.length > 0 ? th[hlKey] : DEFAULT_HIGHLIGHTS[hlKey],
  }));
}

const ValueIcon = ({ type }) => {
  const icons = {
    /* Botanical herbs — Game Icons (detailed, name-matched) */
    amla: <GiBerryBush />,
    bhringraj: <GiDaisy />,
    neem: <GiThreeLeaves />,
    tulsi: <GiHerbsBundle />,
    brahmi: <GiVineLeaf />,
    aloe: <GiAgave />,
    saffron: <GiVineFlower />,
    lotus: <GiLotus />,
    /* Values */
    plant: <FaSeedling />,
    dropper: <FaDroplet />,
    leaf: <FaLeaf />,
    paw: <FaPaw />,
    chemical: <FaFlask />,
    noparaben: <FaDroplet />,
    /* How to use */
    wash: <FaHandsBubbles />,
    drops: <FaHandHoldingDroplet />,
    hands: <FaHandsHolding />,
    massage: <FaHandSparkles />,
    moon: <FaMoon />,
    repeat: <FaArrowsRotate />,
    /* Shipping */
    truck: <FaTruckFast />,
    clock: <FaClock />,
    express: <FaBolt />,
    globe: <FaEarthAmericas />,
    returnbox: <FaRotateLeft />,
    shield: <FaShieldHalved />,
    /* Policies */
    certificate: <FaCertificate />,
    calendar: <FaCalendarDays />,
    sun: <FaSun />,
    test: <FaVial />,
    external: <FaHand />,
    check: <FaCircleCheck />,
  };
  return icons[type] || null;
};

export default function Unit({ params }) {
  return (
    <Suspense>
      <UnitContent params={params} />
    </Suspense>
  );
}

function UnitContent({ params }) {
  const { slug } = use(params);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [deliveryMsg, setDeliveryMsg] = useState("");
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [bundles, setBundles] = useState([]);
  const [activeBundleIndex, setActiveBundleIndex] = useState(0);
  const [bundleSelected, setBundleSelected] = useState([]);
  const [openTab, setOpenTab] = useState("ingredients");
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviews, setReviews] = useState(fallbackReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", text: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const variantParam = searchParams.get("variant");

  // Fetch product by slug
  useEffect(() => {
    setLoading(true);
    productApi.getBySlug(slug).then((data) => {
      const p = normalizeProduct(data.product || data);
      setProduct(p);
      // Pre-select size from ?variant= param, fallback to first size
      const matchedSize = variantParam && p.sizes?.length > 0
        ? p.sizes.find((s) => s.sku === variantParam || s.label === variantParam)
        : null;
      setSelectedSize(matchedSize || p.sizes?.[0] || null);
      setLoading(false);
      // Fetch related products
      if (p._id) {
        productApi.getRelated(p._id).then((relData) => {
          setRelatedProducts((relData.products || []).map(normalizeProduct));
        }).catch(() => {});
      }
      // Fetch bundles that include this product
      if (p._id) {
        bundleApi.getAll({ product: p._id }).then((bData) => {
          const bundleList = bData.bundles || bData || [];
          setBundles(bundleList);
          setActiveBundleIndex(0);
          if (bundleList.length > 0) {
            const firstBundle = bundleList[0];
            const products = (firstBundle.products || []).map(normalizeProduct);
            setBundleSelected(products.map(() => true));
          }
        }).catch(() => {});
      }
      // Fetch reviews
      if (p._id) {
        reviewApi
          .getForProduct(p._id)
          .then((revData) => {
            const apiReviews = (revData.reviews || revData || []).map((r) => ({
              _id: r._id,
              name: r.user?.fullName || r.userName || "Customer",
              location: "",
              rating: r.rating,
              date: r.createdAt
                ? new Date(r.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "",
              text: r.text || r.comment || "",
              verified: r.isVerifiedPurchase === true,
            }));
            // Always replace (don't fall back to fakes)
            setReviews(apiReviews);
          })
          .catch(() => {
            setReviews([]);
          });
      }
    }).catch(() => setLoading(false));
  }, [slug, variantParam]);

  const handleSubmitReview = async () => {
    if (!product?._id || !reviewForm.text.trim() || reviewSubmitting) return;
    if (!isAuthenticated) {
      toast?.error?.("Please sign in to submit a review");
      return;
    }
    setReviewSubmitting(true);
    try {
      const result = await reviewApi.create({
        productId: product._id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        text: reviewForm.text,
      });
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: "", text: "" });
      if (result?.requiresModeration) {
        toast?.success?.(
          "Review submitted! It will appear after admin approval."
        );
      } else {
        toast?.success?.("Review posted!");
      }
      // Refetch reviews
      const revData = await reviewApi.getForProduct(product._id);
      const apiReviews = (revData.reviews || revData || []).map((r) => ({
        _id: r._id,
        name: r.user?.fullName || r.userName || "Customer",
        location: "",
        rating: r.rating,
        date: r.createdAt
          ? new Date(r.createdAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "",
        text: r.text || r.comment || "",
        verified: r.isVerifiedPurchase === true,
      }));
      setReviews(apiReviews);
      setReviewIndex(0); // Show newly submitted (or top) review
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        "Failed to submit review";
      toast?.error?.(msg);
    }
    setReviewSubmitting(false);
  };

  const galleryImages = product
    ? (product.images?.length > 0 ? [...product.images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)).map(img => img.url) : [product.primaryImage, ...productImages])
    : [];

  const activeBundle = bundles[activeBundleIndex] || null;
  const bundleProducts = activeBundle ? (activeBundle.products || []).map(normalizeProduct) : [];

  const toggleBundleItem = (index) => {
    const updated = [...bundleSelected];
    updated[index] = !updated[index];
    if (updated.filter(Boolean).length === 0) return;
    setBundleSelected(updated);
  };

  const switchBundle = (index) => {
    setActiveBundleIndex(index);
    const bundle = bundles[index];
    if (bundle) {
      const products = (bundle.products || []).map(normalizeProduct);
      setBundleSelected(products.map(() => true));
    }
  };

  const selectedBundleCount = bundleSelected.filter(Boolean).length;
  const bundleOriginalTotal = bundleProducts.reduce((sum, p, i) =>
    bundleSelected[i] ? sum + Number(p.price) : sum, 0
  );

  const bundleDiscountedTotal = activeBundle
    ? activeBundle.discountType === "percentage"
      ? Math.round(bundleOriginalTotal * (1 - activeBundle.discountValue / 100))
      : Math.max(0, bundleOriginalTotal - activeBundle.discountValue)
    : bundleOriginalTotal;

  const bundleMeetsMin = activeBundle ? selectedBundleCount >= activeBundle.minProducts : false;
  const bundleDiscountLabel = activeBundle
    ? activeBundle.discountType === "percentage"
      ? `${activeBundle.discountValue}%`
      : `₹${activeBundle.discountValue}`
    : "";

  const handleAddBundle = async () => {
    for (let i = 0; i < bundleProducts.length; i++) {
      if (bundleSelected[i]) await addToCart(bundleProducts[i]);
    }
  };

  const handleCheckDelivery = useCallback(async () => {
    if (pincode.length !== 6) {
      setDeliveryMsg("Please enter a valid 6-digit pincode.");
      return;
    }
    setDeliveryLoading(true);
    try {
      const data = await shippingApi.checkDelivery(pincode);
      setDeliveryMsg(data.serviceable !== false
        ? `Delivery available to ${pincode} in ${data.estimatedDays || "3-5"} business days.`
        : "Sorry, delivery is not available to this pincode.");
    } catch {
      setDeliveryMsg("Delivery available to this pincode in 3-5 business days.");
    } finally {
      setDeliveryLoading(false);
    }
  }, [pincode]);

  // Review scroll navigation
  const scrollToReview = useCallback((direction) => {
    if (!reviews || reviews.length === 0) return;
    setReviewIndex((prev) => {
      if (direction === 'up') {
        return prev > 0 ? prev - 1 : reviews.length - 1;
      } else {
        return prev < reviews.length - 1 ? prev + 1 : 0;
      }
    });
  }, [reviews.length]);

  // Clamp reviewIndex if reviews list shrinks
  useEffect(() => {
    if (reviewIndex >= reviews.length) {
      setReviewIndex(0);
    }
  }, [reviews.length, reviewIndex]);

  if (loading) {
    return (
      <div className="unit-page" style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--base-500)" }}>Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="unit-page" style={{ minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", color: "var(--base-700)" }}>Product not found</h2>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--base-500)" }}>The product you are looking for does not exist.</p>
        <Link href="/wardrobe" style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", fontWeight: 500, padding: "0.75rem 2rem", background: "#663532", color: "#fff", textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Browse Products
        </Link>
      </div>
    );
  }

  const originalPrice = product.compareAtPrice || Math.round(Number(product.price) / 0.78);
  const discount = originalPrice > product.price ? Math.round((1 - product.price / originalPrice) * 100) : 0;
  const formattedPrice = `\u20B9${Number(product.price).toLocaleString("en-IN")}`;
  const formattedOriginal = `\u20B9${originalPrice.toLocaleString("en-IN")}`;

  return (
    <div className="unit-page">
      <section className="product-hero">
        <div className="product-hero-col product-hero-left">
          <div className="product-hero-image">
            <img src={galleryImages[activeImage]} alt={product.name} />
          </div>
          <div className="product-thumbnails">
            {galleryImages.map((img, index) => (
              <button
                key={index}
                className={`product-thumbnail ${activeImage === index ? "active" : ""}`}
                onClick={() => setActiveImage(index)}
              >
                <img src={img} alt={`Product view ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>
        <div className="product-hero-col product-meta">
          <div className="product-meta-container">
            {/* Stock Badge */}
            <div className="product-stock-badge">
              <span className="stock-dot"></span>
              Only few units left
            </div>

            {/* Ratings */}
            <div className="product-rating">
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= 4 ? "#4F2C22" : "none"} stroke="#4F2C22" strokeWidth="1.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="rating-count">{(product.averageRating || 4).toFixed(1)} ({product.reviewCount || 0} reviews)</span>
            </div>

            {/* Product Name */}
            <h3 className="product-title">{product.name}</h3>

            {/* Price */}
            <div className="product-price-row">
              <span className="product-price-current">{formattedPrice}</span>
              <span className="product-price-original">{formattedOriginal}</span>
              {discount > 0 && <span className="product-price-discount">{discount}% off</span>}
            </div>

            {/* Description */}
            <p className="product-description">
              {product.description}
            </p>

            <div className="product-meta-header-divider"></div>

            {/* Size Selector */}
            <div className="product-sizes-container">
              <p className="product-section-label">Size</p>
              <div className="product-sizes">
                {product.sizes.map((size) => (
                  <button
                    key={size.label || size}
                    className={`product-size-btn ${(selectedSize?.label || selectedSize) === (size.label || size) ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedSize(size);
                      const variantKey = size.sku || size.label;
                      if (variantKey) {
                        router.replace(`/unit/${slug}?variant=${encodeURIComponent(variantKey)}`, { scroll: false });
                      }
                    }}
                  >
                    {size.label || size}{size.price ? ` - ₹${size.price}` : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="product-cart-row">
              <div className="product-quantity">
                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button
                className="add-to-cart-btn"
                onClick={() => addToCart(product, selectedSize?.label || selectedSize, quantity)}
              >
                Add to Cart
              </button>
            </div>

            {/* Buy Now */}
            <button
              className="buy-now-btn"
              onClick={() => {
                addToCart(product, selectedSize?.label || selectedSize, quantity);
                router.push("/checkout");
              }}
            >
              Buy Now
            </button>

            {/* Check Delivery */}
            <div className="product-delivery-check">
              <p className="product-section-label">Check Delivery</p>
              <div className="delivery-input-row">
                <input
                  type="text"
                  placeholder="Enter pincode"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, ""));
                    setDeliveryMsg("");
                  }}
                  className="delivery-input"
                />
                <button className="delivery-check-btn" onClick={handleCheckDelivery} disabled={deliveryLoading}>{deliveryLoading ? "Checking..." : "Check"}</button>
              </div>
              {deliveryMsg && <p className="delivery-msg">{deliveryMsg}</p>}
            </div>

            {/* Policies */}
            <div className="product-policies">
              <div className="policy-item">
                <span>7 Day Return Policy</span>
              </div>
              <span className="policy-divider">|</span>
              <div className="policy-item">
                <span>Ships Worldwide</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {activeBundle && bundleProducts.length > 0 && (
        <section className="bundle-section">
          <div className="bundle-header">
            <h3 className="bundle-title">{activeBundle.name || "BUILD YOUR BUNDLE"}</h3>
            <p className="bundle-subtitle">
              {activeBundle.subtitle || `Select ${activeBundle.minProducts}+ products and save ${bundleDiscountLabel}`}
            </p>
            {bundles.length > 1 && (
              <div className="bundle-tabs" style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                {bundles.map((b, i) => (
                  <button
                    key={b._id}
                    className={`bundle-tab-btn ${i === activeBundleIndex ? "active" : ""}`}
                    onClick={() => switchBundle(i)}
                    style={{
                      padding: "0.4rem 1rem",
                      fontSize: "0.8rem",
                      border: i === activeBundleIndex ? "1.5px solid #663532" : "1px solid #ddd",
                      borderRadius: "20px",
                      background: i === activeBundleIndex ? "#663532" : "transparent",
                      color: i === activeBundleIndex ? "#fff" : "#663532",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="bundle-layout">
            <div className="bundle-grid">
              {bundleProducts.map((bp, index) => {
                const imgIndex = (index % 4) + 1;
                const imgPath = bp.primaryImage || `/images/${imgIndex}.png`;
                return (
                  <button
                    key={bp._id || bp.name}
                    className={`bundle-card ${bundleSelected[index] ? "bundle-card-selected" : ""}`}
                    onClick={() => toggleBundleItem(index)}
                  >
                    <div className="bundle-card-image">
                      <img src={imgPath} alt={bp.name} />
                    </div>
                    <div className="bundle-card-info">
                      <p className="bundle-card-name">{bp.name}</p>
                      <p className="bundle-card-desc">{bp.shortDescription || bp.description}</p>
                      <p className="bundle-card-price">&#8377;{bp.price}</p>
                    </div>
                    <div className="bundle-card-check">
                      <div className={`bundle-check-circle ${bundleSelected[index] ? "checked" : ""}`}>
                        {bundleSelected[index] && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="bundle-summary">
              <h4 className="bundle-summary-title">YOUR BUNDLE</h4>
              <p className="bundle-summary-desc">
                {bundleMeetsMin
                  ? `Save ${bundleDiscountLabel} on this bundle`
                  : `Select ${activeBundle.minProducts - selectedBundleCount} more to unlock ${bundleDiscountLabel} off`}
              </p>
              <div className="bundle-summary-divider" />
              <div className="bundle-summary-slots">
                {bundleProducts.map((bp, index) => {
                  return (
                    <div key={bp._id || bp.name} className="bundle-slot">
                      {bundleSelected[index] ? (
                        <>
                          <div className="bundle-slot-img">
                            <img src={bp.primaryImage || `/images/${(index % 4) + 1}.png`} alt={bp.name} />
                          </div>
                          <div className="bundle-slot-info">
                            <span className="bundle-slot-name">{bp.name}</span>
                            <span className="bundle-slot-price">&#8377;{bp.price}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bundle-slot-img bundle-slot-empty" />
                          <div className="bundle-slot-info">
                            <div className="bundle-slot-line bundle-slot-line-long" />
                            <div className="bundle-slot-line bundle-slot-line-short" />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="bundle-summary-divider" />
              <div className="bundle-summary-total">
                <span>Total</span>
                <div className="bundle-summary-prices">
                  {bundleMeetsMin && bundleOriginalTotal !== bundleDiscountedTotal && (
                    <span className="bundle-total-original">&#8377;{bundleOriginalTotal}</span>
                  )}
                  <span className="bundle-total-final">
                    &#8377;{bundleMeetsMin ? bundleDiscountedTotal : bundleOriginalTotal}
                  </span>
                </div>
              </div>
              {bundleMeetsMin && bundleOriginalTotal !== bundleDiscountedTotal && (
                <p className="bundle-summary-savings">You save &#8377;{bundleOriginalTotal - bundleDiscountedTotal}</p>
              )}
              <button className="bundle-add-btn" onClick={handleAddBundle}>
                Add Bundle to Cart
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Product Info Tabs */}
      <section className="product-info-section">
        <div className="product-info-container">
          <div className="product-info-tabs">
            {buildProductInfoTabs(product).map((tab) => (
              <button
                key={tab.id}
                className={`info-tab ${openTab === tab.id ? "active" : ""}`}
                onClick={() => setOpenTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="info-tab-divider"></div>
          <div className="info-tab-content">
            {buildProductInfoTabs(product).map((tab) => (
              <div
                key={tab.id}
                className={`info-tab-panel ${openTab === tab.id ? "active" : ""}`}
              >
                <div className="info-tab-panel-inner">
                  <p className="info-tab-text">{tab.content}</p>
                  {tab.values && (
                    <div className="info-values-grid">
                      {tab.values.map((val, i) => (
                        <div key={i} className="info-value-item">
                          <div className="info-value-icon">
                            <ValueIcon type={val.icon} />
                          </div>
                          <span className="info-value-label">{val.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Reviews */}
      <section className="reviews-section">
        <div className="reviews-container">
          <div className="reviews-header">
            <p className="reviews-label">What Our Customers Say</p>
            <h3 className="reviews-title">Customer Reviews</h3>
          </div>
          <div className="reviews-layout">
            {/* Left - Summary & Write Review */}
            <div className="reviews-left">
              <div className="reviews-left-sticky">
                <div className="reviews-score">
                  <span className="reviews-avg">{(product?.averageRating || 4.9).toFixed(1)}</span>
                  <span className="reviews-out-of">/ 5</span>
                </div>
                <div className="reviews-stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#4F2C22" stroke="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="reviews-rating-count">Based on {product?.reviewCount || reviews.length} ratings</p>
                <div className="reviews-bars">
                  {[
                    { stars: 5, percent: 78 },
                    { stars: 4, percent: 14 },
                    { stars: 3, percent: 5 },
                    { stars: 2, percent: 2 },
                    { stars: 1, percent: 1 },
                  ].map((bar) => (
                    <div key={bar.stars} className="review-bar-row">
                      <span className="review-bar-label">{bar.stars}</span>
                      <div className="review-bar-track">
                        <div className="review-bar-fill" style={{ width: `${bar.percent}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="reviews-summary-text">
                  Our customers love the natural glow and visible results. Join thousands who have transformed their skincare routine.
                </p>
                {isAuthenticated ? (
                  <button className="write-review-btn" onClick={() => setShowReviewForm(!showReviewForm)}>
                    {showReviewForm ? "Cancel" : "Write a Review"}
                  </button>
                ) : (
                  <Link href={`/login?redirect=/unit/${slug}`} className="write-review-btn">
                    Sign in to Write a Review
                  </Link>
                )}
                {showReviewForm && (
                  <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill={s <= reviewForm.rating ? "#4F2C22" : "none"} stroke="#4F2C22" strokeWidth="1.5">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Review title (optional)"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      style={{ padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.85rem" }}
                    />
                    <textarea
                      placeholder="Share your experience..."
                      value={reviewForm.text}
                      onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                      rows={3}
                      style={{ padding: "0.5rem", border: "1px solid #ddd", borderRadius: "4px", fontSize: "0.85rem", resize: "vertical" }}
                    />
                    <button
                      className="write-review-btn"
                      onClick={handleSubmitReview}
                      disabled={reviewSubmitting || !reviewForm.text.trim()}
                    >
                      {reviewSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right - Review Cards */}
            <div className="reviews-right">
              {reviews.length === 0 ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "rgba(79,44,34,0.6)",
                    fontSize: "0.85rem",
                  }}
                >
                  No reviews yet. Be the first to share your experience!
                </div>
              ) : (
              <div className="reviews-barrel-wrapper">
                <div className="reviews-barrel">
                  <div
                    className="reviews-barrel-track"
                    style={{ transform: `translateY(-${reviewIndex * 140}px)` }}
                  >
                    {reviews.map((review, index) => (
                      <div key={index} className="review-card">
                        <div className="review-card-top">
                          <div className="review-stars">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= review.rating ? "#4F2C22" : "none"} stroke="#4F2C22" strokeWidth="1.5">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                          </div>
                          <span className="review-date">{review.date}</span>
                        </div>
                        <p className="review-text">&ldquo;{review.text}&rdquo;</p>
                        <div className="review-author">
                          <div className="review-avatar">
                            {review.name.charAt(0)}
                          </div>
                          <div className="review-author-info">
                            <span className="review-name">{review.name}</span>
                            <span className="review-location">{review.location} {review.verified && "· Verified Buyer"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="reviews-nav-buttons">
                  <button className="reviews-nav-btn reviews-nav-up" aria-label="Previous review" onClick={() => scrollToReview('up')}>
                    <FaChevronUp />
                  </button>
                  <button className="reviews-nav-btn reviews-nav-down" aria-label="Next review" onClick={() => scrollToReview('down')}>
                    <FaChevronDown />
                  </button>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recommended For You */}
      <section className="recommended-section">
        <h2 className="recommended-title">RECOMMENDED FOR YOU</h2>
        <div className="products-grid">
          {relatedProducts.map((rp, i) => (
            <div key={rp._id || rp.name} className="product-card">
              <Link href={productUrl(rp)} className="product-card-image">
                <img src={rp.primaryImage || `/images/${(i % 4) + 1}.png`} alt={rp.name} />
              </Link>
              <button className="product-card-cart-btn" onClick={() => addToCart(rp)}>
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
                <Link href={productUrl(rp)}><h3 className="product-card-name">{rp.name}</h3></Link>
                <p className="product-card-desc">{rp.shortDescription || rp.description}</p>
                <div className="product-card-footer">
                  <span className="product-card-price">&#8377;{rp.price}</span>
                  <button className="product-card-buy-btn" onClick={() => { addToCart(rp); router.push("/cart"); }}>Buy Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
