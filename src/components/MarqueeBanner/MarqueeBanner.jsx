"use client";
import "./MarqueeBanner.css";
import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { useSettings } from "@/context/SettingsContext";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// useLayoutEffect on the client (paint the carousel before the browser shows a
// frame), useEffect on the server to avoid the SSR warning.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const DEFAULT_REELS = [
  { id: 1, title: "Morning Ritual", subtitle: "Golden Hour Glow", video: "/videos/reel1.mp4", poster: "/images/REEL 1.png", position: "left-top", reelUrl: "https://www.instagram.com/reel/C_BRnIQyDWs/" },
  { id: 2, title: "Sacred Rituals", subtitle: "Embrace Your Natural Glow", video: "/videos/reel2.mp4", poster: "/images/REEL 2.png", position: "center", reelUrl: "https://www.instagram.com/reel/C3hdGOWphsG/" },
  { id: 3, title: "Evening Care", subtitle: "Restore & Rejuvenate", video: "/videos/reel3.mp4", poster: "/images/REEL 3.png", position: "right-bottom", reelUrl: "https://www.instagram.com/reel/C5msAMFMHx-/" },
];

const DEFAULT_POSTERS = { "left-top": "/images/REEL 1.png", center: "/images/REEL 2.png", "right-bottom": "/images/REEL 3.png" };

