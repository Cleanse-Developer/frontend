/**
 * Cleanse UI Library — single entry point.
 *
 *   import { Button, ProductCard, Modal, Section, fadeInUp } from "@/ui";
 *
 * Categories: primitives, layout, navigation, forms, overlays, feedback,
 * commerce, animations, 3d. See docs/COMPONENT_MAP.md for sources & migration.
 *
 * Note: the global design-system styles (tokens + utilities) are loaded once in
 * src/app/layout.js via `@/design-system/styles/index.css`.
 */
export * from "./primitives";
export * from "./layout";
export * from "./navigation";
export * from "./forms";
export * from "./overlays";
export * from "./feedback";
export * from "./commerce";
export * from "./animations";
export * from "./3d";

// Design tokens (JS values) are also re-exported for convenience.
export * as tokens from "@/design-system/tokens";
