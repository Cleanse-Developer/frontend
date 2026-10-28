"use client";

import { useId, useState } from "react";
import { renderTabHighlightIcon } from "@/lib/tab-highlight-icons";

// Richer content for two of the product-page info tabs, used by the desktop tab
// panel and the mobile accordion alike:
//   - Ingredients: an intro paragraph, then each ingredient as icon + name +
//     one-line description, with the full composition tucked behind a toggle.
//   - How to Use: numbered steps (01, 02, ...) with a sentence each.
// Both only apply when the product has the content (descriptions / intro);
// otherwise the page keeps its existing paragraph + icon chips.

const balancedColumns = (count, max) => Math.ceil(count / Math.ceil(count / max));
const text = (v) => (typeof v === "string" ? v.trim() : "");

/** { intro: string[], items: [{icon,label,description}], composition } or null. */
export function getIngredientDetails(product) {
  const items = (product?.tabHighlights?.ingredients || []).filter((i) => text(i?.label));
  const intro = text(product?.ingredientsIntro)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!intro.length && !items.some((i) => text(i.description))) return null;
  return { intro, items, composition: text(product?.ingredients) };
}

/** [{label, description}] when at least one step has a sentence, else null. */
export function getHowToSteps(product) {
  const steps = (product?.tabHighlights?.howToUse || []).filter((s) => text(s?.label));
  return steps.some((s) => text(s.description)) ? steps : null;
}

export function IngredientsDetail({ details }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="ing">
      {details.intro.map((paragraph, i) => (
        <p className="ing-intro" key={i}>
          {paragraph}
        </p>
      ))}

      {details.items.length > 0 && (
        <ul className="ing-grid" style={{ "--ing-cols": balancedColumns(details.items.length, 3) }}>
          {details.items.map((item, i) => (
            <li className="ing-item" key={`${item.label}-${i}`}>
              <span className="info-value-icon" aria-hidden="true">
                {renderTabHighlightIcon(item.icon)}
              </span>
              <div className="ing-copy">
                <p className="ing-name">{item.label}</p>
                {text(item.description) && <p className="ing-desc">{item.description}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {details.composition && (
        <>
          <button
            type="button"
            className="ing-toggle"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Hide full ingredient list" : "View full ingredient list"}
            <svg className="ing-toggle-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <div className="ing-composition" id={panelId} hidden={!open}>
            <p style={{ whiteSpace: "pre-line" }}>{details.composition}</p>
          </div>
        </>
      )}
    </div>
  );
}

export function HowToSteps({ steps }) {
  return (
    <ol className="hts" style={{ "--hts-cols": balancedColumns(steps.length, 4) }}>
      {steps.map((step, i) => (
        <li className="hts-step" key={`${step.label}-${i}`}>
          <span className="hts-num" aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <p className="hts-label">{step.label}</p>
          {text(step.description) && <p className="hts-text">{step.description}</p>}
        </li>
      ))}
    </ol>
  );
}
