/**
 * Breakpoint tokens — the distinct viewport widths used across the codebase,
 * plus small helpers to build media-query strings. Values are in pixels.
 *
 * Notable orientation/feature queries used in the project (not numeric widths):
 *   - "(orientation: portrait)" paired with max-width:1199 for tablet-portrait rules
 *   - "(hover: hover)" to scope hover-only styles away from touch devices
 *   - "(prefers-reduced-motion: reduce)" to disable animations
 */
export const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  tabletPortrait: 1199, // upper bound of the tablet-portrait layout
  xl: 1300, // base --page-max
  xxl: 1440,
  wide: 1920,
  ultra: 2560,
};

/** `up(768)` → "(min-width: 768px)" */
export const up = (px) => `(min-width: ${px}px)`;
/** `down(768)` → "(max-width: 768px)" */
export const down = (px) => `(max-width: ${px}px)`;
/** Tablet-portrait query used widely in the project. */
export const tabletPortraitQuery =
  "(max-width: 1199px) and (orientation: portrait)";

const bp = { breakpoints, up, down, tabletPortraitQuery };
export default bp;
