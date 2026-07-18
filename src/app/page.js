"use client";
import "./home.css";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

import { shouldPlayLoader, LOADER_TOTAL_S } from "@/components/Preloader/Preloader";
import MarqueeBanner from "@/components/MarqueeBanner/MarqueeBanner";
// import TextBlock from "@/components/TextBlock/TextBlock";
import PeelReveal from "@/components/PeelReveal/PeelReveal";
// import CTA from "@/components/CTA/CTA";
import FeaturedSection, { BentoSection, ShopByCategory, BuildYourRitual } from "@/components/FeaturedSection/FeaturedSection";
import Testimonials from "@/components/Testimonials/Testimonials";
import RitualBanner from "@/components/RitualBanner/RitualBanner";
import HoverWord from "@/components/HoverWord/HoverWord";
import "@/components/HoverWord/HoverWord.css";
import ShopByProduct from "@/components/ShopByProduct/ShopByProduct";
import BlogSection from "@/components/BlogSection/BlogSection";
import BeforeAfter from "@/components/BeforeAfter/BeforeAfter";

import Copy from "@/components/Copy/Copy";
import Logo from "@/components/Logo/Logo";

import FOMOPopup from "@/components/FOMOPopup/FOMOPopup";
import ChatSupport from "@/components/ChatSupport/ChatSupport";
import { useSettings } from "@/context/SettingsContext";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

// Icon map for formula section (CMS uses string identifiers)
const FORMULA_ICONS = {
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" />
      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" />
    </svg>
  ),
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L12 6M12 6C9 6 6 9 6 13C6 17 9 22 12 22C15 22 18 17 18 13C18 9 15 6 12 6Z" />
      <path d="M12 6C12 6 10 8 10 11" />
      <path d="M12 6C12 6 14 8 14 11" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

/* The frosted hero blob: a closed, vertical organic shape — rounded upper lobe,
   a waist that pinches in on both sides around mid-height, and a fuller lower
   lobe. It stays entirely on-canvas (nothing bleeds off the right).
   Authored in a 0–1 box so it drives clip-path directly
   (clipPathUnits="objectBoundingBox"). */
const HERO_PANEL_SHAPE = [
  "M0.54,0",
  "C0.83,0 1,0.13 1,0.30", // upper-right shoulder
  "C1,0.45 0.90,0.52 0.895,0.63", // right waist — curved, not pinched
  "C0.89,0.75 0.96,0.80 0.93,0.86", // back out through the lower right
  "C0.88,0.95 0.66,1.01 0.46,1.04", // bottom runs downhill to the left…
  "C0.28,1.06 0.05,0.97 0.025,0.81", // …bottoming out on the left, then back up
  "C0.01,0.66 0.13,0.57 0.135,0.46", // left waist, set higher than the right
  "C0.14,0.33 0.03,0.27 0.08,0.17", // up the left shoulder
  "C0.15,0.05 0.33,0 0.54,0", // close the top
  "Z",
].join(" ");

const HERO_FEATURE_ICONS = {
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 4c0 9-5.5 14-12 14C5 18 4 15 4 12 4 6.5 9.5 4 20 4Z" />
      <path d="M4 20c4-8 9-11 14-12" />
    </svg>
  ),
  drop: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c3.5 4.2 6 7.5 6 10.5A6 6 0 0 1 6 13.5C6 10.5 8.5 7.2 12 3Z" />
    </svg>
  ),
  lotus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4c2 2.5 3 5 3 7.5 0 2-1.2 4-3 5.5-1.8-1.5-3-3.5-3-5.5C9 9 10 6.5 12 4Z" />
      <path d="M12 17c-3 1-6 0-8-3 2.5-1.5 5-1.5 7 0" />
      <path d="M12 17c3 1 6 0 8-3-2.5-1.5-5-1.5-7 0" />
    </svg>
  ),
};

