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

  // The deck (and its swipe handling) is phones only; wider screens keep the
  // static fanned layout, so `.is-deck` and every handler below are gated on it.
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

  const cardRefs = useRef([]);
  // Stack order, bottom → top. The LAST entry is the card on top. A swipe moves
  // the top entry to the front of the array (i.e. to the bottom of the deck).
  const orderRef = useRef([...Array(reelsData.length).keys()]);
  const animatingRef = useRef(false);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const dxRef = useRef(0);
  const movedRef = useRef(false); // distinguishes a swipe from a tap
  const timersRef = useRef([]);

  // ── Deck geometry ─────────────────────────────────────────────────────────
  // Depth 0 is the top card. Each step back lifts, shrinks and tilts slightly.
  const STEP_Y = -9;        // px per depth step
  const STEP_SCALE = 0.055; // scale lost per depth step
  const TILTS = [0, -4, 3.2, -2.4, 4.6];

  // How far the card swings out before it tucks. It must clear the deck
  // completely, or the moment its paint order changes reads as the card being
  // sliced in half — that was the long-standing bug here.
  const FLY_PX = 330;
  const FLY_MS = 380;   // phase 1 — swing out
  const TUCK_MS = 500;  // phase 2 — drop behind and slide into the back slot
  // Finger distance that commits to a card change. One committed swipe always
  // advances exactly ONE card, because the animation below is scripted rather
  // than tied to how far the finger travelled.
  const SWIPE_MIN_PX = 70;

  const transformFor = (depth) => {
    const tilt = depth === 0 ? 0 : TILTS[depth % TILTS.length];
    return `translate(-50%, -50%) translateY(${depth * STEP_Y}px) ` +
      `scale(${1 - depth * STEP_SCALE}) rotate(${tilt}deg)`;
  };

  // Paint every card from the current order.
  const applyLayout = () => {
    const order = orderRef.current;
    const n = order.length;
    order.forEach((cardIdx, i) => {
      const el = cardRefs.current[cardIdx];
      if (!el) return;
      const depth = n - 1 - i;
      el.style.zIndex = String(i);
      el.style.transform = transformFor(depth);
      el.style.pointerEvents = depth === 0 ? "auto" : "none";
    });
  };

  const topCardIndex = () => orderRef.current[orderRef.current.length - 1];

  // A committed swipe, in two scripted phases. Phase 1 swings the top card fully
  // clear of the deck while it is still the front-most card, so nothing can
  // cover it. Only THEN — with the card out to the side and overlapping nothing
  // — does its paint order drop to the back, and phase 2 slides it home
  // underneath the others. Splitting it this way is what makes the hand-over
  // invisible; while the cards overlap there is no ordering that looks clean.
  const swipe = (dir) => {
    if (animatingRef.current || !isMobile) return;
    animatingRef.current = true;

    const idx = topCardIndex();
    const el = cardRefs.current[idx];
    if (!el) { animatingRef.current = false; return; }

    el.classList.remove("is-dragging");
    el.classList.add("is-flyout");
    el.style.transform =
      `translate(-50%, -50%) translate(${dir * FLY_PX}px, -26px) ` +
      `rotate(${dir * 18}deg) rotateY(${dir * 12}deg) scale(0.94)`;

    timersRef.current.push(setTimeout(() => {
      el.classList.remove("is-flyout");

      // Top card goes to the bottom of the deck.
      const order = orderRef.current;
      orderRef.current = [idx, ...order.slice(0, -1)];
      const n = orderRef.current.length;

      // Re-stack: everyone else steps forward one place (their own transition
      // animates it); the swiped card drops to the lowest paint order while it
      // is still out at the side.
      orderRef.current.forEach((cardIdx, i) => {
        const other = cardRefs.current[cardIdx];
        if (!other) return;
        other.style.zIndex = String(i);
        other.style.pointerEvents = i === n - 1 ? "auto" : "none";
        if (cardIdx === idx) return;
        other.style.transform = transformFor(n - 1 - i);
      });

      // Reflow so the tuck transition starts from the side position rather than
      // being collapsed into the same style recalculation.
      void el.offsetHeight;
      el.classList.add("is-tuck");
      el.style.transform = transformFor(n - 1);

      setActiveIndex(orderRef.current[n - 1]);

      timersRef.current.push(setTimeout(() => {
        el.classList.remove("is-tuck");
        animatingRef.current = false;
      }, TUCK_MS));
    }, FLY_MS));
  };

  // Jump straight to a card (the dots), one swipe per step.
  const goToCard = (target) => {
    if (animatingRef.current) return;
    if (topCardIndex() === target) return;
    swipe(-1);
  };

  useEffect(() => {
    if (!isMobile) return;
    orderRef.current = [...Array(N).keys()];
    animatingRef.current = false;
    applyLayout();
    setActiveIndex(orderRef.current[N - 1]);
    const timers = timersRef.current;
    return () => { timers.forEach(clearTimeout); timers.length = 0; };
  }, [isMobile, N]);

  const onCardTouchStart = (e) => {
    if (!isMobile || animatingRef.current) return;
    draggingRef.current = true;
    movedRef.current = false;
    dxRef.current = 0;
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    const el = cardRefs.current[topCardIndex()];
    if (el) el.classList.add("is-dragging");
  };

  const onCardTouchMove = (e) => {
    if (!isMobile || !draggingRef.current) return;
    const dx = e.touches[0].clientX - startXRef.current;
    const dy = e.touches[0].clientY - startYRef.current;
    // A mostly-vertical gesture is the page scrolling, not a swipe — let it go.
    if (!movedRef.current && Math.abs(dy) > Math.abs(dx)) return;
    if (Math.abs(dx) > 6) movedRef.current = true;
    dxRef.current = dx;
    const el = cardRefs.current[topCardIndex()];
    if (!el) return;
    // The top card tracks the finger 1:1 — direct manipulation, so it always
    // feels like you are moving that card and nothing else.
    el.style.transform =
      `translate(-50%, -50%) translate(${dx}px, ${dy * 0.25}px) ` +
      `rotate(${dx / 18}deg) rotateY(${dx / 26}deg)`;
  };

  const onCardTouchEnd = () => {
    if (!isMobile || !draggingRef.current) return;
    draggingRef.current = false;
    const dx = dxRef.current;
    const el = cardRefs.current[topCardIndex()];
    if (el) el.classList.remove("is-dragging");
    if (Math.abs(dx) > SWIPE_MIN_PX) {
      swipe(dx > 0 ? 1 : -1);
    } else {
      applyLayout(); // snap back
    }
    dxRef.current = 0;
  };

  // Clicking a reel always opens its Instagram reel in a new tab. We never embed
  // or self-host playback here (that path was unreliable — a dead video left the
  // card doing nothing), so "play" = open the reel on Instagram.
  const handleCardClick = (reel) => {
    if (movedRef.current) return; // that was a swipe, not a tap
    if (reel.reelUrl) {
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
                <img
                  src={reel.poster}
                  alt={reel.title}
                  className="reel-poster"
                  loading="lazy"
                />
                <div className="reel-overlay"></div>
              </div>

              {/* Card click (bubbles up) opens the Instagram reel; the badge is
                  an explicit link to the same place. */}
              <div className="reel-content">
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
          <div className="reel-dots">
            {reelsData.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`reel-dot ${i === activeIndex ? "active" : ""}`}
                aria-label={`Go to reel ${i + 1}`}
                onClick={() => goToCard(i)}
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
