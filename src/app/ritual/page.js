"use client";
import "./ritual.css";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

import Copy from "@/components/Copy/Copy";
import ImageTrail from "@/components/ImageTrail/ImageTrail";

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
      "Five unhurried steps to greet the day with skin that feels clean, calm and protected.",
    meta: "5 steps · ≈ 7 minutes",
    steps: [
      {
        n: "01",
        phase: "Cleanse",
        product: "Neem & Rose Gel Cleanser",
        time: "60 sec",
        img: "/images/facecream%20mock.png",
        how: "Massage a coin-sized amount over damp skin in slow upward circles, then rinse with cool water.",
        desc: "Sweeps away the night without ever stripping — skin is left soft, never tight.",
        tags: ["Purifies", "Balances"],
      },
      {
        n: "02",
        phase: "Mist",
        product: "Rose & Vetiver Hydrosol",
        time: "15 sec",
        img: "/pink.jpg",
        how: "Mist twice from a hand's distance, then press into the skin with warm palms.",
        desc: "Restores the skin's natural pH and quietly wakes the senses.",
        tags: ["Hydrates", "Tones"],
      },
      {
        n: "03",
        phase: "Treat",
        product: "Saffron Vitamin C Serum",
        time: "30 sec",
        img: "/images/skin%20serum.png",
        how: "Warm three or four drops between fingertips and press in, lifting away from the eyes.",
        desc: "Brightens dullness and evens tone with cold-pressed Kashmiri saffron.",
        tags: ["Brightens", "Antioxidant"],
      },
      {
        n: "04",
        phase: "Hydrate",
        product: "Kokum Day Moisturiser",
        time: "30 sec",
        img: "/cream.jpg",
        how: "Smooth a pearl of cream over face and neck in upward strokes.",
        desc: "Seals in moisture for a weightless, dewy finish that lasts till dusk.",
        tags: ["Nourishes", "Plumps"],
      },
      {
        n: "05",
        phase: "Protect",
        product: "Mineral Veil SPF 40",
        time: "30 sec",
        img: "/images/sun.png",
        how: "Finish with a generous, even layer — always the final step, reapplied through the day.",
        desc: "A sheer mineral shield against UV light and city pollution.",
        tags: ["Protects", "Everyday"],
      },
    ],
  },
  evening: {
    label: "Evening",
    title: "Restore",
    tagline:
      "A slower ceremony to undo the day and let skin repair itself while you sleep.",
    meta: "5 steps · ≈ 10 minutes",
    steps: [
      {
        n: "01",
        phase: "Melt",
        product: "Kumkumadi Cleansing Oil",
        time: "60 sec",
        img: "/images/oil.png",
        how: "Massage onto dry skin to dissolve sunscreen and grime, then emulsify with water and rinse.",
        desc: "The first cleanse — it lifts the whole day away in one warm sweep.",
        tags: ["Dissolves", "Comforts"],
      },
      {
        n: "02",
        phase: "Polish",
        product: "Ubtan Enzyme Polish",
        time: "60 sec · 2–3× weekly",
        img: "/natural.png",
        how: "Massage over damp skin and let the turmeric–chickpea blend rest a minute before rinsing.",
        desc: "Gently buffs away dull, tired cells to reveal fresh, even skin beneath.",
        tags: ["Exfoliates", "Renews"],
      },
      {
        n: "03",
        phase: "Treat",
        product: "Bakuchiol Renewal Serum",
        time: "30 sec",
        img: "/serum.png",
        how: "Press three or four drops into clean skin — a gentle, plant-born alternative to retinol.",
        desc: "Smooths the look of fine lines and refines texture as you rest.",
        tags: ["Renews", "Firms"],
      },
      {
        n: "04",
        phase: "Nourish",
        product: "Ashwagandha Night Cream",
        time: "30 sec",
        img: "/images/night%20cream.png",
        how: "Massage a generous layer in slow, upward circles to support overnight repair.",
        desc: "Deeply restorative botanicals work in rhythm with the skin's nightly cycle.",
        tags: ["Repairs", "Calms"],
      },
      {
        n: "05",
        phase: "Seal",
        product: "Kumkumadi Facial Oil",
        time: "60 sec",
        img: "/jar.png",
        how: "Warm four or five drops and press over the face — finish with three slow breaths.",
        desc: "Locks in every layer beneath a veil of saffron and 24-herb gold.",
        tags: ["Seals", "Glows"],
      },
    ],
  },
};

export default function Ritual() {
  const pageRef = useRef(null);
  const stepsRef = useRef(null);
  const [mode, setMode] = useState("morning");

  const ritual = RITUALS[mode];

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
              back to yourself — to breathe, to touch your skin with intention,
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

      {/* ===== The Pause — mindful self-care moment ===== */}
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
            <Link href="/wardrobe" className="ritual-shop-card" key={step.n}>
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
        <span className="ritual-quote-author">— Ayurvedic Wisdom</span>
      </section>
    </div>
  );
}
