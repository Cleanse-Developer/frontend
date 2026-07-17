"use client";
import "./ritual.css";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

import Copy from "@/components/Copy/Copy";
import ImageTrail from "@/components/ImageTrail/ImageTrail";
import { productApi } from "@/lib/endpoints";
import { productUrl } from "@/lib/normalizers";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Soft tile backgrounds the product images rest on, drawn from the brand palette */
const TILES = ["#E7D0A6", "#D9C9A8", "#C4B48C", "#D1BFA5", "#C8AD73"];

const RITUALS = {
  morning: {
    label: "Morning",
    title: "Awaken",
    tagline:
      "Four unhurried steps to greet the day with skin and hair that feel clean, fresh and cared for.",
    meta: "4 steps · ≈ 5 minutes",
    steps: [
      {
        n: "01",
        phase: "Cleanse",
        product: "Hydrating Face Wash",
        time: "60 sec",
        img: "/images/facecream%20mock.png",
        how: "Massage a coin-sized amount over damp skin in slow upward circles, then rinse with cool water.",
        desc: "A gentle gel wash that refreshes and hydrates without ever stripping.",
        tags: ["Purifies", "Hydrates"],
      },
      {
        n: "02",
        phase: "Hydrate",
        product: "Face Moisturizer",
        time: "30 sec",
        img: "/cream.jpg",
        how: "Smooth a pearl over face and neck in light upward strokes.",
        desc: "Weightless moisture for a soft, dewy finish that lasts all day.",
        tags: ["Nourishes", "Plumps"],
      },
      {
        n: "03",
        phase: "Hair",
        product: "Hydra Smooth Shampoo",
        time: "2 min",
        img: "/pink.jpg",
        how: "Work into a rich lather at the roots, then rinse through the lengths.",
        desc: "Smooths and softens for shiny, manageable hair.",
        tags: ["Smooths", "Strengthens"],
      },
      {
        n: "04",
        phase: "Body",
        product: "Exfoliation Body Wash",
        time: "2 min",
        img: "/natural.png",
        how: "Lather over damp skin in slow circles, then rinse clean.",
        desc: "Buffs away dullness to reveal soft, even-toned skin.",
        tags: ["Exfoliates", "Renews"],
      },
    ],
  },
  evening: {
    label: "Evening",
    title: "Restore",
    tagline:
      "A slower routine to undo the day and let skin and hair restore themselves overnight.",
    meta: "4 steps · ≈ 8 minutes",
    steps: [
      {
        n: "01",
        phase: "Cleanse",
        product: "Oil Control Face Wash",
        time: "60 sec",
        img: "/images/oil.png",
        how: "Massage over damp skin to lift away the day's oil, sweat and city grime, then rinse.",
        desc: "Clears excess oil and impurities for a fresh, balanced finish.",
        tags: ["Purifies", "Balances"],
      },
      {
        n: "02",
        phase: "Nourish",
        product: "Hair Oil",
        time: "5 min",
        img: "/jar.png",
        how: "Warm a few drops and massage into the scalp and lengths; leave overnight or 30 minutes before washing.",
        desc: "Strengthens roots and restores lasting softness and shine.",
        tags: ["Strengthens", "Nourishes"],
      },
      {
        n: "03",
        phase: "Replenish",
        product: "Face Moisturizer",
        time: "30 sec",
        img: "/images/night%20cream.png",
        how: "Massage a generous layer over clean skin to lock in moisture overnight.",
        desc: "Deeply hydrates and softens while you sleep.",
        tags: ["Repairs", "Calms"],
      },
      {
        n: "04",
        phase: "Hair",
        product: "Oil Control Shampoo",
        time: "2 min",
        img: "/serum.png",
        how: "Lather at the scalp to clear excess oil, then rinse well.",
        desc: "Keeps an oily scalp fresh, light and balanced.",
        tags: ["Balances", "Clarifies"],
      },
    ],
  },
};

