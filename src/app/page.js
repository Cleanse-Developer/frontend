"use client";
import "./home.css";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

import { products } from "./wardrobe/products";
// import Preloader, { isInitialLoad } from "@/components/Preloader/Preloader";
const isInitialLoad = false;
import LeafSpread from "@/components/LeafSpread/LeafSpread";
import BrandIcon from "@/components/BrandIcon/BrandIcon";
import MarqueeBanner from "@/components/MarqueeBanner/MarqueeBanner";
import TextBlock from "@/components/TextBlock/TextBlock";
import PeelReveal from "@/components/PeelReveal/PeelReveal";
import CTA from "@/components/CTA/CTA";

import Copy from "@/components/Copy/Copy";
import Product from "@/components/Product/Product";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Index() {
  // const [loaderAnimating, setLoaderAnimating] = useState(isInitialLoad);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [leafAnimationReady, setLeafAnimationReady] = useState(false);
  const heroSectionRef = useRef(null);
  const formulasSectionRef = useRef(null);
  const formulasImageRef = useRef(null);
  const zoomCompletedRef = useRef(false);

  // const handlePreloaderComplete = () => {
  //   setLoaderAnimating(false);
  // };

  useEffect(() => {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    setFeaturedProducts(shuffled.slice(0, 4));
  }, []);

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

    // Zoom out effect on formulas center image - scroll-triggered, locks when complete
    if (formulasImageRef.current && formulasSectionRef.current && !zoomCompletedRef.current) {
      gsap.set(formulasImageRef.current, { scale: 2.5 });

      ScrollTrigger.create({
        trigger: formulasSectionRef.current,
        start: "top 60%",
        end: "top 10%",
        scrub: 1,
        onUpdate: (self) => {
          if (!zoomCompletedRef.current) {
            // Smoothly interpolate scale based on progress
            const scale = 2.5 - (self.progress * 1.5); // 2.5 to 1
            gsap.set(formulasImageRef.current, { scale: scale });
          }
        },
        onLeave: () => {
          if (!zoomCompletedRef.current) {
            zoomCompletedRef.current = true;
            gsap.set(formulasImageRef.current, { scale: 1 });
            setLeafAnimationReady(true);
          }
        },
      });
    }
  }, { dependencies: [] });

  return (
    <>
      {/* <Preloader onAnimationComplete={handlePreloaderComplete} /> */}

      <section className="hero" ref={heroSectionRef}>
        {/* <LeafSpread delay={0.5} count={25} /> */}
        <div className="container">
          <div className="hero-header">
            <Copy animateOnScroll={false} delay={isInitialLoad ? 5.5 : 0.65}>
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
          <Copy type="flicker">
            <h2 className="formulas-title">
              <span className="italic">Conscious Beauty,</span>
              <br />
              <strong>Uncompromised</strong>
            </h2>
          </Copy>
        </div>

        <div className="formulas-content">
          <div className="formulas-boxes formulas-boxes-left">
            <div className="formula-box">
              <div className="formula-box-icon">
                <BrandIcon />
              </div>
              <h4>Five ingredients.<br />Nothing more</h4>
              <p>Targeted essentials deliver real results: Repair, renew, calm, hydrate, protect. No irritation, no wasted money.</p>
            </div>
            <div className="formula-box">
              <div className="formula-box-icon">
                <BrandIcon />
              </div>
              <h4>Quality over<br />quantity</h4>
              <p>We use higher concentrations of effective ingredients, not cheap fillers, delivering what your skin needs, precisely where it needs it.</p>
            </div>
          </div>

          <div className="formulas-center">
            {leafAnimationReady && <LeafSpread count={25} triggerOnScroll={false} delay={0} />}
            <div className="formulas-center-image" ref={formulasImageRef}>
              <img src="/leaf.png" alt="Natural skincare product" />
            </div>
          </div>

          <div className="formulas-boxes formulas-boxes-right">
            <div className="formula-box">
              <div className="formula-box-icon">
                <BrandIcon />
              </div>
              <h4>Proven by<br />people like you</h4>
              <p>In real-world tests, 94% of users experienced dramatic, noticeable improvements in 28 days, leading to comments from friends</p>
            </div>
            <div className="formula-box">
              <div className="formula-box-icon">
                <BrandIcon />
              </div>
              <h4>The last skincare<br />you'll ever need</h4>
              <p>Essence uses five powerful, effective ingredients, chosen for proven results, not trends or irritants, to transform your skin.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <div className="featured-products-header">
            <Copy type="flicker">
              <p>Bestsellers</p>
            </Copy>
            <Copy>
              <h3>
                Featured <br /> Products
              </h3>
            </Copy>
          </div>
          <div className="featured-products-separator">
            <div className="featured-products-divider"></div>
            <div className="featured-products-labels">
              <Copy type="flicker">
                <p>Curated Selection</p>
              </Copy>
              <Copy type="flicker">
                <Link href="/wardrobe">View All Products</Link>
              </Copy>
            </div>
          </div>
          <div className="featured-products-list">
            {featuredProducts.map((product, index) => (
              <Product
                key={product.name}
                product={product}
                productIndex={products.indexOf(product) + 1}
                showAddToCart={true}
                imageSrc={`/p${index + 1}.png`}
              />
            ))}
          </div>
        </div>
      </section>

      <MarqueeBanner />

      <TextBlock />

      <PeelReveal />

      <CTA />
    </>
  );
}
