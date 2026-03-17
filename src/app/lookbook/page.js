"use client";
import "./lookbook.css";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { productApi } from "@/lib/endpoints";
import { productUrl } from "@/lib/normalizers";

const BG_COLORS = ["#D9C9A8", "#C4B48C", "#E7D0A6", "#C8AD73", "#D1BFA5", "#B8A47C"];

// Static editorial content (lifestyle & quotes) stays the same
const lifestyleCards = [
  { title: "Morning Ritual", desc: "Start your day with ancient Ayurvedic wisdom", img: "/images/b1.png", height: "tall" },
  { title: "Sacred Roots", desc: "Hair care rooted in tradition", img: "/images/why2.png", height: "medium" },
  { title: "Golden Hour", desc: "Saffron-infused luxury for radiant skin", img: "/images/b2.png", height: "tall" },
  { title: "Wellness Journey", desc: "Body care for mind and soul", img: "/images/why1.png", height: "medium" },
  { title: "Night Elixir", desc: "Overnight repair with precious herbs", img: "/images/b3.png", height: "tall" },
  { title: "Bridal Glow", desc: "Traditional beauty rituals for the big day", img: "/images/why3.png", height: "medium" },
];

const quoteCards = [
  { text: "Beauty begins the moment you decide to be yourself.", author: "Ancient Ayurveda" },
  { text: "Nature does not hurry, yet everything is accomplished.", author: "Ayurvedic Wisdom", dark: true },
];

function buildPins(products) {
  const pins = [];
  let pIdx = 0;
  let lIdx = 0;
  let qIdx = 0;

  // Pattern: lifestyle, product, quote, lifestyle, product, lifestyle, product, lifestyle, product, quote, lifestyle, product, lifestyle, product
  const pattern = ["lifestyle", "product", "quote", "lifestyle", "product", "lifestyle", "product", "lifestyle", "product", "quote", "lifestyle", "product", "lifestyle", "product"];

  for (const type of pattern) {
    if (type === "lifestyle" && lIdx < lifestyleCards.length) {
      pins.push({ type: "lifestyle", ...lifestyleCards[lIdx++] });
    } else if (type === "product" && pIdx < products.length) {
      const p = products[pIdx];
      const img = (p.images?.find((i) => i.isPrimary) || p.images?.[0])?.url || `/images/${(pIdx % 4) + 1}.png`;
      pins.push({
        type: "product",
        name: p.name,
        slug: p.slug,
        price: p.price,
        sizes: p.sizes || [],
        img,
        bg: BG_COLORS[pIdx % BG_COLORS.length],
        tag: p.tag,
      });
      pIdx++;
    } else if (type === "quote" && qIdx < quoteCards.length) {
      pins.push({ type: "quote", ...quoteCards[qIdx++] });
    }
  }
  return pins;
}

export default function Lookbook() {
  const itemsRef = useRef([]);
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productApi
      .getAll({ limit: 8 })
      .then((data) => {
        const products = data.products || [];
        setPins(buildPins(products));
      })
      .catch(() => {
        setPins(buildPins([]));
      })
      .finally(() => setLoading(false));
  }, []);

  useGSAP(() => {
    if (loading) return;
    gsap.fromTo(
      itemsRef.current.filter(Boolean),
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: "power3.out",
        delay: 0.3,
      }
    );
  }, { dependencies: [loading] });

  return (
    <div className="lookbook-page">
      {/* Hero */}
      <section className="lookbook-hero">
        <div className="lookbook-hero-content">
          <div className="lookbook-breadcrumb">
            <Link href="/">HOME</Link>/ <span>LOOKBOOK</span>
          </div>
          <h1 className="lookbook-hero-title">LOOKBOOK</h1>
          <p className="lookbook-hero-subtitle">
            Explore our curated collections and sacred beauty rituals.
          </p>
        </div>
      </section>

      {/* Pinterest Masonry */}
      <section className="lookbook-gallery">
        <div className="lookbook-masonry">
          {pins.map((pin, index) => (
            <div
              key={pin.title || pin.name || pin.text}
              className={`lb-pin ${pin.type === "lifestyle" ? `lb-${pin.height || "medium"}` : ""}`}
              ref={(el) => (itemsRef.current[index] = el)}
              style={{ opacity: 0 }}
            >
              {/* Lifestyle Card */}
              {pin.type === "lifestyle" && (
                <Link href="/wardrobe" className="lb-lifestyle">
                  <div className="lb-lifestyle-img">
                    <img src={pin.img} alt={pin.title} loading="lazy" />
                  </div>
                  <div className="lb-lifestyle-overlay">
                    <span className="lb-lifestyle-tag">Collection</span>
                    <h3 className="lb-lifestyle-title">{pin.title}</h3>
                    <p className="lb-lifestyle-desc">{pin.desc}</p>
                  </div>
                </Link>
              )}

              {/* Product Card */}
              {pin.type === "product" && (
                <Link href={productUrl(pin)} className="lb-product">
                  <div className="lb-product-img" style={{ backgroundColor: pin.bg }}>
                    <img src={pin.img} alt={pin.name} loading="lazy" />
                  </div>
                  <div className="lb-product-info">
                    <span className="lb-product-tag">{pin.tag}</span>
                    <h3 className="lb-product-name">{pin.name}</h3>
                    <div className="lb-product-bottom">
                      <span className="lb-product-price">{`\u20B9${pin.price}`}</span>
                      <span className="lb-product-btn">Shop Now</span>
                    </div>
                  </div>
                </Link>
              )}

              {/* Quote Card */}
              {pin.type === "quote" && (
                <div className={`lb-quote ${pin.dark ? "lb-quote-dark" : ""}`}>
                  <svg className="lb-quote-icon" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 7.05V12H6.95A5 5 0 0 0 2 17v0a5 5 0 0 0 5 5h1a3 3 0 0 0 3-3v-5a7 7 0 0 0-7-7h0v.05A5 5 0 0 1 11 7.05zM22 7.05V12h-4.05A5 5 0 0 0 13 17v0a5 5 0 0 0 5 5h1a3 3 0 0 0 3-3v-5a7 7 0 0 0-7-7h0v.05A5 5 0 0 1 22 7.05z"/>
                  </svg>
                  <p className="lb-quote-text">{pin.text}</p>
                  <span className="lb-quote-author">{`\u2014 ${pin.author}`}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