export default function Ritual() {
  const pageRef = useRef(null);
  const stepsRef = useRef(null);
  const [mode, setMode] = useState("morning");
  const [productsByName, setProductsByName] = useState(null);

  const ritual = RITUALS[mode];

  // The RITUALS steps are authored copy and carry a product NAME, not a slug.
  // Resolve those names against the real catalogue so each card links to its own
  // product detail page.
  useEffect(() => {
    productApi
      .getAll({ limit: 50 })
      .then((data) => {
        const map = new Map();
        (data.products || []).forEach((p) => {
          if (p?.name) map.set(p.name.trim().toLowerCase(), p);
        });
        setProductsByName(map);
      })
      .catch(() => setProductsByName(new Map()));
  }, []);

  // Falls back to a filtered wardrobe search when a step's product isn't in the
  // catalogue (renamed, unpublished) — never a dead link, never the wrong product.
  const stepHref = (step) => {
    const match = productsByName?.get(step.product.trim().toLowerCase());
    if (match?.slug) return productUrl(match);
    return `/wardrobe?search=${encodeURIComponent(step.product)}`;
  };

  /* Reveal each step as it scrolls in; re-runs whenever the AM/PM mode changes
     because useGSAP's context cleanup kills the prior ScrollTriggers. */
  useGSAP(
    () => {
      const steps = gsap.utils.toArray(".ritual-step");
      steps.forEach((step) => {
        const visual = step.querySelector(".ritual-step-visual");
        const body = step.querySelector(".ritual-step-body");
        gsap.fromTo(
          [visual, body],
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: step, start: "top 80%" },
          }
        );
      });
    },
    { scope: stepsRef, dependencies: [mode] }
  );

  // Honour a deep-link from the home page: /ritual#evening (or #morning) opens
  // the matching ritual and scrolls to the step flow.
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "evening" || hash === "morning") {
      setMode(hash);
      const el = document.querySelector(".ritual-flow");
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 500);
      }
    }
  }, []);

  const switchMode = (next) => {
    if (next === mode) return;
    // Brief cross-fade so the change of ritual feels intentional, not abrupt
    gsap.fromTo(
      stepsRef.current,
      { opacity: 0.2 },
      { opacity: 1, duration: 0.5, ease: "power2.out" }
    );
    setMode(next);
  };

  return (
    <div className="ritual-page" ref={pageRef}>
      {/* ===== Hero ===== */}
      <section className="ritual-hero">
        <div className="ritual-hero-overlay" />
        <div className="ritual-hero-content">
          <div className="ritual-breadcrumb">
            <Link href="/">Home</Link>
            <span className="ritual-bc-sep">/</span>
            <span className="ritual-bc-current">The Ritual</span>
          </div>
          <Copy type="flicker" animateOnScroll={false} delay={0.5}>
            <h1 className="ritual-hero-title">The Ritual</h1>
          </Copy>
          <Copy animateOnScroll={false} delay={0.8}>
            <p className="ritual-hero-subtitle">
              Skincare, slowed down. A daily ceremony of face &amp; self-care,
              guided by Ayurveda and made with Cleanse.
            </p>
          </Copy>
        </div>
        <div className="ritual-scroll-cue">
          <span>Begin</span>
          <span className="ritual-scroll-line" />
        </div>
      </section>

      {/* ===== Philosophy ===== */}
      <section className="ritual-intro">
        <ImageTrail />
        <div className="ritual-intro-inner">
          <span className="ritual-eyebrow">Self-care as ceremony</span>
          <Copy>
            <h2 className="ritual-intro-statement">
              A ritual is not a routine. It is a few honest minutes you give
              back to yourself, to breathe, to touch your skin with intention,
              and to let nature do the rest.
            </h2>
          </Copy>
          <Copy>
            <p className="bodyCopy ritual-intro-body">
              Every Cleanse formula is crafted to be felt, not rushed. Follow the
              morning ritual to wake and protect, or the evening ritual to undo
              the day and restore. Each step layers in the order your skin asks
              for it.
            </p>
          </Copy>
        </div>
      </section>

      {/* ===== Ritual switcher + steps ===== */}
      <section className="ritual-flow">
        <div className="ritual-flow-head">
          <div className="ritual-toggle" role="tablist" aria-label="Choose ritual">
            <span
              className="ritual-toggle-thumb"
              style={{ transform: mode === "evening" ? "translateX(100%)" : "translateX(0%)" }}
            />
            {Object.entries(RITUALS).map(([key, r]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                className={`ritual-toggle-btn ${mode === key ? "is-active" : ""}`}
                onClick={() => switchMode(key)}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="ritual-flow-titleblock">
            <h2 className="ritual-flow-title">{ritual.title}</h2>
            <p className="ritual-flow-tagline">{ritual.tagline}</p>
            <span className="ritual-flow-meta">{ritual.meta}</span>
          </div>
        </div>

        <div className="ritual-steps" ref={stepsRef}>
          {ritual.steps.map((step, i) => (
            <article
              className={`ritual-step ${i % 2 === 1 ? "is-reversed" : ""}`}
              key={`${mode}-${step.n}`}
            >
              <div className="ritual-step-visual">
                <span className="ritual-step-rail" aria-hidden="true" />
                <div
                  className="ritual-step-tile"
                  style={{ backgroundColor: TILES[i % TILES.length] }}
                >
                  <span className="ritual-step-number">{step.n}</span>
                  <div className="ritual-step-img">
                    <img src={step.img} alt={step.product} loading="lazy" />
                  </div>
                </div>
              </div>

              <div className="ritual-step-body">
                <div className="ritual-step-metarow">
                  <span className="ritual-step-phase">{step.phase}</span>
                  <span className="ritual-step-time">{step.time}</span>
                </div>
                <h3 className="ritual-step-product">{step.product}</h3>
                <p className="ritual-step-how">{step.how}</p>
                <p className="bodyCopy ritual-step-desc">{step.desc}</p>
                <div className="ritual-step-tags">
                  {step.tags.map((t) => (
                    <span className="ritual-tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ===== The Pause, mindful self-care moment ===== */}
      <section className="ritual-pause">
        <div className="ritual-pause-inner">
          <span className="ritual-eyebrow ritual-eyebrow-light">The pause</span>
          <Copy>
            <h2 className="ritual-pause-title">Breathe. This moment is yours.</h2>
          </Copy>
          <div className="ritual-breath" aria-hidden="true">
            <span className="ritual-breath-ring" />
            <span className="ritual-breath-core" />
            <span className="ritual-breath-label">Inhale · Exhale</span>
          </div>
          <p className="ritual-pause-note">
            Between cleansing and treating, close your eyes for three slow
            breaths. Self-care begins the moment you decide to be present.
          </p>
        </div>
      </section>

      {/* ===== Shop the ritual ===== */}
      <section className="ritual-shop">
        <div className="ritual-shop-head">
          <span className="ritual-eyebrow">The essentials</span>
          <h2 className="ritual-shop-title">Build your ritual</h2>
          <p className="ritual-shop-sub">
            Everything your skin needs, nothing it doesn&apos;t. Assemble your
            own ceremony from the Cleanse collection.
          </p>
        </div>
        <div className="ritual-shop-grid">
          {RITUALS[mode].steps.map((step, i) => (
            <Link href={stepHref(step)} className="ritual-shop-card" key={step.n}>
              <div
                className="ritual-shop-card-img"
                style={{ backgroundColor: TILES[i % TILES.length] }}
              >
                <img src={step.img} alt={step.product} loading="lazy" />
              </div>
              <span className="ritual-shop-card-phase">{step.phase}</span>
              <span className="ritual-shop-card-name">{step.product}</span>
            </Link>
          ))}
        </div>
        <div className="ritual-shop-cta">
          <Link href="/wardrobe" className="ritual-cta-btn">
            Shop the collection
          </Link>
          <Link href="/genesis" className="ritual-cta-link">
            Our story
          </Link>
        </div>
      </section>

      {/* ===== Closing quote ===== */}
      <section className="ritual-quote">
        <Copy type="flicker">
          <p className="ritual-quote-text">
            “Nature does not hurry, yet everything is accomplished.”
          </p>
        </Copy>
        <span className="ritual-quote-author">Ayurvedic Wisdom</span>
      </section>
    </div>
  );
}
