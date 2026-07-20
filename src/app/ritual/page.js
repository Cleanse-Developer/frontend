"use client";
import "./ritual.css";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

import Copy from "@/components/Copy/Copy";
import ImageTrail from "@/components/ImageTrail/ImageTrail";
import { productApi } from "@/lib/endpoints";
import { useSettings } from "@/context/SettingsContext";
import { productUrl, normalizeProduct } from "@/lib/normalizers";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* The /ritual page. All content is admin-editable via the cmsRitualPage CMS
   section; `modes` is a fixed morning/evening pair whose `slug` is both the
   lookup key and the URL hash contract (/ritual#evening is linked from the
   homepage banner). Step numbers are derived from position, so reordering a
   step in the admin can never desync them. */

/* Soft tile backgrounds the product images rest on, drawn from the brand palette */
const TILES = ["#E7D0A6", "#D9C9A8", "#C4B48C", "#D1BFA5", "#C8AD73"];

/* Hero art per ritual, keyed by the same `slug` the mode toggle uses */
const HERO_IMAGES = { morning: "/awaken.png", evening: "/night.png" };

export default function Ritual() {
  const settings = useSettings();
  const data = settings.cmsRitualPage || {};
  const modes = data.modes || [];

  const pageRef = useRef(null);
  const stepsRef = useRef(null);
  const hashAppliedRef = useRef(false);
  const [mode, setMode] = useState("morning");
  const [productsByName, setProductsByName] = useState(null);

  const modeIndex = modes.findIndex((m) => m?.slug === mode);
  const ritual = modeIndex >= 0 ? modes[modeIndex] : modes[0];
  const steps = ritual?.steps;

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
  const stepProduct = (step) =>
    productsByName?.get(step.product?.trim().toLowerCase());

  const stepHref = (step) => {
    const match = stepProduct(step);
    if (match?.slug) return productUrl(match);
    return `/wardrobe?search=${encodeURIComponent(step.product)}`;
  };

  /* Show the real catalogue photo for the product each step names, so the tiles
     can never drift from the copy beside them. The CMS step upload is the
     fallback for a step whose product isn't in the catalogue yet. */
  const stepImage = (step) => {
    const match = stepProduct(step);
    return match ? normalizeProduct(match).primaryImage : step.image?.url;
  };

  /* Reveal each step as it scrolls in; re-runs whenever the AM/PM mode changes
     or the CMS steps arrive, because useGSAP's context cleanup kills the prior
     ScrollTriggers. Without `steps` in the deps the triggers would be built
     against markup that hasn't rendered yet and the steps would stay hidden. */
  useGSAP(
    () => {
      const stepEls = gsap.utils.toArray(".ritual-step");
      stepEls.forEach((step) => {
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
    { scope: stepsRef, dependencies: [mode, steps] }
  );

  // Honour a deep-link from the home page: /ritual#evening (or #morning) opens
  // the matching ritual and scrolls to the step flow. Waits for the CMS modes
  // so the hash still applies if settings arrive after mount.
  useEffect(() => {
    if (hashAppliedRef.current || modes.length === 0) return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) {
      hashAppliedRef.current = true;
      return;
    }
    if (modes.some((m) => m?.slug === hash)) {
      hashAppliedRef.current = true;
      setMode(hash);
      const el = document.querySelector(".ritual-flow");
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 500);
      }
    }
  }, [modes]);

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
      {/* The hero follows the selected ritual, morning and evening each get
          their own image, so it can't be a static CSS background. Falls back to
          the admin's single hero upload if a mode ever has no art of its own. */}
      <section
        className="ritual-hero"
        style={{ backgroundImage: `url("${HERO_IMAGES[mode] || data.heroImage?.url || HERO_IMAGES.morning}")` }}
      >
        <div className="ritual-hero-overlay" />
        <div className="ritual-hero-content">
          <div className="ritual-breadcrumb">
            <Link href="/">Home</Link>
            <span className="ritual-bc-sep">/</span>
            <span className="ritual-bc-current">{data.heroBreadcrumb}</span>
          </div>
          <Copy type="flicker" animateOnScroll={false} delay={0.5}>
            <h1 className="ritual-hero-title">{data.heroTitle}</h1>
          </Copy>
          <Copy animateOnScroll={false} delay={0.8}>
            <p className="ritual-hero-subtitle">{data.heroSubtitle}</p>
          </Copy>
        </div>
        <div className="ritual-scroll-cue">
          <span>{data.heroScrollCue}</span>
          <span className="ritual-scroll-line" />
        </div>
      </section>

      {/* ===== Philosophy ===== */}
      <section className="ritual-intro">
        <ImageTrail />
        <div className="ritual-intro-inner">
          <span className="ritual-eyebrow">{data.philosophyEyebrow}</span>
          <Copy>
            <h2 className="ritual-intro-statement">{data.philosophyStatement}</h2>
          </Copy>
          <Copy>
            <p className="bodyCopy ritual-intro-body">{data.philosophyBody}</p>
          </Copy>
        </div>
      </section>

      {/* ===== Ritual switcher + steps ===== */}
      <section className="ritual-flow">
        <div className="ritual-flow-head">
          <div className="ritual-toggle" role="tablist" aria-label="Choose ritual">
            <span
              className="ritual-toggle-thumb"
              style={{
                transform: `translateX(${Math.max(modeIndex, 0) * 100}%)`,
              }}
            />
            {modes.map((m) => (
              <button
                key={m.slug}
                type="button"
                role="tab"
                aria-selected={mode === m.slug}
                className={`ritual-toggle-btn ${mode === m.slug ? "is-active" : ""}`}
                onClick={() => switchMode(m.slug)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="ritual-flow-titleblock">
            <h2 className="ritual-flow-title">{ritual?.title}</h2>
            <p className="ritual-flow-tagline">{ritual?.tagline}</p>
            <span className="ritual-flow-meta">{ritual?.meta}</span>
          </div>
        </div>

        <div className="ritual-steps" ref={stepsRef}>
          {(steps || []).map((step, i) => (
            <article
              className={`ritual-step ${i % 2 === 1 ? "is-reversed" : ""}`}
              key={`${mode}-${i}`}
            >
              <div className="ritual-step-visual">
                <span className="ritual-step-rail" aria-hidden="true" />
                <div
                  className="ritual-step-tile"
                  style={{ backgroundColor: TILES[i % TILES.length] }}
                >
                  <span className="ritual-step-number">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="ritual-step-img">
                    <img src={stepImage(step)} alt={step.product} loading="lazy" />
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
                  {(step.tags || []).map((t, ti) => (
                    <span className="ritual-tag" key={ti}>
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
          <span className="ritual-eyebrow ritual-eyebrow-light">
            {data.pauseEyebrow}
          </span>
          <Copy>
            <h2 className="ritual-pause-title">{data.pauseTitle}</h2>
          </Copy>
          <div className="ritual-breath" aria-hidden="true">
            <span className="ritual-breath-ring" />
            <span className="ritual-breath-core" />
            <span className="ritual-breath-label">{data.pauseBreathLabel}</span>
          </div>
          <p className="ritual-pause-note">{data.pauseNote}</p>
        </div>
      </section>

      {/* ===== Shop the ritual ===== */}
      <section className="ritual-shop">
        <div className="ritual-shop-head">
          <span className="ritual-eyebrow">{data.shopEyebrow}</span>
          <h2 className="ritual-shop-title">{data.shopTitle}</h2>
          <p className="ritual-shop-sub">{data.shopSubtitle}</p>
        </div>
        <div className="ritual-shop-grid">
          {(steps || []).map((step, i) => (
            <Link href={stepHref(step)} className="ritual-shop-card" key={`${mode}-${i}`}>
              <div
                className="ritual-shop-card-img"
                style={{ backgroundColor: TILES[i % TILES.length] }}
              >
                <img src={stepImage(step)} alt={step.product} loading="lazy" />
              </div>
              <span className="ritual-shop-card-phase">{step.phase}</span>
              <span className="ritual-shop-card-name">{step.product}</span>
            </Link>
          ))}
        </div>
        <div className="ritual-shop-cta">
          {data.shopCtaText && (
            <Link href={data.shopCtaLink || "/wardrobe"} className="ritual-cta-btn">
              {data.shopCtaText}
            </Link>
          )}
          {data.shopSecondaryCtaText && (
            <Link
              href={data.shopSecondaryCtaLink || "/genesis"}
              className="ritual-cta-link"
            >
              {data.shopSecondaryCtaText}
            </Link>
          )}
        </div>
      </section>

      {/* ===== Closing quote ===== */}
      <section className="ritual-quote">
        <Copy type="flicker">
          <p className="ritual-quote-text">{data.quoteText}</p>
        </Copy>
        <span className="ritual-quote-author">{data.quoteAuthor}</span>
      </section>
    </div>
  );
}
