/**
 * Spacing tokens — JS mirror of the horizontal/vertical rhythm in globals.css `:root`.
 *
 * The CSS variables are responsive (they change at breakpoints, see the table
 * below). The JS exports below reference the variables so consumers stay in sync;
 * raw fallbacks document the base (desktop) values.
 */

/** Page gutter (horizontal padding). Responsive — see `gutterByBreakpoint`. */
export const gutter = "var(--gutter)"; // base 2rem
/** Standard centered content width. Responsive — see `pageMaxByBreakpoint`. */
export const pageMax = "var(--page-max)"; // base 1300px
/** Standard top/bottom padding for a content section. Responsive. */
export const sectionPy = "var(--section-py)"; // base 5rem

/** Documented responsive overrides (from globals.css `:root` media queries). */
export const gutterByBreakpoint = {
  base: "2rem",
  "max-1199-portrait": "1.5rem",
  "max-480": "1rem",
  "min-1440": "4rem",
  "min-1920": "5rem",
  "min-2560": "6rem",
};

export const pageMaxByBreakpoint = {
  base: "1300px",
  "min-1440": "1400px",
  "min-1920": "1700px",
  "min-2560": "2100px",
};

export const sectionPyByBreakpoint = {
  base: "5rem",
  "max-1199-portrait": "3.5rem",
  "max-480": "3rem",
  "min-1920": "6rem",
  "min-2560": "7rem",
};

/**
 * General-purpose spacing scale (0.25rem steps) covering the padding/margin/gap
 * values observed across the codebase. Use for ad-hoc spacing in new components.
 */
export const space = {
  "3xs": "0.25rem",
  "2xs": "0.5rem",
  xs: "0.75rem",
  sm: "1rem",
  md: "1.25rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "2.5rem",
  "3xl": "3rem",
  "4xl": "4rem",
  "5xl": "5rem",
};

const spacing = {
  gutter,
  pageMax,
  sectionPy,
  gutterByBreakpoint,
  pageMaxByBreakpoint,
  sectionPyByBreakpoint,
  space,
};
export default spacing;
