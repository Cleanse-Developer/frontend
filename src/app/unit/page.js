"use client";
import "./unit.css";
import { useState, useEffect, useCallback } from "react";

import { products } from "../wardrobe/products";
import Product from "@/components/Product/Product";
import { useCartStore } from "@/store/cartStore";

const productImages = [
  "/product/product_shot_01.jpg",
  "/product/product_shot_02.jpg",
  "/product/product_shot_03.jpg",
  "/product/product_shot_04.jpg",
  "/product/product_shot_05.jpg",
];

const reviews = [
  {
    name: "Priya S.",
    location: "Mumbai",
    rating: 5,
    date: "2 weeks ago",
    title: "My skin has never looked better",
    text: "I've been using this elixir every night for a month and the difference is incredible. My skin looks more radiant and the dark spots have visibly faded. The saffron scent is so calming before bed.",
    verified: true,
  },
  {
    name: "Ananya M.",
    location: "Delhi",
    rating: 5,
    date: "1 month ago",
    title: "Worth every rupee",
    text: "Was skeptical at first because of the price but this is genuinely transformative. A little goes a long way, and I wake up with the softest, most glowing skin. My husband noticed the difference too!",
    verified: true,
  },
  {
    name: "Meera R.",
    location: "Bangalore",
    rating: 4,
    date: "3 weeks ago",
    title: "Beautiful product, subtle results",
    text: "The packaging is gorgeous and the oil feels luxurious. Results are gradual but real - after 3 weeks my complexion is more even. Only wish the bottle was a bit bigger for the price.",
    verified: true,
  },
  {
    name: "Kavya D.",
    location: "Jaipur",
    rating: 5,
    date: "1 week ago",
    title: "Holy grail night oil",
    text: "I've tried so many night serums and nothing compares. The Ayurvedic ingredients actually work. My acne scars are fading and skin texture has improved dramatically. Already on my second bottle.",
    verified: true,
  },
];

const productInfoTabs = [
  {
    id: "ingredients",
    label: "Ingredients",
    content: "Kumkumadi Tailam base with Kashmiri Saffron, Sandalwood, Red Lotus, Manjistha, Vetiver, Licorice Root, Turmeric, Indian Madder, Banyan Tree Bark, Sesame Oil, and Almond Oil. 100% natural with no parabens, sulfates, or synthetic fragrances.",
    values: [
      { icon: "saffron", label: "Kashmiri Saffron" },
      { icon: "leaf", label: "Organic Herbs" },
      { icon: "dropper", label: "Cold Pressed Oils" },
      { icon: "noparaben", label: "No Parabens" },
      { icon: "chemical", label: "No Sulfates" },
      { icon: "plant", label: "100% Natural" },
    ],
  },
  {
    id: "values",
    label: "Our Values",
    content: "All our products are natural, plant-based and toxic-free. Our formulations help you take care of your body without harming yourself or the environment.",
    values: [
      { icon: "plant", label: "Plant Based" },
      { icon: "dropper", label: "No Artificial Color" },
      { icon: "leaf", label: "Plant Based" },
      { icon: "paw", label: "Cruelty Free" },
      { icon: "chemical", label: "No Synthetic Chemicals" },
      { icon: "lotus", label: "100% Ayurvedic" },
    ],
  },
  {
    id: "howto",
    label: "How to Use",
    content: "Cleanse face thoroughly. Take 3-4 drops on your fingertips and warm between palms. Gently press onto face and neck in upward strokes. Massage for 2-3 minutes on problem areas. Leave overnight for best results.",
    values: [
      { icon: "wash", label: "Cleanse Face" },
      { icon: "drops", label: "3-4 Drops" },
      { icon: "hands", label: "Warm in Palms" },
      { icon: "massage", label: "Massage Upward" },
      { icon: "moon", label: "Leave Overnight" },
      { icon: "repeat", label: "Use Nightly" },
    ],
  },
  {
    id: "shipping",
    label: "Shipping and Returns",
    content: "Free shipping on orders above ₹999. Standard delivery in 3-5 business days. Express delivery available for ₹149. We ship across India and to select international destinations.",
    values: [
      { icon: "truck", label: "Free Shipping" },
      { icon: "clock", label: "3-5 Business Days" },
      { icon: "express", label: "Express Delivery" },
      { icon: "globe", label: "Ships Worldwide" },
      { icon: "returnbox", label: "7-Day Returns" },
      { icon: "shield", label: "Damage Protection" },
    ],
  },
  {
    id: "policies",
    label: "Policies",
    content: "All products are dermatologically tested and certified. Shelf life of 24 months from manufacture. Store in a cool, dry place away from direct sunlight. For external use only.",
    values: [
      { icon: "certificate", label: "Certified Safe" },
      { icon: "calendar", label: "24 Month Shelf Life" },
      { icon: "sun", label: "Store Cool & Dry" },
      { icon: "test", label: "Patch Test First" },
      { icon: "external", label: "External Use Only" },
      { icon: "check", label: "Quality Assured" },
    ],
  },
];

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

