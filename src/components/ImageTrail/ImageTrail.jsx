"use client";
import "./ImageTrail.css";
import { useRef, useEffect } from "react";
import gsap from "gsap";

/* =============================================================================
   ImageTrail — a cursor-driven trail of "card" images.

   As the pointer moves across the PARENT section, images are revealed one by
   one at the cursor, staged like scattered cards (random rotation, rising
   z-index) and then fade away. Round-robins through the image pool.

   Drop it as the first child of a `position: relative; overflow: hidden`
   section. It listens on its parent element, renders a pointer-events:none
   overlay, and only runs for fine pointers (mouse) — and never when the user
   prefers reduced motion. So it is fully scoped to whatever section hosts it.
   ========================================================================== */

const DEFAULT_IMAGES = [
  "/face.jpg",
  "/skin.jpg",
  "/cream.jpg",
  "/serum.jpg",
  "/pink.jpg",
  "/hair.jpg",
  "/tall.jpg",
];

export default function ImageTrail({ images = DEFAULT_IMAGES, threshold = 90 }) {
  const rootRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Desktop pointer only, and respect reduced-motion.
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reduceMotion) return;

    // Latest cursor position in viewport (client) coords, kept up to date so we
    // can also deal cards while the user SCROLLS (cursor still, section moving).
    const pointer = { cx: 0, cy: 0, seen: false };
    // Section-relative coords of the last revealed card.
    const last = { x: 0, y: 0, primed: false };
    let index = 0;
    let z = 1;

    const reveal = (el, x, y) => {
      z += 1;
      const rotation = gsap.utils.random(-16, 16);
      gsap.killTweensOf(el);
      gsap.timeline()
        .set(el, {
          x,
          y,
          zIndex: z,
          rotation,
          scale: 0.5,
          opacity: 0,
          xPercent: -50,
          yPercent: -50,
        })
        .to(el, { scale: 1, opacity: 1, duration: 0.45, ease: "power3.out" })
        .to(
          el,
          {
            opacity: 0,
            scale: 0.82,
            y: y + gsap.utils.random(28, 64),
            duration: 0.7,
            ease: "power2.in",
          },
          "+=0.28"
        );
    };

    // Reveal based on the cursor's CURRENT position relative to the section.
    // Fires from both pointer movement and scroll; only while the cursor sits
    // within this section's bounds, so the effect stays fully scoped here.
    const tryReveal = () => {
      if (!pointer.seen) return;
      const rect = root.getBoundingClientRect();
      const x = pointer.cx - rect.left;
      const y = pointer.cy - rect.top;

      // Outside the section → reset so re-entry doesn't fire one huge jump.
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        last.primed = false;
        return;
      }
      if (!last.primed) {
        last.x = x;
        last.y = y;
        last.primed = true;
        return;
      }
      if (Math.hypot(x - last.x, y - last.y) < threshold) return;

      last.x = x;
      last.y = y;
      const el = itemsRef.current[index % itemsRef.current.length];
      index += 1;
      if (el) reveal(el, x, y);
    };

    const onMove = (e) => {
      pointer.cx = e.clientX;
      pointer.cy = e.clientY;
      pointer.seen = true;
      tryReveal();
    };
    const onScroll = () => tryReveal();

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      itemsRef.current.forEach((el) => el && gsap.killTweensOf(el));
    };
  }, [threshold]);

  return (
    <div className="image-trail" ref={rootRef} aria-hidden="true">
      {images.map((src, i) => (
        <div
          className="image-trail-card"
          key={`${src}-${i}`}
          ref={(el) => (itemsRef.current[i] = el)}
        >
          <img src={src} alt="" loading="eager" draggable="false" />
        </div>
      ))}
    </div>
  );
}
