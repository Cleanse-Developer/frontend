"use client";
/**
 * yParallax — scroll-scrubbed vertical parallax.
 *
 * Verbatim config from BlogSection: fromTo yPercent -10 → 10, ease none,
 * scrub 0.3, start "top bottom" / end "bottom top". Returns the tween.
 */
import gsap from "gsap";
import { registerScrollTrigger } from "./scrollTrigger";

export function yParallax(el, options = {}) {
  registerScrollTrigger();
  const {
    from = -10,
    to = 10,
    scrub = 0.3,
    trigger,
    start = "top bottom",
    end = "bottom top",
  } = options;

  return gsap.fromTo(
    el,
    { yPercent: from, force3D: true },
    {
      yPercent: to,
      ease: "none",
      force3D: true,
      scrollTrigger: { trigger: trigger || el, start, end, scrub },
    }
  );
}

export default yParallax;
