/**
 * 3D abstractions barrel. WebGL renderer + scene/camera/loop boilerplate
 * extracted from the Orb, plus the Orb component itself.
 */
export {
  createRenderer,
  mountRenderer,
  disposeRenderer,
  attachResize,
} from "./WebGLCanvas";
export {
  createScene,
  createOrbitControls,
  startRenderLoop,
} from "./SceneWrapper";
export { default as Orb } from "./Orb";
