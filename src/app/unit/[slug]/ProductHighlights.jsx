"use client";

import Image from "next/image";
import Link from "next/link";

// CTA targets that open one of the info tabs further down the page (the page
// supplies onOpenInfo, which also handles the mobile accordion).
const TAB_TARGETS = {
  ingredients: "ingredients",
  "why-it-works": "values",
  "how-to-use": "howto",
};

function Arrow() {
  return (
    <svg className="phl-cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function CardCta({ cta, onOpenInfo }) {
  const label = cta?.label?.trim();
  if (!label || !cta.target) return null;

  if (TAB_TARGETS[cta.target]) {
    return (
      <button type="button" className="phl-cta" onClick={() => onOpenInfo(TAB_TARGETS[cta.target])}>
        {label}
        <Arrow />
      </button>
    );
  }
  if (cta.target === "ritual") {
    return (
      <Link href="/ritual" className="phl-cta">
        {label}
        <Arrow />
      </Link>
    );
  }
  if (cta.target === "url" && cta.url) {
    const external = /^https?:\/\//.test(cta.url);
    return external ? (
      <a href={cta.url} className="phl-cta" target="_blank" rel="noopener noreferrer">
        {label}
        <Arrow />
      </a>
    ) : (
      <Link href={cta.url} className="phl-cta">
        {label}
        <Arrow />
      </Link>
    );
  }
  return null;
}

// `data` comes from getProductHighlights() (never empty). 1-3 cards: three
// columns on desktop, a swipeable row below 1025px.
export default function ProductHighlights({ data, onOpenInfo }) {
  return (
    <section className="phl" aria-labelledby="phl-title">
      <div className="phl-inner">
        <div className="phl-head">
          <span className="phl-eyebrow">{data.eyebrow}</span>
          <h2 className="phl-title" id="phl-title">
            {data.title}
          </h2>
        </div>

        <div className="phl-grid" data-n={data.cards.length} style={{ "--phl-n": data.cards.length }}>
          {data.cards.map((card, i) => {
            const chips = (card.chips || []).filter(Boolean);
            return (
              <article className="phl-card" key={i}>
                {card.image?.url && (
                  <div className="phl-media">
                    <Image
                      src={card.image.url}
                      alt={card.image.alt || ""}
                      fill
                      sizes="(max-width: 1024px) 82vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="phl-body">
                  {card.eyebrow && <span className="phl-card-eyebrow">{card.eyebrow}</span>}
                  <h3 className="phl-card-title">{card.title}</h3>
                  {card.highlight && <p className="phl-highlight">{card.highlight}</p>}
                  {card.body && <p className="phl-text">{card.body}</p>}

                  <div className="phl-foot">
                    {chips.length > 0 && (
                      <div className="phl-chips">
                        {card.chipsLabel && <span className="phl-chips-label">{card.chipsLabel}</span>}
                        <ul className="phl-chip-list">
                          {chips.map((chip) => (
                            <li className="phl-chip" key={chip}>
                              {chip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <CardCta cta={card.cta} onOpenInfo={onOpenInfo} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
