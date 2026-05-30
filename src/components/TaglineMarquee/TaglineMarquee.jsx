"use client";
import "./TaglineMarquee.css";

/* =============================================================================
   TaglineMarquee — "We aren't merely selling bottles…" as a two-row marquee.
   Top row drifts left → right, bottom row right → left.

   Flat + simple on purpose: each row is one track holding TWO identical text
   spans. Translating the track by exactly -50% swaps span A for span B, so the
   loop is seamless. Repeats are joined by EM spaces (U+2003) which, unlike
   regular spaces, are not collapsed by white-space handling — giving a steady
   gap between repeats without any extra elements.
   ========================================================================== */

const REPEAT = 3;
const GAP = " "; // one regular space — smallest gap between repeats

function Row({ text, direction }) {
  const half = Array.from({ length: REPEAT }).map(() => text).join(GAP) + GAP;
  return (
    <div className="tm-row">
      <div className={`tm-track tm-track--${direction}`}>
        <span className="tm-text" aria-hidden="true">{half}</span>
        <span className="tm-text" aria-hidden="true">{half}</span>
      </div>
    </div>
  );
}

export default function TaglineMarquee({ text }) {
  if (!text) return null;
  return (
    <div className="tm">
      {/* single copy for screen readers; the visual rows are aria-hidden */}
      <p className="tm-sr">{text}</p>
      <Row text={text} direction="rtl" />
      <Row text={text} direction="ltr" />
    </div>
  );
}
