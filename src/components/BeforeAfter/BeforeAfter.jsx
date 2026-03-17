"use client";
import "./BeforeAfter.css";
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { testimonialApi } from "@/lib/endpoints";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_RESULTS = [
  {
    name: "Meera S.",
    testimony: "My skin has never looked this radiant and clear.",
    product: "Kumkumadi Night Elixir",
    beforeImg: "/images/why1.png",
    afterImg: "/images/why2.png",
  },
  {
    name: "Priya K.",
    testimony: "The dark spots faded significantly within 4 weeks.",
    product: "Saffron Brightening Cream",
    beforeImg: "/images/why3.png",
    afterImg: "/images/c1.png",
  },
  {
    name: "Anita R.",
    testimony: "My hair feels stronger and the fall has reduced dramatically.",
    product: "Golden Elixir Hair Oil",
    beforeImg: "/images/c2.png",
    afterImg: "/images/c3.png",
  },
  {
    name: "Divya M.",
    testimony: "The natural glow I always wanted — finally achieved.",
    product: "Turmeric Glow Mask",
    beforeImg: "/images/b1.png",
    afterImg: "/images/b3.png",
  },
];

const BeforeAfter = () => {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const [results, setResults] = useState(FALLBACK_RESULTS);

  useEffect(() => {
    testimonialApi
      .getAll({ type: "before-after", limit: 4 })
      .then((data) => {
        const items = data.testimonials || data;
        if (Array.isArray(items) && items.length > 0) {
          setResults(
            items.map((t) => ({
              name: t.name,
              testimony: t.text,
              product: t.productName || "",
              beforeImg: t.beforeImage || "/images/why1.png",
              afterImg: t.afterImage || "/images/why2.png",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useGSAP(() => {
    if (!sectionRef.current) return;

    const cards = cardsRef.current.filter(Boolean);

    gsap.fromTo(
      cards,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none none",
        },
      }
    );
  }, { dependencies: [results] });

  return (
    <section className="before-after" ref={sectionRef}>
      <div className="ba-container">
        <div className="ba-header">
          <h2 className="ba-title">Real Results, Real People</h2>
          <p className="ba-subtitle">
            See the transformation our customers have experienced with Cleanse Ayurveda
          </p>
        </div>

        <div className="ba-grid">
          {results.map((result, index) => (
            <div
              className="ba-card"
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
            >
              <div className="ba-images">
                <div className="ba-image-wrapper">
                  <span className="ba-label">Before</span>
                  <img
                    src={result.beforeImg}
                    alt={`${result.name} before`}
                    loading="lazy"
                  />
                </div>
                <div className="ba-image-wrapper">
                  <span className="ba-label ba-label-after">After</span>
                  <img
                    src={result.afterImg}
                    alt={`${result.name} after`}
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="ba-card-info">
                <h4 className="ba-name">{result.name}</h4>
                <p className="ba-testimony">&ldquo;{result.testimony}&rdquo;</p>
                <span className="ba-product">{result.product}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;
