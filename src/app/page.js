"use client";
import "./home.css";
import { useRef } from "react";
import Link from "next/link";

// import Preloader, { isInitialLoad } from "@/components/Preloader/Preloader";
const isInitialLoad = false;
import LeafSpread from "@/components/LeafSpread/LeafSpread";
import MarqueeBanner from "@/components/MarqueeBanner/MarqueeBanner";
// import TextBlock from "@/components/TextBlock/TextBlock";
import PeelReveal from "@/components/PeelReveal/PeelReveal";
// import CTA from "@/components/CTA/CTA";
import FeaturedSection from "@/components/FeaturedSection/FeaturedSection";
import Testimonials from "@/components/Testimonials/Testimonials";
import HoverWord from "@/components/HoverWord/HoverWord";
import "@/components/HoverWord/HoverWord.css";
import ShopByProduct from "@/components/ShopByProduct/ShopByProduct";
import BlogSection from "@/components/BlogSection/BlogSection";

import Copy from "@/components/Copy/Copy";

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

  useGSAP(() => {
    if (!heroSectionRef.current) return;

    // Parallax effect on hero background only
    gsap.to(heroSectionRef.current, {
      backgroundPositionY: "50%",
      ease: "none",
      scrollTrigger: {
        trigger: heroSectionRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }, { dependencies: [] });

  // Formulas section zoom-out animation (no pin, zooms as you scroll into view)
  useGSAP(() => {
    if (!formulasSectionRef.current || !centerImageRef.current) return;

    const section = formulasSectionRef.current;
    const centerContainer = section.querySelector('.formulas-center');
    const header = section.querySelector('.formulas-header');
    const boxes = section.querySelectorAll('.formulas-boxes');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "center center",
        scrub: 1,
        onUpdate: (self) => {
          if (self.progress >= 0.8) {
            if (!leafTriggeredRef.current) {
              leafTriggeredRef.current = true;
              leafSpreadRef.current?.trigger();
            }
            section.style.overflow = 'visible';
            centerContainer.style.zIndex = '2';
          } else {
            section.style.overflow = 'hidden';
            centerContainer.style.zIndex = '20';
          }
        },
      },
    });

    // Zoom out center image from 3x to 1x
    tl.fromTo(centerImageRef.current,
      { scale: 3 },
      { scale: 1, duration: 1, ease: "power2.out" },
      0
    );

    // Fade in header
    tl.fromTo(header,
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      0.5
    );

    // Fade in formula boxes
    tl.fromTo(boxes,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      0.6
    );
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
        <div className="section-footer">
          <Copy
            type="flicker"
            delay={isInitialLoad ? 7.5 : 0.65}
            animateOnScroll={false}
          >
            <p>Pure Ayurveda</p>
          </Copy>
          <Copy
            type="flicker"
            delay={isInitialLoad ? 7.5 : 0.65}
            animateOnScroll={false}
          >
            <p>Est. 2024</p>
          </Copy>
        </div>
      </section>

      <section className="formulas" ref={formulasSectionRef}>
        <div className="formulas-header">
          <p className="formulas-tagline">
            We are dedicated to{" "}
            <HoverWord
              word="elevating"
              imageSrc="/p1.png"
              imageAlt="Elevating standards"
            />{" "}
            standards in{" "}
            <HoverWord
              word="beauty"
              imageSrc="/p2.png"
              imageAlt="Beauty products"
            />{" "}
            and care, creating confidence and timeless{" "}
            <HoverWord
              word="elegance"
              imageSrc="/p3.png"
              imageAlt="Timeless elegance"
            />{" "}
            for everyone.
          </p>
        </div>

        <div className="formulas-content">
          <div className="formulas-boxes formulas-boxes-left">
            <div className="formula-box">
              <div className="formula-box-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L12 6M12 6C9 6 6 9 6 13C6 17 9 22 12 22C15 22 18 17 18 13C18 9 15 6 12 6Z" />
                  <path d="M12 6C12 6 10 8 10 11" />
                  <path d="M12 6C12 6 14 8 14 11" />
                </svg>
              </div>
              <h4>Five ingredients.<br />Nothing more</h4>
              <p>Targeted essentials deliver real results: Repair, renew, calm, hydrate, protect. No irritation, no wasted money.</p>
            </div>
            <div className="formula-box">
              <div className="formula-box-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                  <path d="M2 17L12 22L22 17" />
                  <path d="M2 12L12 17L22 12" />
                </svg>
              </div>
              <h4>Quality over<br />quantity</h4>
              <p>We use higher concentrations of effective ingredients, not cheap fillers, delivering what your skin needs, precisely where it needs it.</p>
            </div>
          </div>

          <div className="formulas-center">
            <LeafSpread ref={leafSpreadRef} count={25} />
            <div className="formulas-center-image" ref={centerImageRef}>
              <img src="/leaf.png" alt="Natural skincare product" />
            </div>
          </div>

          <div className="formulas-boxes formulas-boxes-right">
            <div className="formula-box">
              <div className="formula-box-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" />
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" />
                </svg>
              </div>
              <h4>Proven by<br />people like you</h4>
              <p>In real-world tests, 94% of users experienced dramatic, noticeable improvements in 28 days, leading to comments from friends</p>
            </div>
            <div className="formula-box">
              <div className="formula-box-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <h4>The last skincare<br />you'll ever need</h4>
              <p>Essence uses five powerful, effective ingredients, chosen for proven results, not trends or irritants, to transform your skin.</p>
            </div>
          </div>
        </div>
      </section>

      <FeaturedSection />

      <ShopByProduct />

      <BlogSection />

      {/* <CTA /> */}

      <MarqueeBanner />

      <Testimonials />

      <PeelReveal />
    </>
  );
}
