"use client";
/**
 * SceneWrapper — reusable Three.js scene/camera/controls/loop boilerplate.
 *
 * Extracted verbatim from components/Orb/Orb.jsx. Compose with WebGLCanvas:
 *
 *   const renderer = createRenderer();
 *   mountRenderer(renderer, container);
 *   const { scene, camera } = createScene();
 *   const controls = createOrbitControls(camera, renderer.domElement);
 *   const loop = startRenderLoop({ renderer, scene, camera, controls });
 *   // cleanup: loop.stop(); disposeRenderer(renderer);
 */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

/** Scene + perspective camera matching Orb's defaults. */
export function createScene({ fov = 75, near = 0.1, far = 1000, cameraZ = 10 } = {}) {
  const scene = new THREE.Scene();
  const aspect = typeof window !== "undefined" ? window.innerWidth / window.innerHeight : 1;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = cameraZ;
  return { scene, camera };
}

/** Damped OrbitControls matching Orb's interaction config. */
export function createOrbitControls(camera, domElement, overrides = {}) {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 1.2;
  controls.minDistance = 6;
  controls.maxDistance = 10;
  controls.enableZoom = true;
  controls.enablePan = false;
  Object.assign(controls, overrides);
  return controls;
}

/** requestAnimationFrame render loop with optional controls + per-frame hook. */
export function startRenderLoop({ renderer, scene, camera, controls, onFrame }) {
  let id = null;
  let running = true;
  const tick = () => {
    if (!running) return;
    id = requestAnimationFrame(tick);
    if (controls) controls.update();
    if (onFrame) onFrame();
    renderer.render(scene, camera);
  };
  tick();
  return {
    stop() {
      running = false;
      if (id) cancelAnimationFrame(id);
    },
  };
}

export default createScene;