export default function Unit() {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState("15ml");
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [deliveryMsg, setDeliveryMsg] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [bundleSelected, setBundleSelected] = useState([true, true, true]);
  const [openTab, setOpenTab] = useState("ingredients");
  const addToCart = useCartStore((state) => state.addToCart);

  const bundleProducts = [
    products.find((p) => p.name === "Sandalwood Serum") || products[3],
    products.find((p) => p.name === "Rose Hydra Mist") || products[2],
    products.find((p) => p.name === "Turmeric Glow Mask") || products[1],
  ];

  const toggleBundleItem = (index) => {
    const updated = [...bundleSelected];
    updated[index] = !updated[index];
    if (updated.filter(Boolean).length === 0) return;
    setBundleSelected(updated);
  };

  const bundleOriginalTotal = bundleProducts.reduce((sum, p, i) =>
    bundleSelected[i] ? sum + Number(p.price) : sum, 0
  );
  const bundleDiscountedTotal = Math.round(bundleOriginalTotal * 0.85);

  const handleAddBundle = () => {
    bundleProducts.forEach((p, i) => {
      if (bundleSelected[i]) addToCart(p);
    });
  };

  const handleCheckDelivery = useCallback(() => {
    if (pincode.length === 6) {
      setDeliveryMsg("Delivery available to this pincode in 3-5 business days.");
    } else {
      setDeliveryMsg("Please enter a valid 6-digit pincode.");
    }
  }, [pincode]);

  const currentProduct =
    products.find((p) => p.name === "Kumkumadi Night Elixir") || products[6];

  useEffect(() => {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    setRelatedProducts(shuffled.slice(0, 4));
  }, []);

  return (
    <>
      <section className="product-hero">
        <div className="product-hero-col product-hero-left">
          <div className="product-hero-image">
            <img src={productImages[activeImage]} alt="Kumkumadi Night Elixir" />
          </div>
          <div className="product-thumbnails">
            {productImages.slice(1).map((img, index) => (
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
                  <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill={star <= 4 ? "#023020" : "none"} stroke="#023020" strokeWidth="1.5">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <span className="rating-count">4.0 (128 reviews)</span>
            </div>

            {/* Product Name */}
            <h3 className="product-title">Kumkumadi Night Elixir</h3>

            {/* Price */}
            <div className="product-price-row">
              <span className="product-price-current">&#8377;2,495</span>
              <span className="product-price-original">&#8377;3,200</span>
              <span className="product-price-discount">22% off</span>
            </div>

            {/* Description */}
            <p className="product-description">
              A luxurious overnight facial oil infused with pure Kashmiri saffron and 16 precious Ayurvedic herbs. Deeply nourishes skin for a visibly brighter, luminous complexion by morning.
            </p>

            <div className="product-meta-header-divider"></div>

            {/* Size Selector */}
            <div className="product-sizes-container">
              <p className="product-section-label">Size</p>
              <div className="product-sizes">
                {["15ml", "30ml", "50ml"].map((size) => (
                  <button
                    key={size}
                    className={`product-size-btn ${selectedSize === size ? "selected" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
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
                onClick={() => {
                  for (let i = 0; i < quantity; i++) addToCart(currentProduct);
                }}
              >
                Add to Cart
              </button>
            </div>

            {/* Buy Now */}
            <button className="buy-now-btn">Buy Now</button>

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
                <button className="delivery-check-btn" onClick={handleCheckDelivery}>Check</button>
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

      <section className="bundle-section">
        <div className="bundle-container">
          <div className="bundle-header">
            <div className="bundle-header-text">
              <p className="bundle-label">Complete Your Ritual</p>
              <h3 className="bundle-title">Build Your Bundle</h3>
            </div>
            <div className="bundle-badge">15% Off</div>
          </div>

          <div className="bundle-connector">
            <span className="connector-line"></span>
            <span className="connector-text">Select products to bundle</span>
            <span className="connector-line"></span>
          </div>

          <div className="bundle-products">
            {bundleProducts.map((product, index) => {
              const imgIndex = ((products.indexOf(product)) % 4) + 1;
              const imgPath = `/p${imgIndex}.png`;
              return (
                <button
                  key={product.name}
                  className={`bundle-product-card ${bundleSelected[index] ? "selected" : ""}`}
                  onClick={() => toggleBundleItem(index)}
                >
                  <div className="bundle-product-check">
                    <div className="bundle-check-circle">
                      {bundleSelected[index] && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="bundle-product-img">
                    <img src={imgPath} alt={product.name} />
                  </div>
                  <div className="bundle-product-info">
                    <p className="bundle-product-name">{product.name}</p>
                    <p className="bundle-product-price">&#8377;{product.price}</p>
                  </div>
                  <div className="bundle-product-number">0{index + 1}</div>
                </button>
              );
            })}
          </div>

          <div className="bundle-footer">
            <div className="bundle-pricing">
              <div className="bundle-price-detail">
                <span className="bundle-price-label">Bundle Total</span>
                <div className="bundle-price-values">
                  <span className="bundle-price-original">&#8377;{bundleOriginalTotal}</span>
                  <span className="bundle-price-final">&#8377;{bundleDiscountedTotal}</span>
                </div>
              </div>
              <p className="bundle-savings">You save &#8377;{bundleOriginalTotal - bundleDiscountedTotal} with this bundle</p>
            </div>
            <button className="bundle-add-btn" onClick={handleAddBundle}>
              Add Bundle to Cart
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Product Info Tabs */}
      <section className="product-info-section">
        <div className="product-info-container">
          <div className="product-info-tabs">
            {productInfoTabs.map((tab) => (
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
            {productInfoTabs.map((tab) => (
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
                <h3 className="reviews-title">Reviews</h3>
                <div className="reviews-score">
                  <span className="reviews-avg">4.9</span>
                  <span className="reviews-out-of">/ 5</span>
                </div>
                <div className="reviews-stars-row">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#023020" stroke="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="reviews-rating-count">Based on 200 ratings</p>
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
                <button className="write-review-btn">Write a Review</button>
              </div>
            </div>

            {/* Right - Review Cards */}
            <div className="reviews-right">
              {reviews.slice(0, 2).map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-card-top">
                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg key={s} width="11" height="11" viewBox="0 0 24 24" fill={s <= review.rating ? "#023020" : "none"} stroke="#023020" strokeWidth="1.5">
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
        </div>
      </section>

      {/* Recommended For You */}
      <section className="recommended-section">
        <div className="recommended-container">
          <div className="recommended-header">
            <p className="recommended-label">Curated For You</p>
            <h3 className="recommended-title">Recommended</h3>
          </div>
          <div className="recommended-grid">
            {relatedProducts.map((product) => (
              <Product
                key={product.name}
                product={product}
                productIndex={products.indexOf(product) + 1}
                showAddToCart={true}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
