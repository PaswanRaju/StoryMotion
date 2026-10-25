// Versioned downloads contain only runtime/model data. All inference stays on-device.
// The model is self-hosted (public/models) so slow venue Wi-Fi to Google storage
// cannot stall camera setup; the pinned official URL remains as a fallback.
export const MODEL_URL = new URL(
  `${import.meta.env.BASE_URL}models/pose_landmarker_lite.task`,
  window.location.href,
).href;
export const FALLBACK_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
export const WASM_ROOT =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm';
