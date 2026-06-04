"use client";
/**
 * Orb — re-export of the existing Three.js orb (components/Orb/Orb.jsx).
 *
 * The orb (Fibonacci-sphere of image-textured planes with rounded-corner
 * alphaMap + OrbitControls) is preserved 1:1. Its internal renderer/scene/loop
 * could be migrated onto WebGLCanvas + SceneWrapper in a later pass — see
 * docs/COMPONENT_MAP.md. Until then this exposes it through the UI library.
 *
 *   import { Orb } from "@/ui";
 */
export { default } from "@/components/Orb/Orb";
export { default as Orb } from "@/components/Orb/Orb";
