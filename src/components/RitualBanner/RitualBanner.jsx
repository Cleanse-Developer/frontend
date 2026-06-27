"use client";
import "./RitualBanner.css";
import Link from "next/link";
import { useRef } from "react";
import Copy from "@/components/Copy/Copy";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* =============================================================================
   RitualBanner, home "Find your ritual" section (light, on-brand)

   Sits on the same #F0EDE8 background as the testimonials above and the
   product grid below. Two refined cards, Morning "Awaken" and Evening
   "Restore", each previews its five-step sequence and deep-links into the
   /ritual page (the PM card opens it in evening mode via the #evening hash,
   which the ritual page now honours).

   Notes on the global stylesheet (intentional, not accidental):
   - globals.css forces `img,svg { width:100%; height:100% }`, so every inline
     icon here is given an explicit size + `object-fit:initial` in the CSS.
   - `p.bodyCopy { text-transform:none }` only matches <p>, so sentence-case
     copy uses <p className="bodyCopy">, never a <span>.
   All classes are namespaced `rhr-`.
   ========================================================================== */

const SunIcon = () => (
  <svg className="rhr-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8l1.8-1.8M18 6l1.8-1.8" />
  </svg>
);

const MoonIcon = () => (
  <svg className="rhr-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.4 6.4 0 0 0 10.5 10.5z" />
  </svg>
);

const Arrow = () => (
  <svg className="rhr-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const RITUALS = [
  {
    key: "am",
    eyebrow: "Morning",
    title: "Awaken",
    subtitle: "The morning ritual",
    href: "/ritual",
    img: "/face.jpg",
    meta: "5 steps · ~7 min",
    Icon: SunIcon,
    desc: "Wake the skin gently, brighten it, and shield it against the day ahead.",
    steps: ["Cleanse", "Mist", "Treat", "Hydrate", "Protect"],
    link: "Begin the morning",
  },
  {
    key: "pm",
    eyebrow: "Evening",
    title: "Restore",
    subtitle: "The evening ritual",
    href: "/ritual#evening",
    img: "/skin.jpg",
    meta: "5 steps · ~10 min",
    Icon: MoonIcon,
    desc: "Undo the day, then let precious botanicals repair your skin as you sleep.",
    steps: ["Melt", "Polish", "Treat", "Nourish", "Seal"],
    link: "Begin the evening",
  },
];

export default function RitualBanner() {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".rhr-card");
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 56, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            delay: i * 0.12,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 85%" },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section className="rhr-section" ref={sectionRef} aria-labelledby="rhr-title">
      <div className="rhr-inner">
        <header className="rhr-head">
          <Copy type="flicker">
            <h2 id="rhr-title" className="rhr-headline">
              Find your ritual
            </h2>
          </Copy>
          <Copy>
            <p className="bodyCopy rhr-sub">
              Skincare, slowed down. Two unhurried ceremonies, one to greet the
              morning, one to release the night, each made with Cleanse.
            </p>
          </Copy>
        </header>

        <div className="rhr-cards">
          {RITUALS.map(({ key, eyebrow, title, subtitle, href, img, meta, Icon, desc, steps, link }) => (
            <Link href={href} className={`rhr-card rhr-card--${key}`} key={key} aria-label={`${title}, the ${eyebrow.toLowerCase()} ritual`}>
              <img className="rhr-card-img" src={img} alt={`${title}, the ${eyebrow.toLowerCase()} ritual`} loading="lazy" />
              <span className="rhr-card-scrim" aria-hidden="true" />

              <div className="rhr-card-top">
                <span className="rhr-card-badge">
                  <Icon />
                  {eyebrow}
                </span>
                <span className="rhr-card-meta">{meta}</span>
              </div>

              <div className="rhr-card-content">
                <span className="rhr-card-subtitle">{subtitle}</span>
                <h3 className="rhr-card-title">{title}</h3>
                <p className="bodyCopy rhr-card-desc">{desc}</p>

                <ol className="rhr-steps">
                  {steps.map((s) => (
                    <li className="rhr-step" key={s}>
                      <span className="rhr-step-dot" aria-hidden="true" />
                      <span className="rhr-step-label">{s}</span>
                    </li>
                  ))}
                </ol>

                <span className="rhr-card-link">
                  {link}
                  <Arrow />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="rhr-foot">
          <Link href="/ritual" className="rhr-cta">
            Explore the full ritual
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
