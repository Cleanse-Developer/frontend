"use client";
/**
 * WebGLCanvas — reusable Three.js renderer boilerplate.
 *
 * Extracted verbatim from components/Orb/Orb.jsx so any 3D component can create
 * a renderer with the same colour space / pixel-ratio / transparency settings
 * and mount it into a container.
 */
import * as THREE from "three";

/** Create a configured transparent, high-performance WebGL renderer. */
export function createRenderer({ width, height } = {}) {
  const w = width ?? (typeof window !== "undefined" ? window.innerWidth : 1);
  const h = height ?? (typeof window !== "undefined" ? window.innerHeight : 1);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}

/** Append the renderer's canvas to a container element. */
export function mountRenderer(renderer, container) {
  if (container && renderer?.domElement) container.appendChild(renderer.domElement);
  return renderer;
}

/** Dispose + detach a renderer (call in cleanup). */
export function disposeRenderer(renderer) {
  if (!renderer) return;
  renderer.dispose();
  renderer.domElement?.parentNode?.removeChild(renderer.domElement);
}

/** Keep a renderer + camera sized to the window (returns a remover). */
export function attachResize(renderer, camera) {
  if (typeof window === "undefined") return () => {};
  const onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    if (camera) {
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  };
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}

export default createRenderer;
