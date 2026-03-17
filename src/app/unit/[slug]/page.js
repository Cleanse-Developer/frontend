"use client";
import "./unit.css";
import { Suspense, use, useState, useEffect, useCallback } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { productApi, shippingApi, reviewApi, bundleApi } from "@/lib/endpoints";
import { normalizeProduct, productUrl } from "@/lib/normalizers";

const productImages = [
  "/images/1.png",
  "/images/2.png",
  "/images/3.png",
  "/images/4.png",
];

const fallbackReviews = [
  {
    name: "Priya S.",
    location: "Mumbai",
    rating: 5,
    date: "2 weeks ago",
    text: "I've been using this every night for a month and the difference is incredible. My skin looks more radiant and the dark spots have visibly faded.",
    verified: true,
  },
  {
    name: "Ananya M.",
    location: "Delhi",
    rating: 5,
    date: "1 month ago",
    text: "Was skeptical at first but this is genuinely transformative. A little goes a long way, and I wake up with the softest, most glowing skin.",
    verified: true,
  },
];

// Default highlights used when product has no tabHighlights data
const DEFAULT_HIGHLIGHTS = {
  ingredients: [
    { icon: "saffron", label: "Kashmiri Saffron" },
    { icon: "leaf", label: "Organic Herbs" },
    { icon: "dropper", label: "Cold Pressed Oils" },
    { icon: "noparaben", label: "No Parabens" },
    { icon: "chemical", label: "No Sulfates" },
    { icon: "plant", label: "100% Natural" },
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
  ingredients: "Pure Ayurvedic herbs and natural botanical extracts.",
  values: "All our products are natural, plant-based and toxic-free. Our formulations help you take care of your body without harming yourself or the environment.",
  howToUse: "Apply as directed. For external use only.",
  shippingInfo: "Free shipping on orders above ₹999. Standard delivery in 3-5 business days.",
  policies: "All products are dermatologically tested and certified. 30-day return policy for unopened products.",
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
  const s = { viewBox: "0 0 40 40", fill: "none", stroke: "currentColor", strokeWidth: "1.2", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    plant: (
      <svg {...s}>
        <path d="M20 32V20" />
        <path d="M20 20c0-6 4-10 10-12-2 6-6 10-10 12z" />
        <path d="M20 24c0-5-3.5-8.5-9-10 1.5 5 5 8.5 9 10z" />
      </svg>
    ),
    dropper: (
      <svg {...s}>
        <path d="M28 8l4 4-3 3" />
        <path d="M24 12l-12 12c-1 1-1 3 0 4s3 1 4 0l12-12" />
        <path d="M20 16l4 4" />
      </svg>
    ),
    leaf: (
      <svg {...s}>
        <path d="M12 32c0-12 6-18 18-20-2 12-8 18-18 20z" />
        <path d="M12 32C16 24 22 18 30 12" />
      </svg>
    ),
    paw: (
      <svg {...s}>
        <ellipse cx="20" cy="24" rx="5" ry="4" />
        <circle cx="14" cy="18" r="2.5" />
        <circle cx="26" cy="18" r="2.5" />
        <circle cx="10" cy="23" r="2" />
        <circle cx="30" cy="23" r="2" />
      </svg>
    ),
    chemical: (
      <svg {...s}>
        <path d="M20 8v8" />
        <path d="M20 8c0-1 3-1 3 0" />
        <path d="M20 8c0-1-3-1-3 0" />
        <path d="M15 16l-5 12c-1 2 1 4 3 4h14c2 0 4-2 3-4l-5-12" />
        <path d="M15 16h10" />
        <line x1="14" y1="26" x2="26" y2="26" strokeDasharray="2 2" />
      </svg>
    ),
    lotus: (
      <svg {...s}>
        <path d="M20 10c-2 6-2 12 0 18" />
        <path d="M20 10c2 6 2 12 0 18" />
        <path d="M20 12c-5 2-9 6-10 12 4-1 8-4 10-8" />
        <path d="M20 12c5 2 9 6 10 12-4-1-8-4-10-8" />
        <path d="M20 16c-8 1-13 5-14 10 5 0 10-3 14-8" />
        <path d="M20 16c8 1 13 5 14 10-5 0-10-3-14-8" />
      </svg>
    ),
    saffron: (
      <svg {...s}>
        <path d="M20 8v24" />
        <path d="M20 14c-3-2-6-1-8 1 3 0 6 1 8 4" />
        <path d="M20 14c3-2 6-1 8 1-3 0-6 1-8 4" />
        <path d="M20 22c-3-1-6 0-7 2 2 0 5 0 7 3" />
        <path d="M20 22c3-1 6 0 7 2-2 0-5 0-7 3" />
      </svg>
    ),
    noparaben: (
      <svg {...s}>
        <circle cx="20" cy="20" r="10" />
        <line x1="13" y1="13" x2="27" y2="27" />
        <text x="17" y="23" fontSize="8" fill="currentColor" stroke="none" fontFamily="monospace">P</text>
      </svg>
    ),
    wash: (
      <svg {...s}>
        <path d="M12 18c0-5 3.5-8 8-8s8 3 8 8" />
        <path d="M10 22c2-2 4-3 6-3" />
        <path d="M24 19c2 0 4 1 6 3" />
        <path d="M14 28c2-4 4-6 6-6s4 2 6 6" />
        <circle cx="20" cy="14" r="1" fill="currentColor" />
      </svg>
    ),
    drops: (
      <svg {...s}>
        <path d="M14 14c0 0-4 5-4 8a4 4 0 008 0c0-3-4-8-4-8z" />
        <path d="M22 10c0 0-3 4-3 6a3 3 0 006 0c0-2-3-6-3-6z" />
        <path d="M28 16c0 0-2 3-2 5a2 2 0 004 0c0-2-2-5-2-5z" />
      </svg>
    ),
    hands: (
      <svg {...s}>
        <path d="M10 24c2-6 5-10 10-10s8 4 10 10" />
        <path d="M14 26c1-2 3-4 6-4s5 2 6 4" />
        <path d="M10 24c-1 2 0 4 2 5h16c2-1 3-3 2-5" />
      </svg>
    ),
    massage: (
      <svg {...s}>
        <circle cx="20" cy="16" r="6" />
        <path d="M16 22c-2 2-3 4-3 6" />
        <path d="M24 22c2 2 3 4 3 6" />
        <path d="M14 12l-4-2" />
        <path d="M26 12l4-2" />
        <path d="M20 10V7" />
      </svg>
    ),
    moon: (
      <svg {...s}>
        <path d="M26 20a8 8 0 11-10-10 6 6 0 0010 10z" />
        <circle cx="28" cy="10" r="1" fill="currentColor" />
        <circle cx="32" cy="14" r="0.5" fill="currentColor" />
        <circle cx="30" cy="8" r="0.5" fill="currentColor" />
      </svg>
    ),
    repeat: (
      <svg {...s}>
        <path d="M28 14a8 8 0 01-1 11.5A8 8 0 0113 26" />
        <path d="M12 26a8 8 0 011-11.5A8 8 0 0127 14" />
        <polyline points="28 10 28 14 24 14" />
        <polyline points="12 30 12 26 16 26" />
      </svg>
    ),
    truck: (
      <svg {...s}>
        <rect x="6" y="14" width="18" height="12" rx="1" />
        <path d="M24 18h5l3 4v4h-8" />
        <circle cx="14" cy="28" r="2" />
        <circle cx="28" cy="28" r="2" />
        <line x1="16" y1="26" x2="26" y2="26" />
      </svg>
    ),
    clock: (
      <svg {...s}>
        <circle cx="20" cy="20" r="10" />
        <path d="M20 14v6l4 3" />
      </svg>
    ),
    express: (
      <svg {...s}>
        <path d="M8 20h8" />
        <path d="M10 16h6" />
        <path d="M12 24h4" />
        <path d="M22 12l6 8-6 8" />
      </svg>
    ),
    globe: (
      <svg {...s}>
        <circle cx="20" cy="20" r="10" />
        <ellipse cx="20" cy="20" rx="4" ry="10" />
        <line x1="10" y1="20" x2="30" y2="20" />
        <path d="M12 14h16" />
        <path d="M12 26h16" />
      </svg>
    ),
    returnbox: (
      <svg {...s}>
        <path d="M12 16v12h16V16" />
        <path d="M10 16l10-6 10 6" />
        <path d="M22 22l-4 4 4 4" />
        <line x1="18" y1="26" x2="28" y2="26" />
      </svg>
    ),
    shield: (
      <svg {...s}>
        <path d="M20 8l-10 4v6c0 6 4 10 10 14 6-4 10-8 10-14v-6l-10-4z" />
        <polyline points="16 20 19 23 25 17" />
      </svg>
    ),
    certificate: (
      <svg {...s}>
        <rect x="10" y="8" width="20" height="16" rx="2" />
        <line x1="14" y1="13" x2="26" y2="13" />
        <line x1="14" y1="17" x2="22" y2="17" />
        <circle cx="20" cy="28" r="4" />
        <polyline points="18 31 20 34 22 31" />
      </svg>
    ),
    calendar: (
      <svg {...s}>
        <rect x="10" y="12" width="20" height="18" rx="2" />
        <line x1="10" y1="18" x2="30" y2="18" />
        <line x1="16" y1="8" x2="16" y2="14" />
        <line x1="24" y1="8" x2="24" y2="14" />
        <text x="17" y="27" fontSize="7" fill="currentColor" stroke="none" fontFamily="monospace">24</text>
      </svg>
    ),
    sun: (
      <svg {...s}>
        <circle cx="20" cy="20" r="5" />
        <line x1="20" y1="10" x2="20" y2="13" />
        <line x1="20" y1="27" x2="20" y2="30" />
        <line x1="10" y1="20" x2="13" y2="20" />
        <line x1="27" y1="20" x2="30" y2="20" />
        <line x1="13" y1="13" x2="15" y2="15" />
        <line x1="25" y1="25" x2="27" y2="27" />
        <line x1="13" y1="27" x2="15" y2="25" />
        <line x1="25" y1="15" x2="27" y2="13" />
      </svg>
    ),
    test: (
      <svg {...s}>
        <path d="M16 8v14l-4 8c-1 2 1 4 3 4h10c2 0 4-2 3-4l-4-8V8" />
        <line x1="14" y1="8" x2="26" y2="8" />
        <circle cx="18" cy="26" r="1.5" fill="currentColor" />
        <circle cx="22" cy="23" r="1" fill="currentColor" />
      </svg>
    ),
    external: (
      <svg {...s}>
        <circle cx="20" cy="18" r="6" />
        <path d="M14 24c-2 2-4 4-4 6h20c0-2-2-4-4-6" />
        <line x1="20" y1="24" x2="20" y2="32" />
        <line x1="16" y1="32" x2="24" y2="32" />
      </svg>
    ),
    check: (
      <svg {...s}>
        <circle cx="20" cy="20" r="10" />
        <polyline points="15 20 18.5 23.5 26 16" />
      </svg>
    ),
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
        reviewApi.getForProduct(p._id).then((revData) => {
          const apiReviews = (revData.reviews || revData || []).map((r) => ({
            name: r.user?.fullName || r.userName || "Customer",
            location: "",
            rating: r.rating,
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "",
            text: r.text || r.comment || "",
            verified: r.verified ?? true,
          }));
          if (apiReviews.length > 0) setReviews(apiReviews);
        }).catch(() => {});
      }
    }).catch(() => setLoading(false));
  }, [slug, variantParam]);

  const handleSubmitReview = async () => {
    if (!product?._id || !reviewForm.text.trim() || reviewSubmitting) return;
    setReviewSubmitting(true);
    try {
      await reviewApi.create({
        product: product._id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        text: reviewForm.text,
      });
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: "", text: "" });
      // Refetch reviews
      const revData = await reviewApi.getForProduct(product._id);
      const apiReviews = (revData.reviews || revData || []).map((r) => ({
        name: r.user?.fullName || r.userName || "Customer",
        location: "",
        rating: r.rating,
        date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "",
        text: r.text || r.comment || "",
        verified: r.verified ?? true,
      }));
      if (apiReviews.length > 0) setReviews(apiReviews);
    } catch { /* ignore */ }
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
    setReviewIndex((prev) => {
      if (direction === 'up') {
        return prev > 0 ? prev - 1 : reviews.length - 1;
      } else {
        return prev < reviews.length - 1 ? prev + 1 : 0;
      }
    });
  }, []);

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
            {galleryImages.slice(1).map((img, index) => (
              <button
                key={index}
                className={`product-thumbnail ${activeImage === index + 1 ? "active" : ""}`}
                onClick={() => setActiveImage(index + 1)}
              >
                <img src={img} alt={`Product view ${index + 2}`} />
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
          <div className="reviews-layout">
            {/* Left - Summary & Write Review */}
            <div className="reviews-left">
              <div className="reviews-left-sticky">
                <p className="reviews-label">What Our Customers Say</p>
                <h3 className="reviews-title">Customer Reviews</h3>
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
                <button className="write-review-btn" onClick={() => setShowReviewForm(!showReviewForm)}>
                  {showReviewForm ? "Cancel" : "Write a Review"}
                </button>
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 15l-6-6-6 6"/>
                    </svg>
                  </button>
                  <button className="reviews-nav-btn reviews-nav-down" aria-label="Next review" onClick={() => scrollToReview('down')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended For You */}
      <section className="recommended-section">
        <h2 className="recommended-title">RECOMMENDED FOR YOU</h2>
        <div className="recommended-grid">
          {relatedProducts.map((rp, i) => {
            return (
              <div key={rp._id || rp.name} className="rec-card">
                <div className="rec-card-image">
                  <Link href={productUrl(rp)}>
                    <img src={rp.primaryImage || `/images/${(i % 4) + 1}.png`} alt={rp.name} />
                  </Link>
                </div>
                <div className="rec-card-info">
                  <h3 className="rec-card-name">{rp.name}</h3>
                  <div className="rec-card-footer">
                    <span className="rec-card-price">&#8377;{rp.price}</span>
                    <button className="rec-card-btn" onClick={() => addToCart(rp)}>Add to Cart</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
