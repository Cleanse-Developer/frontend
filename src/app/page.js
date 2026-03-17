"use client";
import "./home.css";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

// import Preloader, { isInitialLoad } from "@/components/Preloader/Preloader";
const isInitialLoad = false;
// import LeafSpread from "@/components/LeafSpread/LeafSpread";
import MarqueeBanner from "@/components/MarqueeBanner/MarqueeBanner";
// import TextBlock from "@/components/TextBlock/TextBlock";
import PeelReveal from "@/components/PeelReveal/PeelReveal";
// import CTA from "@/components/CTA/CTA";
import FeaturedSection, { BentoSection, ShopByCategory, BuildYourRitual, LatestLaunches } from "@/components/FeaturedSection/FeaturedSection";
import Testimonials from "@/components/Testimonials/Testimonials";
import HoverWord from "@/components/HoverWord/HoverWord";
import "@/components/HoverWord/HoverWord.css";
import ShopByProduct from "@/components/ShopByProduct/ShopByProduct";
import BlogSection from "@/components/BlogSection/BlogSection";
import BeforeAfter from "@/components/BeforeAfter/BeforeAfter";

import Copy from "@/components/Copy/Copy";

import SpinWheel from "@/components/SpinWheel/SpinWheel";
import NewsletterPopup from "@/components/NewsletterPopup/NewsletterPopup";
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