const MarqueeBanner = () => {
  const settings = useSettings();
  const cmsMarquee = settings.cmsMarquee || {};
  const marqueeLines = cmsMarquee.marqueeLines || ["Ancient wisdom meets modern beauty", "Pure ingredients for radiant skin", "Timeless rituals for glowing skin"];
  const reelsData = (cmsMarquee.reels?.length > 0) ? cmsMarquee.reels.map((r, i) => ({
    id: i + 1,
    title: r.title,
    subtitle: r.subtitle,
    video: r.video?.url || DEFAULT_REELS[i]?.video,
    poster: DEFAULT_REELS[i]?.poster || r.posterImage?.url || DEFAULT_POSTERS[r.position],
    position: r.position,
    reelUrl: r.reelUrl || DEFAULT_REELS[i]?.reelUrl,
  })) : DEFAULT_REELS;

  const marqueeBannerRef = useRef(null);
  const marquee1Ref = useRef(null);
  const marquee2Ref = useRef(null);
  const marquee3Ref = useRef(null);

  // --- Mobile: stacked deck that taps open into a momentum carousel ---------
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [entering, setEntering] = useState(false); // brief eased window for the open morph
  const [activeIndex, setActiveIndex] = useState(0); // centre card, for the dots
  const N = reelsData.length;

  const cardRefs = useRef([]);
  const posRef = useRef(0);      // continuous scroll position, in card units
  const velRef = useRef(0);      // velocity, card units per frame
  const targetRef = useRef(null); // dot-tap easing target (or null)
  const rafRef = useRef(null);
  const draggingRef = useRef(false);
  const pausedRef = useRef(false);
  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const lastIdxRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 480px)");
    const update = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) { setExpanded(false); setActiveIndex(0); }
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Position every card from the continuous scroll position. Imperative so the
  // momentum stays buttery (no React re-render per frame). A card that loops
  // past the half-way point wraps to the far edge — off-screen, so it's seamless.
  const paintCards = () => {
    for (let i = 0; i < N; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      let r = (((i - posRef.current) % N) + N) % N;
      if (r > N / 2) r -= N;
      const ar = Math.min(Math.abs(r), 1);
      el.style.transform = `translate(calc(-50% + ${r * 70}%), -50%) scale(${1 - ar * 0.24})`;
      el.style.zIndex = String(30 - Math.round(Math.abs(r) * 10));
    }
  };

  // Animation loop while open: drag sets position directly; a flick decays with
  // friction (carrying several cards); a dot-tap eases to a target; otherwise it
  // drifts gently right-to-left. Hold pauses the drift.
  useEffect(() => {
    if (!isMobile || !expanded) return;
    posRef.current = 0;
    velRef.current = 0;
    targetRef.current = null;
    const FRICTION = 0.92, MINV = 0.004;
    const loop = () => {
      if (!draggingRef.current) {
        if (Math.abs(velRef.current) > MINV) {
          // flick momentum — glides smoothly across several cards
          posRef.current += velRef.current;
          velRef.current *= FRICTION;
          if (Math.abs(velRef.current) <= MINV) targetRef.current = Math.round(posRef.current);
        } else if (targetRef.current !== null) {
          // ease to a card (settle after a flick, a dot tap, or an auto-step)
          let diff = ((targetRef.current - posRef.current) % N + N) % N;
          if (diff > N / 2) diff -= N;
          if (Math.abs(diff) < 0.001) { posRef.current = targetRef.current; targetRef.current = null; }
          else posRef.current += diff * 0.16;
        }
      }
      posRef.current = ((posRef.current % N) + N) % N;
      paintCards();
      const idx = Math.round(posRef.current) % N;
      if (idx !== lastIdxRef.current) { lastIdxRef.current = idx; setActiveIndex(idx); }
      rafRef.current = requestAnimationFrame(loop);
    };
    paintCards();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isMobile, expanded, N]);

  // Paint the spread layout synchronously on expand — before the browser shows the
  // centred fallback frame — which kills the one-frame "snap to centre" jerk.
  useIsoLayoutEffect(() => {
    if (!isMobile || !expanded) return;
    posRef.current = 0;
    paintCards();
  }, [isMobile, expanded]);

  // Enable a one-shot eased transition for the open morph, then remove it so the
  // drag stays 1:1 responsive.
  useEffect(() => {
    if (!expanded) { setEntering(false); return; }
    setEntering(true);
    const t = setTimeout(() => setEntering(false), 600);
    return () => clearTimeout(t);
  }, [expanded]);

  const STEP_PX = 150; // finger px ~ one card

  const onCardTouchStart = (e) => {
    if (!expanded) return;
    draggingRef.current = true;
    pausedRef.current = true;
    velRef.current = 0;
    targetRef.current = null;
    startXRef.current = lastXRef.current = e.touches[0].clientX;
    startPosRef.current = posRef.current;
    lastTRef.current = performance.now();
  };
  const onCardTouchMove = (e) => {
    if (!expanded || !draggingRef.current) return;
    const x = e.touches[0].clientX;
    posRef.current = startPosRef.current - (x - startXRef.current) / STEP_PX;
    const now = performance.now();
    const dt = now - lastTRef.current;
    if (dt > 0) velRef.current = (-(x - lastXRef.current) / STEP_PX / dt) * 16; // per-frame
    lastXRef.current = x;
    lastTRef.current = now;
    paintCards();
  };
  const onCardTouchEnd = () => {
    if (!expanded) return;
    draggingRef.current = false;
    pausedRef.current = false;
    velRef.current = Math.max(-0.55, Math.min(0.55, velRef.current)); // cap the flick
  };

  // Open the reel on Instagram in a new tab. On mobile, the first tap expands
  // the stacked deck (matches the "Tap to view" hint); a tap on an expanded
  // card opens the reel. We deliberately link out rather than embedding so no
  // Instagram chrome/iframe renders over our UI and nothing autoplays.
  const openReel = (reel) => {
    if (isMobile && !expanded) {
      setExpanded(true);
      return;
    }
    if (reel.reelUrl) {
      window.open(reel.reelUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Stacked-deck transform (collapsed state, React-managed).
  const getStackedStyle = (index) => ({
    transform: `translate(-50%, -50%) translateX(${index * 6}%) translateY(${index * 10}px) rotate(${index * 4}deg) scale(${1 - index * 0.05})`,
    zIndex: 30 - index * 10,
  });

  useGSAP(
    () => {
      // Marquee scroll animation using timeline (GPU-optimized)
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: marqueeBannerRef.current,
          start: "top bottom",
          end: "150% top",
          scrub: 0.3,
        },
      });

      // On mobile keep the three lines nearly aligned (small, opposite drift);
      // desktop keeps its bold staggered sweep.
      const m = isMobile
        ? [[6, -16], [-11, 11], [9, -14]]
        : [[8, -60], [-42, 42], [25, -42]];

      tl.fromTo(marquee1Ref.current,
        { xPercent: m[0][0], force3D: true },
        { xPercent: m[0][1], duration: 1, ease: "none", force3D: true },
        0
      );

      tl.fromTo(marquee2Ref.current,
        { xPercent: m[1][0], force3D: true },
        { xPercent: m[1][1], duration: 1, ease: "none", force3D: true },
        0
      );

      if (marquee3Ref.current) {
        tl.fromTo(marquee3Ref.current,
          { xPercent: m[2][0], force3D: true },
          { xPercent: m[2][1], duration: 1, ease: "none", force3D: true },
          0
        );
      }
    },
    { scope: marqueeBannerRef, dependencies: [isMobile] }
  );

  return (
    <section className="marquee-banner" ref={marqueeBannerRef}>
      <div className="marquees">
        {marqueeLines[0] && (
          <div className="marquee-header marquee-header-1" ref={marquee1Ref}>
            <h1>{marqueeLines[0]}</h1>
          </div>
        )}
        {marqueeLines[1] && (
          <div className="marquee-header marquee-header-2" ref={marquee2Ref}>
            <h1>{marqueeLines[1]}</h1>
          </div>
        )}
        {marqueeLines[2] && (
          <div className="marquee-header marquee-header-3" ref={marquee3Ref}>
            <h1>{marqueeLines[2]}</h1>
          </div>
        )}
      </div>

      <div className="reels-header-top">
        <h2 className="reels-tagline">{cmsMarquee.sectionHeader || "VIEW TRENDING"}</h2>
      </div>

      <div
        className={`reels-container ${isMobile ? (expanded ? `is-carousel${entering ? " is-entering" : ""}` : "is-stacked") : ""}`}
        onClick={() => { if (isMobile && !expanded) setExpanded(true); }}
      >
        {reelsData.map((reel, i) => (
          <div
            key={reel.id}
            ref={(el) => { cardRefs.current[i] = el; }}
            className={`reel-card reel-card-${reel.position}`}
            style={{
              ...(isMobile && !expanded ? getStackedStyle(i) : {}),
              cursor: reel.reelUrl ? "pointer" : "default",
            }}
            onClick={() => openReel(reel)}
            onTouchStart={onCardTouchStart}
            onTouchMove={onCardTouchMove}
            onTouchEnd={onCardTouchEnd}
          >
            <div className="reel-card-inner">
              <div className="reel-media">
                <img
                  src={reel.poster}
                  alt={reel.title}
                  className="reel-poster"
                  loading="lazy"
                />
                <div className="reel-overlay"></div>
              </div>

              <div className="reel-content">
                <span className="reel-badge">Reel</span>
                <div className="reel-info">
                  <p className="reel-subtitle">{reel.subtitle}</p>
                  <h4 className="reel-title">{reel.title}</h4>
                </div>
                <div className="reel-play">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36a1 1 0 00-1.5.86z" fill="currentColor"/>
                  </svg>
                </div>
              </div>

              <div className="reel-shine"></div>
            </div>
          </div>
        ))}
      </div>

      {isMobile && (
        <div className="reel-mobile-controls">
          {!expanded ? (
            <span className="reel-stack-hint">Tap to view</span>
          ) : (
            <div className="reel-dots">
              {reelsData.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={`reel-dot ${i === activeIndex ? "active" : ""}`}
                  aria-label={`Go to reel ${i + 1}`}
                  onClick={() => { targetRef.current = i; }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="reels-footer">
        <a
          href={cmsMarquee.instagramUrl || "https://www.instagram.com/cleanseayurveda/"}
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-handle"
        >
          <svg viewBox="0 0 24 24" fill="none" className="instagram-icon">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" fill="currentColor"/>
          </svg>
          <span>{cmsMarquee.instagramHandle || "@CleanseAyurveda"}</span>
        </a>
      </div>
    </section>
  );
};

export default MarqueeBanner;
