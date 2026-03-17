"use client";
import "./PeelReveal.css";
import { useRef, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";

import Copy from "../Copy/Copy";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const PeelReveal = () => {
  const settings = useSettings();
  const cmsPeel = settings.cmsPeelReveal || {};
  const headerTexts = cmsPeel.headerTexts || ["Ritual: Sacred", "Formula: Ayurveda_001"];
  const footerText = cmsPeel.footerText || "Source: Himalayan";
  const peelImage = cmsPeel.image?.url || "/category-hair.png";
  const peelHeading = cmsPeel.heading || "Ancient Secrets, Modern Radiance";
  const introTexts = cmsPeel.introTexts || ["Shop", "Now"];

  const peelRevealContainerRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const container = peelRevealContainerRef.current;
    if (!container) return;

    let timer = null;

    const ctx = gsap.context(() => {
      timer = setTimeout(() => {
        const section = container.querySelector(".peel-reveal");
        if (!section) return;

        const imageContainer = section.querySelector(
          ".peel-reveal-img-container"
        );
        const introTexts = Array.from(
          section.querySelectorAll(".peel-reveal-intro-text")
        );
        if (!imageContainer || !headerRef.current) return;

        const splitText = new SplitText(headerRef.current, { type: "words" });
        const words = splitText.words;
        gsap.set(words, { opacity: 0 });
        gsap.set(imageContainer, { scale: 0, borderRadius: "3rem", force3D: true });

        const moveDistance = window.innerWidth * 0.55;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${window.innerHeight * 4}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.5,
          },
        });

        // Scale from 0 to 1 over full duration
        tl.to(imageContainer, {
          scale: 1, duration: 1, ease: "none", force3D: true,
        }, 0);

        // Border radius: 3rem at 0-25%, then 3rem->0rem from 25%-90%
        tl.to(imageContainer, {
          borderRadius: "0rem", duration: 0.65, ease: "none",
        }, 0.25);

        // Intro texts slide out (0 to 90%)
        tl.to(introTexts[0], {
          x: -moveDistance, duration: 0.9, ease: "none", force3D: true,
        }, 0);
        tl.to(introTexts[1], {
          x: moveDistance, duration: 0.9, ease: "none", force3D: true,
        }, 0);

        // Word opacity stagger (60% to 90%)
        const totalWords = words.length;
        words.forEach((word, i) => {
          const wordStart = 0.6 + (i / totalWords) * 0.3;
          const wordDur = 0.3 / totalWords;
          tl.to(word, {
            opacity: 1, duration: wordDur, ease: "none",
          }, wordStart);
        });
      }, 500);
    }, container);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      ctx.revert();
    };
  }, []);

  return (
    <div className="peel-reveal-container" ref={peelRevealContainerRef}>
      <section className="peel-reveal">
        <div className="section-header">
          {headerTexts.map((text, i) => (
            <Copy key={i} type="flicker">
              <p>{text}</p>
            </Copy>
          ))}
        </div>
        <div className="section-footer">
          <Copy type="flicker">
            <p>{footerText}</p>
          </Copy>
        </div>
        <div className="peel-reveal-img-container">
          <div className="pr-img">
            <img src={peelImage} alt="Product" loading="lazy" />
          </div>
          <div className="peel-reveal-header">
            <h1 ref={headerRef}>
              {peelHeading.split(/,\s*/).reduce((acc, part, i, arr) => {
                if (i > 0) acc.push(<br key={`br-${i}`} />);
                acc.push(part + (i < arr.length - 1 ? "," : ""));
                return acc;
              }, [])}
            </h1>
          </div>
        </div>
        <div className="peel-reveal-intro-text-container">
          {introTexts.map((text, i) => (
            <div key={i} className="peel-reveal-intro-text">
              <h1>{text}</h1>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PeelReveal;
