// Versioned downloads contain only runtime/model data. All inference stays on-device.
// The model is self-hosted (public/models) so slow venue Wi-Fi to Google storage
// cannot stall camera setup; the pinned official URL remains as a fallback.
export const MODEL_URL = new URL(
  `${import.meta.env.BASE_URL}models/pose_landmarker_lite.task`,
  window.location.href,
).href;
export const FALLBACK_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
// Absolute on purpose: in dev, Vite rewrites MediaPipe's dynamic import(loaderPath) with
// __vite__injectQuery, which appends ?import to root-relative paths ('/wasm/...') and makes
// Vite refuse them as public-dir imports. Full URLs are left untouched in dev and build.
export const WASM_ROOT = new URL(
  `${import.meta.env.BASE_URL}wasm`,
  window.location.href,
).href;
