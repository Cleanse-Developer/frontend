"use client";
/**
 * ScrollTrigger helpers — shared GSAP plugin registration + refresh utility.
 *
 * Extracted from the repeated `gsap.registerPlugin(ScrollTrigger)` calls and the
 * `requestAnimationFrame(() => ScrollTrigger.refresh())` pattern used in
 * FeaturedSection / page.js after async data/layout settles.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Register ScrollTrigger once (client-only, idempotent). */
export function registerScrollTrigger() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

/** Recompute all ScrollTrigger positions on the next frame (after layout shifts). */
export function refreshSoon() {
  if (typeof window === "undefined") return undefined;
  const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
  return () => cancelAnimationFrame(raf);
}

export { gsap, ScrollTrigger };
