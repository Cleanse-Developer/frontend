"use client";

import "./LegalPage.css";
import Link from "next/link";
import { useSettings } from "@/context/SettingsContext";

// Shared renderer for the information pages (Terms of Service, Privacy Policy,
// Shipping, Returns).
// Markup + class names mirror the original pages exactly so the existing CSS
// (legal-* classes in terms.css / privacy.css) styles it unchanged.
// Content comes ENTIRELY from the CMS via public settings — there are no
// hardcoded fallbacks here. If the section has no content, the page renders
// empty. (Shipping/Returns ship with defaults in SettingsContext, so they have
// content out of the box; Privacy/Terms deliberately do not.)
export default function LegalPage({ settingsKey }) {
  const settings = useSettings();
  const data = settings?.[settingsKey];

  if (!data) return null;

  const titleLines = (data.heroTitle || "").split("\n");
  const sections = data.sections || [];

  return (
    <div className="legal-page">
      {/* Hero */}
      <section className="legal-hero">
        <div className="legal-hero-bg">
          <img src="/images/b2.png" alt="" />
        </div>
        <div className="legal-hero-content">
          <div className="legal-breadcrumb">
            <Link href="/">HOME</Link>/ <span>{data.breadcrumbLabel}</span>
          </div>
          <h1 className="legal-hero-title">
            {titleLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < titleLines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="legal-hero-subtitle">{data.subtitle}</p>
          <div className="legal-hero-scroll">
            <span>Scroll</span>
            <div className="legal-scroll-line"></div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="legal-body">
        <div className="legal-body-inner">
          {data.lastUpdated && (
            <p className="legal-updated">Last Updated: {data.lastUpdated}</p>
          )}

          {sections.map((section, i) => {
            const paragraphs = (section.body || "")
              .split(/\n\s*\n/)
              .map((p) => p.trim())
              .filter(Boolean);
            return (
              <div className="legal-section" key={i}>
                <h3>{section.heading}</h3>
                {paragraphs.map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
