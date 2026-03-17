"use client";
import "./MarqueeBanner.css";
import { useRef } from "react";
import { useSettings } from "@/context/SettingsContext";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_REELS = [
  { id: 1, title: "Morning Ritual", subtitle: "Golden Hour Glow", video: "/videos/reel1.mp4", poster: "/serum.jpg", position: "left-top" },
  { id: 2, title: "Sacred Rituals", subtitle: "Embrace Your Natural Glow", video: "/videos/reel2.mp4", poster: "/cream.jpg", position: "center" },
  { id: 3, title: "Evening Care", subtitle: "Restore & Rejuvenate", video: "/videos/reel3.mp4", poster: "/pink.jpg", position: "right-bottom" },
];

const DEFAULT_POSTERS = { "left-top": "/serum.jpg", center: "/cream.jpg", "right-bottom": "/pink.jpg" };

const MarqueeBanner = () => {
  const settings = useSettings();
  const cmsMarquee = settings.cmsMarquee || {};
  const marqueeLines = cmsMarquee.marqueeLines || ["Ancient wisdom meets modern beauty", "Pure ingredients for radiant skin", "Timeless rituals for glowing skin"];
  const reelsData = (cmsMarquee.reels?.length > 0) ? cmsMarquee.reels.map((r, i) => ({
    id: i + 1,
    title: r.title,
    subtitle: r.subtitle,
    video: r.video?.url || DEFAULT_REELS[i]?.video,
    poster: r.posterImage?.url || DEFAULT_POSTERS[r.position] || DEFAULT_REELS[i]?.poster,
    position: r.position,
  })) : DEFAULT_REELS;

  const marqueeBannerRef = useRef(null);
  const marquee1Ref = useRef(null);
  const marquee2Ref = useRef(null);
  const marquee3Ref = useRef(null);

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

      tl.fromTo(marquee1Ref.current,
        { xPercent: 5, force3D: true },
        { xPercent: -35, duration: 1, ease: "none", force3D: true },
        0
      );

      tl.fromTo(marquee2Ref.current,
        { xPercent: -25, force3D: true },
        { xPercent: 25, duration: 1, ease: "none", force3D: true },
        0
      );

      if (marquee3Ref.current) {
        tl.fromTo(marquee3Ref.current,
          { xPercent: 15, force3D: true },
          { xPercent: -25, duration: 1, ease: "none", force3D: true },
          0
        );
      }
    },
    { scope: marqueeBannerRef }
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

      <div className="reels-container">
        {reelsData.map((reel) => (
          <div
            key={reel.id}
            className={`reel-card reel-card-${reel.position}`}
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
