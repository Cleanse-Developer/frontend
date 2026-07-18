"use client";
import "./genesis.css";
import { useRef } from "react";

import Copy from "@/components/Copy/Copy";
import TextBlock from "@/components/TextBlock/TextBlock";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  {
    title: "Pure botanicals",
    desc: "Cold-pressed oils, herbal extracts and nothing synthetic. Every ingredient earns its place.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21c0-6 1.5-10 8-12-1 6-3.5 9.5-8 12z" />
        <path d="M12 21C12 13 9 8 3 7c.6 5.5 3.5 11 9 14z" />
        <path d="M12 21v-6" />
      </svg>
    ),
  },
  {
    title: "Ancient wisdom",
    desc: "Formulas shaped by five thousand years of Ayurvedic practice and Himalayan tradition.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l8 5-8 5-8-5 8-5z" />
        <path d="M4 12l8 5 8-5" />
        <path d="M4 16l8 5 8-5" />
      </svg>
    ),
  },
  {
    title: "Modern science",
    desc: "Time-tested rituals, validated and refined with contemporary, clinically-minded research.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6" />
        <path d="M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3" />
        <path d="M7 15h10" />
      </svg>
    ),
  },
  {
    title: "Sacred ritual",
    desc: "Skincare slowed down, a daily ceremony of intention, presence and care.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
      </svg>
    ),
  },
];

const STATS = [
  { value: "155", label: "years old" },
  { value: "100%", label: "natural ingredients" },
  { value: "0", label: "synthetic additives" },
  { value: "20+", label: "botanical actives" },
];

const JOURNEY = [
  {
    step: "01",
    title: "The source",
    desc: "High in the Himalayan foothills, where the air runs clean and the herbs grow wild, Ayurveda was born.",
    img: "/gallery-4.png",
  },
  {
    step: "02",
    title: "The craft",
    desc: "We partner with growers who honour the land, harvesting each botanical at its peak of potency.",
    img: "/gallery-1.png",
  },
  {
    step: "03",
    title: "The formula",
    desc: "Every blend is composed slowly, balancing ancient tradition with modern, considered refinement.",
    img: "/gallery-5.png",
  },
  {
    step: "04",
    title: "The ritual",
    desc: "What reaches you is more than a product. It is a daily ceremony for your skin and your self.",
    img: "/gallery-6.png",
  },
];

