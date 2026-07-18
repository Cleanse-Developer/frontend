"use client";
import "./genesis.css";
import { useRef } from "react";

import Copy from "@/components/Copy/Copy";
import TextBlock from "@/components/TextBlock/TextBlock";
import { useSettings } from "@/context/SettingsContext";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* The /genesis page. All content is admin-editable via the cmsGenesis CMS
   section. Journey step numbers are derived from position. */

/* The CMS stores an icon id; keep these keys in sync with the ICON_GLYPHS map
   in admin-frontend/src/components/cms/cms-genesis-editor.jsx. */
const GENESIS_ICONS = {
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21c0-6 1.5-10 8-12-1 6-3.5 9.5-8 12z" />
      <path d="M12 21C12 13 9 8 3 7c.6 5.5 3.5 11 9 14z" />
      <path d="M12 21v-6" />
    </svg>
  ),
  layers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l8 5-8 5-8-5 8-5z" />
      <path d="M4 12l8 5 8-5" />
      <path d="M4 16l8 5 8-5" />
    </svg>
  ),
  flask: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6" />
      <path d="M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3" />
      <path d="M7 15h10" />
    </svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </svg>
  ),
};

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

export default function Genesis() {
  const settings = useSettings();
  const data = settings.cmsGenesis || {};
  const containerRef = useRef(null);

  const columns = data.galleryColumns || [];
  const pillars = data.pillars || [];
  const stats = data.stats || [];
  const journey = data.journey || [];

  /* The scroll handler below looks the main image up with a singular
     querySelector and bails on a miss — which would leave the whole gallery
     stuck at opacity 0. Clamp the admin's pointer into range so exactly one
     image always carries the class, whatever is in the CMS. */
  const mainCol = columns.length
    ? clamp(data.galleryMainColumn ?? 0, 0, columns.length - 1)
    : 0;
  const mainColLength = columns[mainCol]?.images?.length || 0;
  const mainImg = mainColLength
    ? clamp(data.galleryMainImage ?? 0, 0, mainColLength - 1)
    : 0;

  useGSAP(
    () => {
      const projectPreview = document.querySelector(".project-preview");
      if (projectPreview) {
        gsap.set(projectPreview, { opacity: 0 });
      }

      ScrollTrigger.create({
        trigger: ".project-page-whitespace",
        start: "top bottom",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          const projectPreviewWrapper = document.querySelector(
            ".project-preview-wrapper"
          );
          const previewCols = document.querySelectorAll(
            ".preview-col:not(.main-preview-col)"
          );
          const mainPreviewImg = document.querySelector(
            ".preview-img.main-preview-img img"
          );
          const projectPreviewSection = document.querySelector(".project-preview");

          if (!projectPreviewWrapper || !previewCols.length || !mainPreviewImg || !projectPreviewSection)
            return;

          // Fade in the background images when scrolling starts
          if (self.progress > 0) {
            const fadeProgress = Math.min(self.progress * 5, 1);
            projectPreviewSection.style.opacity = fadeProgress;
          } else {
            projectPreviewSection.style.opacity = 0;
          }

          const previewScreenWidth = window.innerWidth;
          const previewMaxScale = previewScreenWidth < 900 ? 4 : 2.65;

          const scale = 1 + self.progress * previewMaxScale;
          const yPreviewColTranslate = self.progress * 300;
          const mainPreviewImgScale = 2 - self.progress * 0.85;

          projectPreviewWrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;

          previewCols.forEach((previewCol) => {
            previewCol.style.transform = `translateY(${yPreviewColTranslate}px)`;
          });

          mainPreviewImg.style.transform = `scale(${mainPreviewImgScale})`;
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="genesis-page">
      {/* Fixed zoom gallery — driven by .project-page-whitespace (kept intact).
          Column and image counts are free: the layout is flex:1 throughout. */}
      <section className="project-preview">
        <div className="project-preview-wrapper">
          {columns.map((col, ci) => (
            <div
              className={`preview-col${ci === mainCol ? " main-preview-col" : ""}`}
              key={ci}
            >
              {(col.images || []).map((image, ii) => (
                <div
                  className={`preview-img${
                    ci === mainCol && ii === mainImg ? " main-preview-img" : ""
                  }`}
                  key={ii}
                >
                  <img src={image?.url} alt="" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Hero */}
      <section className="genesis-hero">
        <div className="container">
          <div className="gen-hero-header">
            <Copy animateOnScroll={false} delay={0.6}>
              <span className="gen-eyebrow gen-eyebrow--light">
                {data.heroEyebrow}
              </span>
            </Copy>
            <Copy animateOnScroll={false} delay={0.7} type="flicker">
              <h1>{data.heroTitle}</h1>
            </Copy>
            <Copy animateOnScroll={false} delay={0.9}>
              <p className="gen-hero-subtitle">{data.heroSubtitle}</p>
            </Copy>
          </div>
          <span className="gen-hero-scroll" aria-hidden="true">
            {data.heroScrollCue}
          </span>
        </div>
      </section>

      {/* Editorial lead — image + philosophy split */}
      <section className="gen-lead">
        <div className="gen-inner gen-lead-split">
          <div className="gen-lead-media">
            <img
              src={data.leadImage?.url}
              alt="A Cleanse Ayurveda ritual"
              loading="lazy"
            />
          </div>
          <div className="gen-lead-content">
            <span className="gen-eyebrow">{data.leadEyebrow}</span>
            <Copy>
              <h2 className="gen-lead-title">{data.leadTitle}</h2>
            </Copy>
            <Copy delay={0.15}>
              <p className="gen-body">{data.leadBody}</p>
            </Copy>
          </div>
        </div>
      </section>

      {/* Pillars / values */}
      <section className="gen-values">
        <div className="gen-inner">
          <div className="gen-section-head">
            <span className="gen-eyebrow">{data.pillarsEyebrow}</span>
            <Copy>
              <h2 className="gen-section-title">{data.pillarsTitle}</h2>
            </Copy>
          </div>
          <div className="gen-values-grid">
            {pillars.map((p, i) => (
              <article className="gen-value-card" key={i}>
                <span className="gen-value-icon">
                  {GENESIS_ICONS[p.icon] || GENESIS_ICONS.leaf}
                </span>
                <h3 className="gen-value-title">{p.title}</h3>
                <p className="gen-value-desc">{p.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Heritage — full-bleed image band */}
      <section className="gen-heritage">
        <div className="gen-inner gen-heritage-card">
          <img
            className="gen-heritage-img"
            src={data.heritageImage?.url}
            alt="Botanicals of the Himalayan foothills"
            loading="lazy"
          />
          <span className="gen-heritage-scrim" aria-hidden="true"></span>
          <div className="gen-heritage-content">
            <span className="gen-eyebrow gen-eyebrow--light">
              {data.heritageEyebrow}
            </span>
            <Copy>
              <h2 className="gen-section-title gen-heritage-title">
                {data.heritageTitle}
              </h2>
            </Copy>
            <Copy delay={0.15}>
              <p className="gen-body gen-heritage-body">{data.heritageBody}</p>
            </Copy>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="gen-stats">
        <div className="gen-inner gen-stats-grid">
          {stats.map((s, i) => (
            <div className="gen-stat" key={i}>
              <span className="gen-stat-value">{s.value}</span>
              <span className="gen-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Scroll-zoom whitespace (drives the fixed gallery — kept) */}
      <section className="project-page-whitespace"></section>

      {/* Brown manifesto */}
      <TextBlock data={data} />

      {/* Journey timeline */}
      <section className="gen-journey">
        <div className="gen-inner">
          <div className="gen-section-head">
            <span className="gen-eyebrow">{data.journeyEyebrow}</span>
            <Copy>
              <h2 className="gen-section-title">{data.journeyTitle}</h2>
            </Copy>
          </div>
          <div className="gen-journey-list">
            {journey.map((j, i) => (
              <div className="gen-journey-item" key={i}>
                <span className="gen-journey-step">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="gen-journey-body">
                  <h3 className="gen-journey-title">{j.title}</h3>
                  <p className="gen-journey-desc">{j.desc}</p>
                </div>
                <div className="gen-journey-img">
                  <img src={j.image?.url} alt={j.title} loading="lazy" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder quote — closing */}
      <section className="gen-quote">
        <div className="gen-inner">
          <Copy>
            <blockquote className="gen-quote-text">{data.quoteText}</blockquote>
          </Copy>
          <span className="gen-quote-cite">{data.quoteAuthor}</span>
        </div>
      </section>
    </div>
  );
}