export default function Index() {
  const heroSectionRef = useRef(null);
  const formulasSectionRef = useRef(null);
  const centerImageRef = useRef(null);
  const leafSpreadRef = useRef(null);
  const leafTriggeredRef = useRef(false);

  const settings = useSettings();

  // Marketing popups state
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [showFOMO, setShowFOMO] = useState(false);
  const [spinWheelResult, setSpinWheelResult] = useState(null);
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

  // Show popups after a delay on page load, controlled by settings
  useEffect(() => {
    if (!isMounted) return;

    // Always show FOMO popups after mount
    const fomoTimer = setTimeout(() => {
      setShowFOMO(true);
    }, 1000);

    const hasSeenPopups = sessionStorage.getItem("cleanse_popups_seen");

    let spinTimer;
    if (!hasSeenPopups && settings.spinWheelEnabled) {
      spinTimer = setTimeout(() => {
        setShowSpinWheel(true);
      }, 3000);
    }

    return () => {
      clearTimeout(fomoTimer);
      if (spinTimer) clearTimeout(spinTimer);
    };
  }, [isMounted, settings.spinWheelEnabled]);

  const handleSpinComplete = (result) => {
    setSpinWheelResult(result);
  };

  const handleSpinClose = () => {
    setShowSpinWheel(false);
    // Show newsletter after spin wheel closes (if enabled)
    if (settings.newsletterPopupEnabled) {
      setTimeout(() => {
        setShowNewsletter(true);
      }, 500);
    }
  };

  const handleNewsletterClose = () => {
    setShowNewsletter(false);
    sessionStorage.setItem("cleanse_popups_seen", "true");
  };

  useGSAP(() => {
    if (!heroSectionRef.current) return;

    // Parallax effect on hero background only
    gsap.to(heroSectionRef.current, {
      backgroundPositionY: "50%",
      ease: "none",
      force3D: true,
      scrollTrigger: {
        trigger: heroSectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 0.3,
      },
    });
  }, { dependencies: [] });

  // Formulas section zoom-out animation
  useGSAP(() => {
    if (!formulasSectionRef.current || !centerImageRef.current) return;

    const section = formulasSectionRef.current;
    const header = section.querySelector('.formulas-header');
    const cards = section.querySelectorAll('.formula-box');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "center center",
        scrub: 0.3,
      },
    });

    // Zoom out center image from 3x to 1x
    tl.fromTo(centerImageRef.current,
      { scale: 3, y: -300, force3D: true },
      { scale: 1, y: 0, duration: 1, ease: "power2.out", force3D: true },
      0
    );

    // Fade in header
    tl.fromTo(header,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      0.5
    );

    // Fade in formula cards
    tl.fromTo(cards,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      0.6
    );

    // Leaf spread removed
  }, { dependencies: [] });

  return (
    <>
      {/* <Preloader onAnimationComplete={handlePreloaderComplete} /> */}

      {settings.promoBanner?.enabled !== false && (
        <div className="promo-bar">
          {(settings.promoBanner?.messages || ["100% NATURAL INGREDIENTS", `FREE SHIPPING ON ORDERS ABOVE ₹${settings.freeShippingThreshold}`, "AYURVEDIC & DOCTOR APPROVED"]).map((msg, i) => (
            <span key={i} className={i === 0 ? "promo-left" : i === 1 ? "promo-center" : "promo-right"}>{msg}</span>
          ))}
        </div>
      )}

      <section
        className="hero"
        ref={heroSectionRef}
        style={settings.cmsHero?.backgroundImage?.url ? { backgroundImage: `url(${settings.cmsHero.backgroundImage.url})` } : undefined}
      >
        <div className="container">
          <div className="hero-header">
            <Copy type="flicker" animateOnScroll={false} delay={isInitialLoad ? 5.5 : 0.65}>
              <h1>{settings.cmsHero?.title || "Cleanse Ayurveda"}</h1>
            </Copy>
            <Copy animateOnScroll={false} delay={isInitialLoad ? 5.7 : 0.85}>
              <p className="hero-subtitle">{settings.cmsHero?.subtitle || "Natural Skin Care for Mindful Living"}</p>
            </Copy>
            <div className="hero-btn-wrapper">
              <Link href={settings.cmsHero?.ctaLink || "/wardrobe"} className="hero-btn">{settings.cmsHero?.ctaText || "Shop Now"}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="formulas" ref={formulasSectionRef}>
        <div className="formulas-header">
          <p className="formulas-tagline">
            {settings.cmsFormula?.tagline || "We aren\u2019t merely selling bottles; we are delivering a clinically-backed path to purity."}
          </p>
        </div>

        <div className="formulas-content">
          {(settings.cmsFormula?.boxes || []).filter(b => b.position === "tl" || b.position === "tr").map((box) => (
            <div key={box.position} className={`formula-box formula-box-${box.position}`}>
              <div className="formula-box-icon">
                {FORMULA_ICONS[box.icon] || FORMULA_ICONS.leaf}
              </div>
              <h4 dangerouslySetInnerHTML={{ __html: (box.title || "").replace(/\n/g, "<br />") }} />
              <p>{box.description}</p>
            </div>
          ))}

          <div className="formulas-center">
            <div className="formulas-center-image" ref={centerImageRef}>
              <img src={settings.cmsFormula?.centerImage?.url || "/images/a.png"} alt="Natural skincare product" loading="lazy" />
            </div>
          </div>

          {(settings.cmsFormula?.boxes || []).filter(b => b.position === "bl" || b.position === "br").map((box) => (
            <div key={box.position} className={`formula-box formula-box-${box.position}`}>
              <div className="formula-box-icon">
                {FORMULA_ICONS[box.icon] || FORMULA_ICONS.leaf}
              </div>
              <h4 dangerouslySetInnerHTML={{ __html: (box.title || "").replace(/\n/g, "<br />") }} />
              <p>{box.description}</p>
            </div>
          ))}
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

      {/* <BeforeAfter /> */}

      <LatestLaunches />

      <section className="cta-section">
        <div className="cta-card">
          <img src={settings.cmsCta?.image?.url || "/images/cta.png"} alt={settings.cmsCta?.heading || "Ancient Secrets, Modern Radiance"} className="cta-image" />
          <div className="cta-content">
            <h2 className="cta-heading">{settings.cmsCta?.heading || "Ancient Secrets, Modern Radiance"}</h2>
            <p className="cta-desc">{settings.cmsCta?.description || "Infused with Turmeric and Rose Petals."}</p>
            <Link href={settings.cmsCta?.ctaLink || "/wardrobe"} className="cta-shop-btn">{settings.cmsCta?.ctaText || "SHOP NOW"}</Link>
          </div>
        </div>
      </section>

      {/* Marketing Components - Only render after client mount */}
      {isMounted && (
        <>
          <SpinWheel
            isOpen={showSpinWheel}
            onClose={handleSpinClose}
            onComplete={handleSpinComplete}
          />
          <NewsletterPopup
            isOpen={showNewsletter}
            onClose={handleNewsletterClose}
          />
          <FOMOPopup isActive={showFOMO} />
          <ChatSupport />
        </>
      )}
    </>
  );
}
