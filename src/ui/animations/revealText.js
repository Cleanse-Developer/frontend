"use client";
/**
 * Text reveal helpers — extracted from components/Copy (flicker) and the Menu
 * scramble effect. Both rely on GSAP SplitText.
 */
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

let registered = false;
function register() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(SplitText);
  registered = true;
}

/**
 * flickerReveal — split into words+chars and flicker each char in (random order).
 * Mirrors components/Copy.jsx `type="flicker"`.
 * Returns { animation, splits } so callers can revert the SplitText on cleanup.
 */
export function flickerReveal(elements, options = {}) {
  register();
  const { delay = 0, paused = false } = options;
  const els = Array.isArray(elements) ? elements : [elements];
  const splits = [];
  const allChars = [];

  els.forEach((el) => {
    if (!el) return;
    const split = SplitText.create(el, { type: "words,chars" });
    splits.push(split);
    allChars.push(...split.chars);
  });

  gsap.set(allChars, { opacity: 0 });
  const animation = gsap.to(allChars, {
    duration: 0.05,
    opacity: 1,
    ease: "power2.inOut",
    delay,
    stagger: { amount: 0.5, each: 0.1, from: "random" },
    paused,
  });

  return { animation, splits };
}

/**
 * scramble — cycle random glyphs on each character node before settling.
 * Mirrors the Menu.jsx scrambleText effect. Pass an array of char DOM nodes.
 */
export function scramble(chars, duration = 0.4) {
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  chars.forEach((char) => {
    const original = char.textContent;
    let iterations = 0;
    const maxIterations = Math.floor(Math.random() * 6) + 3;
    gsap.set(char, { opacity: 1 });

    const interval = setInterval(() => {
      char.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      iterations += 1;
      if (iterations >= maxIterations) {
        clearInterval(interval);
        char.textContent = original;
      }
    }, 25);

    setTimeout(() => {
      clearInterval(interval);
      char.textContent = original;
    }, duration * 1000);
  });
}

export default flickerReveal;
