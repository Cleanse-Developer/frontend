/**
 * Typography tokens — JS mirror of the type system in globals.css.
 *
 * Two families: Caelune Beauty (display/headings) and Lexend (body). All sizes
 * are fluid clamp() values copied verbatim so every instance is identical at any
 * viewport width without per-component media overrides.
 */

export const fontFamily = {
  heading: "var(--font-heading)", // 'Caelune Beauty', serif
  body: "var(--font-body)", // 'Lexend', sans-serif
  headingRaw: "'Caelune Beauty', serif",
  bodyRaw: "'Lexend', sans-serif",
};

/** `--fs-*` role tokens (product card + section title). */
export const fontSizeToken = {
  cardTitle: "var(--fs-card-title)", // clamp(0.8rem, 0.55rem + 1.1vw, 1.1rem)
  cardPrice: "var(--fs-card-price)", // clamp(0.8rem, 0.55rem + 1.1vw, 1.1rem)
  cardDesc: "var(--fs-card-desc)", //  clamp(0.7rem, 0.58rem + 0.55vw, 0.85rem)
  cardBtn: "var(--fs-card-btn)", //   clamp(0.75rem, 0.66rem + 0.4vw, 0.85rem)
  cardTag: "var(--fs-card-tag)", //   clamp(0.55rem, 0.5rem + 0.2vw, 0.65rem)
  sectionTitle: "var(--fs-section-title)", // clamp(1.5rem, 3vw, 2.5rem)
};

/** Global heading clamp sizes + letter-spacing (uppercase, weight 400, lh 0.9). */
export const heading = {
  h1: { fontSize: "clamp(4rem, 10vw, 10rem)", letterSpacing: "clamp(-0.15rem, -1vw, -0.25rem)" },
  h2: { fontSize: "clamp(3.25rem, 8vw, 8rem)", letterSpacing: "clamp(-0.0125rem, -0.75vw, -0.2rem)" },
  h3: { fontSize: "clamp(2.5rem, 6.5vw, 5rem)", letterSpacing: "clamp(-0.035rem, -0.5vw, -0.075rem)" },
  h4: { fontSize: "clamp(2rem, 4.5vw, 4rem)", letterSpacing: "clamp(0rem, -0.5vw, -0.075rem)" },
  h5: { fontSize: "clamp(1.25rem, 2vw, 3rem)", letterSpacing: "clamp(0rem, -0.25vw, -0.05rem)" },
  lineHeight: 0.9,
  weight: 400,
  textTransform: "uppercase",
};

/** Body text sizes. */
export const body = {
  base: "clamp(0.8rem, 0.75vw, 0.85rem)",
  md: "clamp(1rem, 0.8vw, 1.25rem)",
  lg: "clamp(1.1rem, 0.85vw, 1.35rem)",
  bodyCopy: "clamp(1.125rem, 0.75vw, 1.25rem)",
  bodyCopyMd: "clamp(1.25rem, 0.85vw, 1.35rem)",
  bodyCopyLg: "clamp(1.375rem, 0.95vw, 1.45rem)",
  lineHeight: 1.2,
  lineHeightCopy: 1.5,
};

/** Default button typography (matches the global `button` rule). */
export const button = {
  fontSize: "clamp(0.85rem, 1vw, 0.85rem)",
  fontFamily: "var(--font-body)",
  weight: 500,
  lineHeight: 1,
  textTransform: "uppercase",
  padding: "1.25rem 0.75rem",
  radius: "0.5rem",
};

export const weight = { regular: 400, medium: 500, semibold: 600 };

const typography = { fontFamily, fontSizeToken, heading, body, button, weight };
export default typography;
