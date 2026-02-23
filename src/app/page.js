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
import FeaturedSection, { WhySkinSection, ShopByCategory, BuildYourRitual, LatestLaunches } from "@/components/FeaturedSection/FeaturedSection";
import Testimonials from "@/components/Testimonials/Testimonials";
import HoverWord from "@/components/HoverWord/HoverWord";
import "@/components/HoverWord/HoverWord.css";
import ShopByProduct from "@/components/ShopByProduct/ShopByProduct";
import BlogSection from "@/components/BlogSection/BlogSection";

import Copy from "@/components/Copy/Copy";

import SpinWheel from "@/components/SpinWheel/SpinWheel";
import NewsletterPopup from "@/components/NewsletterPopup/NewsletterPopup";
import FOMOPopup from "@/components/FOMOPopup/FOMOPopup";
import ChatSupport from "@/components/ChatSupport/ChatSupport";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Index() {
  const heroSectionRef = useRef(null);
  const formulasSectionRef = useRef(null);
  const centerImageRef = useRef(null);
  const leafSpreadRef = useRef(null);
  const leafTriggeredRef = useRef(false);

  // Marketing popups state
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [showFOMO, setShowFOMO] = useState(false);
  const [spinWheelResult, setSpinWheelResult] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show spin wheel after a delay on page load
  useEffect(() => {
    if (!isMounted) return;

    // Always show FOMO popups after mount
    const fomoTimer = setTimeout(() => {
      setShowFOMO(true);
    }, 1000);

    // Show spin wheel after 3 seconds
    sessionStorage.removeItem("cleanse_popups_seen"); // Reset for testing
    const hasSeenPopups = false; // Always show for now

    let spinTimer;
    if (!hasSeenPopups) {
      spinTimer = setTimeout(() => {
        setShowSpinWheel(true);
      }, 3000);
    }

    return () => {
      clearTimeout(fomoTimer);
      if (spinTimer) clearTimeout(spinTimer);
    };
  }, [isMounted]);

  const handleSpinComplete = (result) => {
    setSpinWheelResult(result);
  };

  const handleSpinClose = () => {
    setShowSpinWheel(false);
    // Show newsletter after spin wheel closes
    setTimeout(() => {
      setShowNewsletter(true);
    }, 500);
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

      <div className="promo-bar">
        <span className="promo-left">100% NATURAL INGREDIENTS</span>
        <span className="promo-center">FREE SHIPPING ON ORDERS ABOVE ₹1200</span>
        <span className="promo-right">AYURVEDIC & DOCTOR APPROVED</span>
      </div>

      <section className="hero" ref={heroSectionRef}>
        {/* <LeafSpread delay={0.5} count={25} /> */}
        <div className="container">
          <div className="hero-header">
            <Copy type="flicker" animateOnScroll={false} delay={isInitialLoad ? 5.5 : 0.65}>
              <h1>Cleanse Ayurveda</h1>
            </Copy>
            <Copy animateOnScroll={false} delay={isInitialLoad ? 5.7 : 0.85}>
              <p className="hero-subtitle">Natural Skin Care for Mindful Living</p>
            </Copy>
            <div className="hero-btn-wrapper">
              <Link href="/wardrobe" className="hero-btn">Shop Now</Link>
            </div>
          </div>
        </div>
{/* <div className="hero-img" ref={heroImgRef}>
          <img src="/hero.png" alt="" />
        </div> */}
      </section>

      <section className="formulas" ref={formulasSectionRef}>
        <div className="formulas-header">
          <p className="formulas-tagline">
            We aren&apos;t merely selling bottles; we are delivering a clinically-backed path to purity.
          </p>
        </div>

        <div className="formulas-content">
          <div className="formula-box formula-box-tl">
            <div className="formula-box-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" />
                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" />
              </svg>
            </div>
            <h4>Proven by<br />people like you</h4>
            <p>In real-world tests, 94% of users saw noticeable skin improvements within 28 days.</p>
          </div>

          <div className="formula-box formula-box-tr">
            <div className="formula-box-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L12 6M12 6C9 6 6 9 6 13C6 17 9 22 12 22C15 22 18 17 18 13C18 9 15 6 12 6Z" />
                <path d="M12 6C12 6 10 8 10 11" />
                <path d="M12 6C12 6 14 8 14 11" />
              </svg>
            </div>
            <h4>Proven by<br />people like you</h4>
            <p>In real-world tests, 94% of users saw noticeable skin improvements within 28 days.</p>
          </div>

          <div className="formulas-center">
            <div className="formulas-center-image" ref={centerImageRef}>
              <img src="/images/a.png" alt="Natural skincare product" loading="lazy" />
            </div>
          </div>

          <div className="formula-box formula-box-bl">
            <div className="formula-box-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L12 6M12 6C9 6 6 9 6 13C6 17 9 22 12 22C15 22 18 17 18 13C18 9 15 6 12 6Z" />
                <path d="M12 6C12 6 10 8 10 11" />
                <path d="M12 6C12 6 14 8 14 11" />
              </svg>
            </div>
            <h4>Proven by<br />people like you</h4>
            <p>In real-world tests, 94% of users saw noticeable skin improvements within 28 days.</p>
          </div>

          <div className="formula-box formula-box-br">
            <div className="formula-box-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <h4>Proven by<br />people like you</h4>
            <p>In real-world tests, 94% of users saw noticeable skin improvements within 28 days.</p>
          </div>
        </div>
      </section>

      <FeaturedSection />

      <MarqueeBanner />

      <WhySkinSection />

      <ShopByCategory />

      <BuildYourRitual />

      <PeelReveal />

      {/* <ShopByProduct /> */}

      <BlogSection />

      {/* <CTA /> */}

      <Testimonials />

      <LatestLaunches />

      <section className="cta-section">
        <div className="cta-card">
          <img src="/images/cta.png" alt="Ancient Secrets, Modern Radiance" className="cta-image" />
          <div className="cta-content">
            <h2 className="cta-heading">Ancient Secrets, Modern Radiance</h2>
            <p className="cta-desc">Infused with Turmeric and Rose Petals.</p>
            <Link href="/wardrobe" className="cta-shop-btn">SHOP NOW</Link>
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
