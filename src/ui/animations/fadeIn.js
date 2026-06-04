"use client";
/**
 * fadeInUp — scroll-triggered rise + fade entrance.
 *
 * Verbatim config from RitualBanner (.rhr-card) and BeforeAfter cards:
 * fromTo y:56→0, opacity:0→1, stagger ~0.12, ease power3.out, start "top 85%".
 * Use inside useGSAP/useEffect; returns the tween for cleanup.
 */
import gsap from "gsap";
import { registerScrollTrigger } from "./scrollTrigger";

export function fadeInUp(targets, options = {}) {
  registerScrollTrigger();
  const {
    y = 56,
    duration = 0.9,
    ease = "power3.out",
    stagger = 0.12,
    start = "top 85%",
    trigger,
    once = true,
  } = options;

  return gsap.fromTo(
    targets,
    { y, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration,
      ease,
      stagger,
      force3D: true,
      scrollTrigger: {
        trigger: trigger || targets,
        start,
        toggleActions: once ? "play none none none" : "play none none reverse",
      },
    }
  );
}

export default fadeInUp;
