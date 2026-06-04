/**
 * Design tokens barrel.
 *
 * JS-consumable mirror of the visual values defined in src/app/globals.css.
 * The CSS custom properties remain the runtime source of truth; import these
 * when you need the values in JavaScript (Three.js, canvas, inline styles) or
 * for documentation/tooling.
 *
 *   import { colors, spacing, typography, radius, shadows, breakpoints } from "@/design-system/tokens";
 */
export { default as colors } from "./colors";
export { default as spacing } from "./spacing";
export { default as typography } from "./typography";
export { default as radius } from "./radius";
export { default as shadows } from "./shadows";
export { default as breakpoints } from "./breakpoints";

export * from "./colors";
export * from "./spacing";
export * from "./typography";
export * from "./radius";
export * from "./shadows";
export * from "./breakpoints";
