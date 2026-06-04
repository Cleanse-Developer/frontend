/**
 * Color tokens — JS mirror of the brand palette defined in src/app/globals.css `:root`.
 *
 * The CSS custom properties (`--base-100` … `--base-700`) remain the runtime
 * source of truth for styling. These exports are for JS consumption (e.g. Three.js
 * clear colors, inline canvas fills, charts) and for documentation. Values are
 * copied verbatim from globals.css — do not diverge.
 */

/** Earthy-brown brand scale (light → dark). Mirrors `--base-100`…`--base-700`. */
export const base = {
  100: "#E7D0A6", // Light Cream — primary background
  200: "#9E9268", // Olive Brown — light accent
  300: "#84592C", // Medium Brown — medium accent
  400: "#722F14", // Dark Reddish Brown — UI elements
  500: "#5A2510", // Deep Brown — secondary text
  600: "#422D1C", // Very Dark Brown — near dark
  700: "#2E1F14", // Darkest Brown — primary text / dark backgrounds
};

/** Each brand step as its CSS variable reference, for use in inline styles. */
export const baseVar = {
  100: "var(--base-100)",
  200: "var(--base-200)",
  300: "var(--base-300)",
  400: "var(--base-400)",
  500: "var(--base-500)",
  600: "var(--base-600)",
  700: "var(--base-700)",
};

/**
 * Named raw colors that recur across component CSS but are NOT in `:root`.
 * Documented here so future work can promote them to variables if desired.
 */
export const surface = {
  cream: "#F0EDE8", // hero / section bands (home, wardrobe, cart, footer, ritual…)
  white: "#FFFFFF", // product cards, content areas
  gold: "#C8AD73", // footer bg, hero button, breadcrumb accent
  tan: "#D9C9A8", // featured/bento card bg, icon bg
  deepBrown: "#663532", // contact-form card bg, cart accents
  cocoa: "#442824", // hero header text, deep copy
  blogBrown: "#4F2C22", // blog section bg, category title
  saddle: "#8B5A2B", // menu logo / link accent
  goldMark: "#E5AD07", // logo registered-mark
  near: "#1a1a1a", // footer text / borders
};

const colors = { base, baseVar, surface };
export default colors;