export default function Genesis() {
  const containerRef = useRef(null);

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
      {/* Fixed zoom gallery — driven by .project-page-whitespace (kept intact) */}
      <section className="project-preview">
        <div className="project-preview-wrapper">
          {/* Zoom gallery — text-free product shots only (the labelled/ad
              images were dropped). main-preview-img is the frame that zooms. */}
          <div className="preview-col">
            <div className="preview-img"><img src="/gallery-2.png" alt="" /></div>
            <div className="preview-img"><img src="/gallery-3.png" alt="" /></div>
            <div className="preview-img"><img src="/gallery-4.png" alt="" /></div>
          </div>
          <div className="preview-col">
            <div className="preview-img"><img src="/gallery-5.png" alt="" /></div>
            <div className="preview-img"><img src="/gallery-6.png" alt="" /></div>
            <div className="preview-img"><img src="/genesis.png" alt="" /></div>
          </div>
          <div className="preview-col main-preview-col">
            <div className="preview-img"><img src="/footer.png" alt="" /></div>
            <div className="preview-img main-preview-img"><img src="/center.png" alt="" /></div>
            <div className="preview-img"><img src="/top-banner-desktop-new.png" alt="" /></div>
          </div>
          <div className="preview-col">
            <div className="preview-img"><img src="/banner-bottom-mobile.png" alt="" /></div>
            <div className="preview-img"><img src="/gallery-1.png" alt="" /></div>
            <div className="preview-img"><img src="/gallery-3.png" alt="" /></div>
          </div>
          <div className="preview-col">
            <div className="preview-img"><img src="/gallery-5.png" alt="" /></div>
            <div className="preview-img"><img src="/gallery-2.png" alt="" /></div>
            <div className="preview-img"><img src="/gallery-6.png" alt="" /></div>
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="genesis-hero">
        <div className="container">
          <div className="gen-hero-header">
            <Copy animateOnScroll={false} delay={0.6}>
              <span className="gen-eyebrow gen-eyebrow--light">Our genesis</span>
            </Copy>
            <Copy animateOnScroll={false} delay={0.7} type="flicker">
              <h1>The story behind your ritual</h1>
            </Copy>
            <Copy animateOnScroll={false} delay={0.9}>
              <p className="gen-hero-subtitle">Ancient wisdom, modern purity. Beauty drawn from nature.</p>
            </Copy>
          </div>
          <span className="gen-hero-scroll" aria-hidden="true">Scroll to explore</span>
        </div>
      </section>

      {/* Editorial lead — image + philosophy split */}
      <section className="gen-lead">
        <div className="gen-inner gen-lead-split">
          <div className="gen-lead-media">
            <img src="/beauty-flow.png" alt="A Cleanse Ayurveda ritual" loading="lazy" />
          </div>
          <div className="gen-lead-content">
            <span className="gen-eyebrow">The philosophy</span>
            <Copy>
              <h2 className="gen-lead-title">
                Beauty should flow from nature, never forced, only revealed.
              </h2>
            </Copy>
            <Copy delay={0.15}>
              <p className="gen-body">
                Cleanse Ayurveda is rooted in the belief that beauty flows from nature. Every
                formula is crafted with sacred intention, shaped by ancient Ayurvedic wisdom and
                the Himalayan foothills where it was born, then refined for the modern self-care
                ritual.
              </p>
            </Copy>
          </div>
        </div>
      </section>

      {/* Pillars / values */}
      <section className="gen-values">
        <div className="gen-inner">
          <div className="gen-section-head">
            <span className="gen-eyebrow">What we stand for</span>
            <Copy>
              <h2 className="gen-section-title">Four principles in every bottle</h2>
            </Copy>
          </div>
          <div className="gen-values-grid">
            {PILLARS.map((p, i) => (
              <article className="gen-value-card" key={i}>
                <span className="gen-value-icon">{p.icon}</span>
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
          <img className="gen-heritage-img" src="/heritage.png" alt="Botanicals of the Himalayan foothills" loading="lazy" />
          <span className="gen-heritage-scrim" aria-hidden="true"></span>
          <div className="gen-heritage-content">
            <span className="gen-eyebrow gen-eyebrow--light">Our heritage</span>
            <Copy>
              <h2 className="gen-section-title gen-heritage-title">Born in the Himalayan foothills</h2>
            </Copy>
            <Copy delay={0.15}>
              <p className="gen-body gen-heritage-body">
                Where the air runs clean and the herbs grow wild, Ayurveda was born. We honour
                that lineage with formulas that are pure, potent and profoundly effective,
                harmonising nature and science for those who seek authentic beauty.
              </p>
            </Copy>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="gen-stats">
        <div className="gen-inner gen-stats-grid">
          {STATS.map((s, i) => (
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
      <TextBlock />

      {/* Journey timeline */}
      <section className="gen-journey">
        <div className="gen-inner">
          <div className="gen-section-head">
            <span className="gen-eyebrow">Our journey</span>
            <Copy>
              <h2 className="gen-section-title">From the foothills to your ritual</h2>
            </Copy>
          </div>
          <div className="gen-journey-list">
            {JOURNEY.map((j, i) => (
              <div className="gen-journey-item" key={i}>
                <span className="gen-journey-step">{j.step}</span>
                <div className="gen-journey-body">
                  <h3 className="gen-journey-title">{j.title}</h3>
                  <p className="gen-journey-desc">{j.desc}</p>
                </div>
                <div className="gen-journey-img">
                  <img src={j.img} alt={j.title} loading="lazy" />
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
            <blockquote className="gen-quote-text">
              “We aren’t merely selling bottles; we are delivering a clinically-backed path to purity.”
            </blockquote>
          </Copy>
          <span className="gen-quote-cite">Cleanse Ayurveda</span>
        </div>
      </section>
    </div>
  );
}
