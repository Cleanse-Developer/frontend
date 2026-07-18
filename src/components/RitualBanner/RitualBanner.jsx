"use client";
import "./RitualBanner.css";
import Link from "next/link";
import { useRef } from "react";
import Copy from "@/components/Copy/Copy";
import { useSettings } from "@/context/SettingsContext";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* =============================================================================
   RitualBanner, home "Find your ritual" section (light, on-brand)

   Sits on the same #F0EDE8 background as the testimonials above and the
   product grid below. Two refined cards, Morning "Awaken" and Evening
   "Restore", each previews its step sequence and deep-links into the
   /ritual page (the PM card opens it in evening mode via the #evening hash,
   which the ritual page honours).

   Content is admin-editable via the cmsRitualBanner CMS section. The two cards
   are a fixed pair — `key` ("am"/"pm") drives the rhr-card--am / rhr-card--pm
   modifier classes, so the admin edits cards in place rather than adding them.

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

/* The CMS stores an icon id; keep these keys in sync with the ICON_GLYPHS map
   in admin-frontend/src/components/cms/cms-ritual-banner-editor.jsx. */
const RITUAL_ICONS = { sun: SunIcon, moon: MoonIcon };

export default function RitualBanner() {
  const settings = useSettings();
  const sectionRef = useRef(null);

  const data = settings.cmsRitualBanner || {};
  const cards = data.cards;
  const enabled = data.enabled !== false;

  useGSAP(
    () => {
      const cardEls = gsap.utils.toArray(".rhr-card");
      cardEls.forEach((card, i) => {
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
    // Re-run once the CMS cards land, otherwise the triggers are built against
    // markup that isn't there yet and the cards stay at opacity 0.
    { scope: sectionRef, dependencies: [cards, enabled] }
  );

  if (!enabled || !cards?.length) return null;

  return (
    <section className="rhr-section" ref={sectionRef} aria-labelledby="rhr-title">
      <div className="rhr-inner">
        <header className="rhr-head">
          <Copy type="flicker">
            <h2 id="rhr-title" className="rhr-headline">
              {data.heading}
            </h2>
          </Copy>
          <Copy>
            <p className="bodyCopy rhr-sub">{data.subtitle}</p>
          </Copy>
        </header>

        <div className="rhr-cards">
          {cards.map((card, ci) => {
            const Icon = RITUAL_ICONS[card.icon] || SunIcon;
            const label = `${card.title}, the ${(card.eyebrow || "").toLowerCase()} ritual`;
            return (
              <Link
                href={card.href || "/ritual"}
                className={`rhr-card rhr-card--${card.key}`}
                key={card.key || ci}
                aria-label={label}
              >
                <img className="rhr-card-img" src={card.image?.url} alt={label} loading="lazy" />
                <span className="rhr-card-scrim" aria-hidden="true" />

                <div className="rhr-card-top">
                  <span className="rhr-card-badge">
                    <Icon />
                    {card.eyebrow}
                  </span>
                  <span className="rhr-card-meta">{card.meta}</span>
                </div>

                <div className="rhr-card-content">
                  <span className="rhr-card-subtitle">{card.subtitle}</span>
                  <h3 className="rhr-card-title">{card.title}</h3>
                  <p className="bodyCopy rhr-card-desc">{card.desc}</p>

                  <ol className="rhr-steps">
                    {(card.steps || []).map((s, i) => (
                      <li className="rhr-step" key={i}>
                        <span className="rhr-step-dot" aria-hidden="true" />
                        <span className="rhr-step-label">{s}</span>
                      </li>
                    ))}
                  </ol>

                  <span className="rhr-card-link">
                    {card.linkText}
                    <Arrow />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {data.ctaText && (
          <div className="rhr-foot">
            <Link href={data.ctaLink || "/ritual"} className="rhr-cta">
              {data.ctaText}
              <Arrow />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
