"use client";
/**
 * peelReveal — the pinned scale/border-radius/headline timeline used by
 * components/PeelReveal. Extracted verbatim so the same effect can be reused.
 *
 * Provide the section + the inner image container + the headline element +
 * the two intro-text elements. Returns { timeline, split } for cleanup.
 *
 *   const { timeline, split } = peelReveal({
 *     section, imageContainer, headerEl, introEls: [shopEl, nowEl],
 *   });
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

let registered = false;
function register() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
}

export function peelReveal({ section, imageContainer, headerEl, introEls = [], scrub = 0.5 }) {
  register();
  if (!section || !imageContainer || !headerEl) return null;

  const split = new SplitText(headerEl, { type: "words" });
  const words = split.words;
  gsap.set(words, { opacity: 0 });
  gsap.set(imageContainer, { scale: 0, borderRadius: "3rem", force3D: true });

  const moveDistance = window.innerWidth * 0.55;

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${window.innerHeight * 4}`,
      pin: true,
      pinSpacing: true,
      scrub,
    },
  });

  timeline.to(imageContainer, { scale: 1, duration: 1, ease: "none", force3D: true }, 0);
  timeline.to(imageContainer, { borderRadius: "0rem", duration: 0.65, ease: "none" }, 0.25);

  if (introEls[0]) timeline.to(introEls[0], { x: -moveDistance, duration: 0.9, ease: "none", force3D: true }, 0);
  if (introEls[1]) timeline.to(introEls[1], { x: moveDistance, duration: 0.9, ease: "none", force3D: true }, 0);

  const total = words.length;
  words.forEach((word, i) => {
    const wordStart = 0.6 + (i / total) * 0.3;
    const wordDur = 0.3 / total;
    timeline.to(word, { opacity: 1, duration: wordDur, ease: "none" }, wordStart);
  });

  return { timeline, split };
}

export default peelReveal;
