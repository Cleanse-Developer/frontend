"use client";
import "./MarqueeBanner.css";
import { useRef, useState, useEffect } from "react";
import { useSettings } from "@/context/SettingsContext";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// video: null — placeholders had local /videos paths that don't exist; a reel is
// only treated as playable when the CMS provides a re-hosted video URL.
const DEFAULT_REELS = [
  { id: 1, title: "Morning Ritual", subtitle: "Golden Hour Glow", video: null, poster: "/images/REEL 1.png", position: "left-top", reelUrl: "https://www.instagram.com/reel/C_BRnIQyDWs/" },
  { id: 2, title: "Sacred Rituals", subtitle: "Embrace Your Natural Glow", video: null, poster: "/images/REEL 2.png", position: "center", reelUrl: "https://www.instagram.com/reel/C3hdGOWphsG/" },
  { id: 3, title: "Evening Care", subtitle: "Restore & Rejuvenate", video: null, poster: "/images/REEL 3.png", position: "right-bottom", reelUrl: "https://www.instagram.com/reel/C5msAMFMHx-/" },
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
    video: r.video?.url || null,
    poster: r.posterImage?.url || DEFAULT_POSTERS[r.position] || DEFAULT_REELS[i]?.poster,
    position: r.position,
    reelUrl: r.reelUrl || DEFAULT_REELS[i]?.reelUrl,
  })) : DEFAULT_REELS;

  const marqueeBannerRef = useRef(null);
  const marquee1Ref = useRef(null);
  const marquee2Ref = useRef(null);
  const marquee3Ref = useRef(null);

  // --- Mobile: a swipeable stacked deck --------------------------------------
  // The cards stay fanned as a deck; swiping throws the front card away and
  // brings the next forward. No tap-to-expand step — the deck is the carousel.
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0); // front card, for the dots
  const N = reelsData.length;

  const cardRefs = useRef([]);
  const posRef = useRef(0);       // continuous deck position, in card units
  const velRef = useRef(0);       // velocity, card units per frame
  const targetRef = useRef(null); // dot-tap easing target (or null)
  const rafRef = useRef(null);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const lastIdxRef = useRef(0);
  const movedRef = useRef(false); // distinguishes a swipe from a tap
  const dirRef = useRef(-1);      // which side the transitioning card sits on

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 480px)");
    const update = () => {
      setIsMobile(mq.matches);
      if (!mq.matches) setActiveIndex(0);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Where a card sits at a given depth: 0 is the front card, N-1 the back one.
  // Depth is fractional during a swipe, so the whole deck shuffles continuously.
  const stackAt = (d) => ({
    x: d * 6,          // %  of card width
    y: d * 10,         // px
    rot: d * 4,        // deg
    scale: 1 - d * 0.05,
  });

  // Paint the deck from the continuous position. Imperative so the drag stays
  // 1:1 with the finger (no React re-render per frame).
  //
  // The swiped card doesn't fly away — it swings out to the side the finger is
  // going, dips down, and tucks back in at the BOTTOM of the stack, one below
  // the others. That's a single continuous path: it rides the normal stack
  // positions from depth 0 to depth N-1 while an arc adds the sideways swing and
  // the dip on top. Because the arc is a sine, it is exactly 0 at both ends, so
  // the card enters and leaves the transition seamlessly — no snap.
  const paintCards = () => {
    const pos = posRef.current;
    for (let i = 0; i < N; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const u = (((i - pos) % N) + N) % N;
      if (u > N - 1) {
        // The card going under: t runs 0 (still the front card) → 1 (settled at
        // the back of the stack).
        const t = N - u;
        const dir = dirRef.current;
        const arc = Math.sin(t * Math.PI); // 0 → 1 → 0
        const s = stackAt(t * (N - 1));
        el.style.transform =
          `translate(calc(-50% + ${s.x + dir * arc * 60}%), calc(-50% + ${s.y + arc * 34}px)) ` +
          `rotate(${s.rot + dir * arc * 10}deg) scale(${s.scale - arc * 0.04})`;
        el.style.opacity = "1";
        // Drop behind the others as soon as it starts moving — it's heading for
        // the bottom of the stack, so it must pass under, not over.
        el.style.zIndex = t > 0.12 ? "5" : "40";
      } else {
        const s = stackAt(u);
        el.style.transform =
          `translate(calc(-50% + ${s.x}%), calc(-50% + ${s.y}px)) rotate(${s.rot}deg) scale(${s.scale})`;
        el.style.opacity = "1";
        el.style.zIndex = String(30 - Math.round(u * 10));
      }
    }
  };

  // Wrap a position into [0, N).
  const norm = (v) => ((v % N) + N) % N;

  // The deck only ever eases toward a target card — there is no free momentum.
  // A flick used to be allowed to coast across several cards, which on a 3-card
  // deck meant one swipe routinely landed 2 cards along; since +2 and -1 are the
  // same place with 3 cards, that read as the deck moving the wrong way.
  useEffect(() => {
    if (!isMobile) return;
    posRef.current = 0;
    velRef.current = 0;
    targetRef.current = null;
    const loop = () => {
      if (!draggingRef.current && targetRef.current !== null) {
        // Take the short way round, so 2 → 0 goes forwards rather than back
        // through 1.
        let diff = norm(targetRef.current - posRef.current);
        if (diff > N / 2) diff -= N;
        if (Math.abs(diff) < 0.002) {
          posRef.current = targetRef.current;
          targetRef.current = null;
        } else {
          posRef.current += diff * 0.16;
        }
      }
      posRef.current = norm(posRef.current);
      paintCards();
      const idx = Math.round(posRef.current) % N;
      if (idx !== lastIdxRef.current) { lastIdxRef.current = idx; setActiveIndex(idx); }
      rafRef.current = requestAnimationFrame(loop);
    };
    paintCards();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isMobile, N]);

  const STEP_PX = 150; // finger px ~ one card

  const onCardTouchStart = (e) => {
    if (!isMobile) return;
    draggingRef.current = true;
    movedRef.current = false;
    velRef.current = 0;
    targetRef.current = null;
    startXRef.current = lastXRef.current = e.touches[0].clientX;
    startPosRef.current = posRef.current;
    lastTRef.current = performance.now();
  };
  const onCardTouchMove = (e) => {
    if (!isMobile || !draggingRef.current) return;
    const x = e.touches[0].clientX;
    const dx = x - startXRef.current;
    if (Math.abs(dx) > 6) {
      movedRef.current = true;
      // Throw the card the way the finger is going.
      dirRef.current = dx < 0 ? -1 : 1;
    }
    // Clamped to ±1 card: dragging further must not queue up extra cards, or the
    // release lands somewhere the gesture never pointed at.
    const raw = startPosRef.current - dx / STEP_PX;
    const lo = startPosRef.current - 1;
    const hi = startPosRef.current + 1;
    posRef.current = Math.min(hi, Math.max(lo, raw));
    const now = performance.now();
    const dt = now - lastTRef.current;
    // Speed only decides whether a short flick still counts as a swipe — it
    // never drives the deck.
    if (dt > 0) velRef.current = Math.abs(x - lastXRef.current) / dt;
    lastXRef.current = x;
    lastTRef.current = now;
    paintCards();
  };

  const onCardTouchEnd = () => {
    if (!isMobile) return;
    draggingRef.current = false;
    const dx = lastXRef.current - startXRef.current;
    // Either a decisive distance or a quick flick commits to the next card;
    // anything less springs back to the one you started on.
    const committed = Math.abs(dx) > 45 || velRef.current > 0.45;
    // Swipe left → next card. Swipe right → previous.
    const step = committed ? (dx < 0 ? 1 : -1) : 0;
    targetRef.current = norm(startPosRef.current + step);
    velRef.current = 0;
  };

  // For reels WITHOUT a hosted video, a click opens the Instagram reel in a new
  // tab. For reels WITH a hosted video, the click does nothing here — the inline
  // <video> controls handle play, and the "Reel ↗" badge handles the redirect.
  // We never embed Instagram, so no IG chrome renders over our UI.
  const handleCardClick = (reel) => {
    if (movedRef.current) return; // that was a swipe, not a tap
    if (!reel.video && reel.reelUrl) {
      window.open(reel.reelUrl, "_blank", "noopener,noreferrer");
    }
  };

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

      <div className={`reels-container ${isMobile ? "is-deck" : ""}`}>
        {reelsData.map((reel, i) => (
          <div
            key={reel.id}
            ref={(el) => { cardRefs.current[i] = el; }}
            className={`reel-card reel-card-${reel.position}`}
            style={{ cursor: reel.reelUrl ? "pointer" : "default" }}
            onClick={() => handleCardClick(reel)}
            onTouchStart={onCardTouchStart}
            onTouchMove={onCardTouchMove}
            onTouchEnd={onCardTouchEnd}
          >
            <div className="reel-card-inner">
              <div className="reel-media">
                {reel.video ? (
                  // Self-hosted playback (no autoplay, no Instagram chrome).
                  // stopPropagation so using the controls doesn't trigger the
                  // card click. preload="none" → only the poster shows until play.
                  <video
                    src={reel.video}
                    poster={reel.poster}
                    className="reel-poster"
                    controls
                    playsInline
                    preload="none"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <img
                    src={reel.poster}
                    alt={reel.title}
                    className="reel-poster"
                    loading="lazy"
                  />
                )}
                <div className="reel-overlay"></div>
              </div>

              {/* When a video is present, the overlay is visual-only (so the
                  video controls remain clickable); the badge stays clickable to
                  open the reel on Instagram. */}
              <div
                className="reel-content"
                style={reel.video ? { pointerEvents: "none" } : undefined}
              >
                {reel.reelUrl ? (
                  <a
                    className="reel-badge"
                    href={reel.reelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ pointerEvents: "auto" }}
                  >
                    Reel ↗
                  </a>
                ) : (
                  <span className="reel-badge">Reel</span>
                )}
                <div className="reel-info">
                  <p className="reel-subtitle">{reel.subtitle}</p>
                  <h4 className="reel-title">{reel.title}</h4>
                </div>
                {!reel.video && (
                  <div className="reel-play">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36a1 1 0 00-1.5.86z" fill="currentColor"/>
                    </svg>
                  </div>
                )}
              </div>

              <div className="reel-shine"></div>
            </div>
          </div>
        ))}
      </div>

      {isMobile && (
        <div className="reel-mobile-controls">
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