const HERO_FEATURES = [
  { icon: "leaf", label: "Clinically-backed\nAyurvedic Formulas" },
  { icon: "drop", label: "Hydrates, Soothes\n& Restores Balance" },
  { icon: "lotus", label: "Clean, Conscious\n& Cruelty-Free" },
];

export default function Index() {
  const heroSectionRef = useRef(null);
  const formulasSectionRef = useRef(null);
  const centerImageRef = useRef(null);

  const settings = useSettings();

  /* No hardcoded fallback — only render slides once CMS images are loaded,
     otherwise an unrelated 4th image briefly flashes on reload */
  const cmsImages = settings.cmsHero?.carouselImages;
  // Each carousel image carries a desktop `url` and an admin-uploaded mobile
  // variant at `sources.mobile.url`. We pass BOTH to each slide as CSS vars so
  // the mobile hero shows the uploaded mobile image (falls back to desktop).
  const heroSlides = cmsImages?.length > 0
    ? cmsImages.map((img) => ({
        desktop: img.url,
        mobile: img.sources?.mobile?.url || img.url,
      }))
    // Fallback so the hero is never empty when the CMS has no carousel images.
    : [{ desktop: "/hero-fallback.png", mobile: "/hero-fallback.png" }];
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Marketing popups state
  const [showFOMO, setShowFOMO] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting + hash scroll
  useEffect(() => {
    setIsMounted(true);
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 800);
    }
  }, []);

  // CMS data (hero/formulas/bento/cta) loads or fails asynchronously, which
  // changes the height of sections ABOVE the pinned PeelReveal section. Without
  // this, PeelReveal's pin/start position is computed against the stale (pre-data)
  // layout and the "SHOP NOW" section shifts. Recompute all ScrollTrigger
  // positions once the settings-driven layout settles.
  useEffect(() => {
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(raf);
  }, [settings]);

  // Late-loading images can also change layout height after triggers are built.
  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // Show popups after a delay on page load, controlled by settings
  useEffect(() => {
    if (!isMounted) return;

    // Always show FOMO popups after mount
    const fomoTimer = setTimeout(() => {
      setShowFOMO(true);
    }, 1000);

    return () => {
      clearTimeout(fomoTimer);
    };
  }, [isMounted]);

  useGSAP(() => {
    const hero = heroSectionRef.current;
    if (!hero) return;

    // Entrance only: the hero card rises and scales OUT of the page on load,
    // reading like a wrapper lifting off the cream surface. It then stays
    // fixed — no scroll-driven scaling.
    gsap.fromTo(
      hero,
      { scale: 0.9, yPercent: 6, autoAlpha: 0 },
      {
        scale: 1,
        yPercent: 0,
        autoAlpha: 1,
        duration: 1.2,
        ease: "power3.out",
        force3D: true,
      }
    );
  }, { dependencies: [] });

  // The logo, heading and description each reveal themselves (CSS keyframes and
  // <Copy>), but the flourish, feature pillars and proof line had nothing — so
  // they popped in fully-formed while everything around them animated. Reveal
  // them on the same timeline. They're not wrapped in <Copy> because it splits
  // text into lines, which would tear apart the icon + label flex rows.
  useGSAP(() => {
    const base = shouldPlayLoader() ? LOADER_TOTAL_S : 0.85;
    const rise = { opacity: 0, y: 14 };
    const settle = { opacity: 1, y: 0, ease: "power2.out" };

    gsap.fromTo(".hero-flourish", rise, { ...settle, duration: 0.6, delay: base + 0.3 });
    gsap.fromTo(".hero-feature", rise, { ...settle, duration: 0.7, delay: base + 0.42, stagger: 0.12 });
    gsap.fromTo(".hero-proof-item", rise, { ...settle, duration: 0.6, delay: base + 0.75, stagger: 0.08 });
  }, { scope: heroSectionRef, dependencies: [] });

  // Formulas section zoom-out animation
  useGSAP(() => {
    if (!formulasSectionRef.current || !centerImageRef.current) return;

    const section = formulasSectionRef.current;
    const cards = section.querySelectorAll('.formula-box');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "center center",
        scrub: 0.3,
      },
    });

    // Zoom out center image
    tl.fromTo(centerImageRef.current,
      { y: -300, force3D: true },
      { y: 0, duration: 1, ease: "power2.out", force3D: true },
      0
    );

    // Fade in formula cards
    tl.fromTo(cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      0.6
    );

  }, { dependencies: [] });

  return (
    <>
      {/* Preloader is rendered once globally in client-layout (avoids a duplicate). */}

      {settings.promoBanner?.enabled !== false && (
        <div className="promo-bar">
          {(settings.promoBanner?.messages || ["100% NATURAL INGREDIENTS", `FREE SHIPPING ON ORDERS ABOVE ₹${settings.freeShippingThreshold}`, "AYURVEDIC & DOCTOR APPROVED"]).map((msg, i) => (
            <span key={i} className={i === 0 ? "promo-left" : i === 1 ? "promo-center" : "promo-right"}>{msg}</span>
          ))}
        </div>
      )}

      <div className="hero-wrapper">
        <section
          className="hero"
          ref={heroSectionRef}
        >
          {heroSlides.map((slide, i) => (
            <div
              key={slide.desktop}
              className={`hero-slide ${i === currentHeroIndex ? "active" : ""}`}
              style={{
                "--hero-bg": `url(${slide.desktop})`,
                "--hero-bg-mobile": `url(${slide.mobile})`,
              }}
            />
          ))}
          {/* Frosted panel the copy sits on. Purely decorative: the content is a
              sibling, not a child, so the clip-path can never cut the text. */}
          <div className="hero-panel" aria-hidden="true">
            <svg className="hero-panel-defs" width="0" height="0">
              <defs>
                <clipPath id="heroPanelClip" clipPathUnits="objectBoundingBox">
                  <path d={HERO_PANEL_SHAPE} />
                </clipPath>
              </defs>
            </svg>
            <div className="hero-panel-glass" />
            <svg className="hero-panel-outline" viewBox="0 0 1 1" preserveAspectRatio="none">
              <path d={HERO_PANEL_SHAPE} />
            </svg>
          </div>

          <div className="container">
            <div className="hero-header">
              <h1 className="hero-logo-heading">
                <span className="hero-logo-revealmask">
                  <Logo
                    src="/logo.png"
                    alt={settings.cmsHero?.title || "Cleanse Ayurveda"}
                    className="hero-logo-mark"
                    imgClassName="hero-logo-img"
                  />
                </span>
              </h1>
              {/* Portrait keeps the original logo + subtitle + CTA hero; the
                  reworked panel/heading/pillars are desktop-only. Both sets are
                  always rendered and CSS picks one, so there's no viewport check
                  during render to desync on hydration. */}
              <Copy animateOnScroll={false} delay={shouldPlayLoader() ? LOADER_TOTAL_S : 0.85}>
                <p className="hero-subtitle">
                  {settings.cmsHero?.subtitle || "Natural Skin Care for Mindful Living"}
                </p>
              </Copy>
              <Copy animateOnScroll={false} delay={shouldPlayLoader() ? LOADER_TOTAL_S : 0.85}>
                <h2 className="hero-display-heading">
                  {settings.cmsHero?.heading || "Calm. Nourished. Radiant."}
                </h2>
              </Copy>
              <div className="hero-flourish" aria-hidden="true">
                <span className="hero-flourish-rule" />
                <svg className="hero-flourish-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 17c-2.5 0-5-1.5-5-4 0-2 1.5-3.5 3-3.5 1.2 0 2 .8 2 2" />
                  <path d="M12 17c2.5 0 5-1.5 5-4 0-2-1.5-3.5-3-3.5-1.2 0-2 .8-2 2" />
                  <path d="M12 17v-5.5" />
                </svg>
                <span className="hero-flourish-rule" />
              </div>
              <Copy animateOnScroll={false} delay={shouldPlayLoader() ? LOADER_TOTAL_S + 0.15 : 1}>
                <p className="hero-description">
                  {settings.cmsHero?.description ||
                    "The Ayurvedic way to your most balanced, beautiful skin."}
                </p>
              </Copy>
              <ul className="hero-features">
                {HERO_FEATURES.map((feature) => (
                  <li key={feature.icon} className="hero-feature">
                    <span className="hero-feature-icon">{HERO_FEATURE_ICONS[feature.icon]}</span>
                    <span className="hero-feature-label">
                      {feature.label.split("\n").map((line) => (
                        <span key={line} className="hero-feature-line">{line}</span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="hero-btn-wrapper">
                <Link href={settings.cmsHero?.ctaLink || "/wardrobe"} className="hero-btn">{settings.cmsHero?.ctaText || "Shop Now"}</Link>
              </div>
              {/* Deliberately not the marquee's claims (natural / free shipping /
                  doctor approved) — those already sit directly above the hero. */}
              <ul className="hero-proof">
                {(settings.cmsHero?.proofPoints?.length
                  ? settings.cmsHero.proofPoints
                  : ["94% saw results in 28 days", "20+ botanical actives", "0 synthetic additives"]
                ).map((point) => (
                  <li key={point} className="hero-proof-item">{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
        <div className="hero-bottom-tagline">
          <p className="hero-tagline">{`\u201c${settings.cmsFormula?.tagline || "We aren\u2019t merely selling bottles; we are delivering a clinically-backed path to purity."}\u201d`}</p>
        </div>
      </div>

      <section className="formulas" ref={formulasSectionRef}>
        <div className="formulas-content">
          <div className="formulas-image-layer">
            <div className="formulas-center">
              <div className="formulas-center-image" ref={centerImageRef}>
                <img src={settings.cmsFormula?.centerImage?.url || "/images/a.png"} alt="Natural skincare product" loading="lazy" />
              </div>
            </div>
          </div>
          <div className="formulas-cards-layer">
            {(settings.cmsFormula?.boxes || []).map((box) => (
              <div key={box.position} className={`formula-box formula-box-${box.position}`}>
                <div className="formula-box-icon">
                  {FORMULA_ICONS[box.icon] || FORMULA_ICONS.leaf}
                </div>
                <h4 dangerouslySetInnerHTML={{ __html: (box.title || "").replace(/\n/g, "<br />") }} />
                <p>{box.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="featured">
        <FeaturedSection />
      </div>

      <MarqueeBanner />

      <div id="why-skin">
        <BentoSection />
      </div>

      <ShopByCategory />

      <div id="rituals">
        <BuildYourRitual />
      </div>

      <PeelReveal />

      {/* <ShopByProduct /> */}

      <BlogSection />

      {/* <CTA /> */}

      <div id="testimonials">
        <Testimonials />
      </div>

      <RitualBanner />

      {/* <BeforeAfter /> */}

      <section className="cta-section">
        <div className="cta-card">
          <img src={settings.cmsCta?.image?.url || "/images/cta.png"} alt="Ancient Secrets, Modern Radiance" className="cta-image" />
          <div className="cta-content">
            <h2 className="cta-heading">{settings.cmsCta?.heading || "Ancient Secrets, Modern Radiance"}</h2>
            <p className="cta-desc">{settings.cmsCta?.description || "Crafted with turmeric, saffron and rose petals for naturally glowing skin."}</p>
            <Link href={settings.cmsCta?.ctaLink || "/wardrobe"} className="cta-shop-btn">{settings.cmsCta?.ctaText || "SHOP NOW"}</Link>
          </div>
        </div>
      </section>

      {/* Marketing Components - Only render after client mount */}
      {isMounted && (
        <>
          <FOMOPopup isActive={showFOMO} />
          <ChatSupport />
        </>
      )}
    </>
  );
}
