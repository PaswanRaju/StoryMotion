/**
 * Pure choreography for the Tortoise and the Hare forest scene. Everything is a
 * function of story time (ms) so the renderer can sample it at 60 fps and tests can
 * check it without a browser. Story beats (animatedBeats.ts) change at 8/18/28/35 s.
 */
export const VIEW = { width: 1920, height: 1080 } as const;
export const WORLD_WIDTH = 5400;
export const CLOUD_TILE = VIEW.width;
/** Character SVG boxes; the feet/ground point is at (0, 0) inside each box. */
export const TORTOISE_BOX = { x: -150, y: -235, w: 370, h: 265 } as const;
export const HARE_BOX = { x: -135, y: -320, w: 290, h: 350 } as const;
/** Fork signpost box; (0, 0) is the post's foot, 105 px above Tortoise's lane. */
export const FORK_BOX = { x: -700, y: -330, w: 1680, h: 470 } as const;
export const MARKS = {
  tortoiseStart: 400,
  hareStart: 780,
  nap: 3000,
  /** Signpost where the trail splits (Tortoise reaches it at the path invitation). */
  fork: 3660,
  finish: 4650,
} as const;
/** Ground lines (stage px). Tortoise walks the near lane, Hare the far lane. */
export const LANES = { tortoise: 925, hare: 860 } as const;
const TORTOISE_START_S = 3;
const TORTOISE_FINISH_S = 31;
const TORTOISE_SPEED =
  (MARKS.finish - MARKS.tortoiseStart) / (TORTOISE_FINISH_S - TORTOISE_START_S);
const TORTOISE_STOP = MARKS.finish + 110;
export const BOOST_DISTANCE = 320;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** Smoothstep between seconds a and b. */
export const ease = (a: number, b: number, s: number) => {
  const x = clamp01((s - a) / (b - a));
  return x * x * (3 - 2 * x);
};

export type TortoiseMood = 'idle' | 'walk' | 'cheer';
export type HareState =
  | 'laugh'
  | 'run'
  | 'confident'
  | 'yawn'
  | 'sleep'
  | 'wake'
  | 'surprised'
  | 'celebrate';

/** boostAt: story ms at which a magic speed boost began, if any. */
export function tortoiseX(ms: number, boostAt: number | null = null) {
  const s = ms / 1000;
  const base =
    MARKS.tortoiseStart + Math.max(0, s - TORTOISE_START_S) * TORTOISE_SPEED;
  const boost =
    boostAt === null
      ? 0
      : BOOST_DISTANCE * ease(boostAt / 1000, boostAt / 1000 + 4, s);
  return Math.min(TORTOISE_STOP, base + boost);
}

/** Tortoise's locomotion only; characterState.ts layers story reactions on top. */
export function tortoiseMood(
  ms: number,
  boostAt: number | null = null,
): TortoiseMood {
  if (ms < TORTOISE_START_S * 1000) return 'idle';
  return tortoiseX(ms, boostAt) >= TORTOISE_STOP ? 'cheer' : 'walk';
}

export function hareX(ms: number) {
  const s = ms / 1000;
  if (s < 3) return MARKS.hareStart;
  if (s < 8.5) return lerp(MARKS.hareStart, MARKS.nap, ease(3, 8.5, s));
  if (s < 29.3) return MARKS.nap;
  return lerp(MARKS.nap, MARKS.finish - 240, ease(29.3, 33.8, s));
}

/** Hare's whole arc is scripted: brag, dash, smug wait, nap, wake, chase, applaud. */
export function hareState(ms: number): HareState {
  const s = ms / 1000;
  if (s < 3) return 'laugh';
  if (s < 8.5) return 'run';
  if (s < 16) return 'confident';
  if (s < 18) return 'yawn';
  if (s < 28) return 'sleep';
  if (s < 29.3) return 'wake';
  if (s < 33.8) return 'run';
  if (s < 35.2) return 'surprised'; // Tortoise already won!
  return 'celebrate';
}

/** Hare glances back at the slow Tortoise while waiting smugly. */
export const hareFacesLeft = (ms: number) => ms >= 10000 && ms < 14500;

export type Camera = { x: number; zoom: number };

/** Left edge of the 1920-wide view in world px, plus a gentle zoom. */
export function camera(
  ms: number,
  boostAt: number | null = null,
  reducedMotion = false,
): Camera {
  const s = ms / 1000;
  const hare = hareX(ms) + 200;
  const tortoise = tortoiseX(ms, boostAt) + 400;
  let center = 900;
  center = lerp(center, hare, ease(3, 5.5, s)); // follow the dash
  center = lerp(center, tortoise, ease(7.5, 9.5, s)); // meanwhile, back to Tortoise (before the first invitation)
  // Frame both while Tortoise passes the sleeping Hare.
  center = lerp(
    center,
    (hare + tortoise) / 2,
    ease(16, 18, s) * (1 - ease(24.5, 26.5, s)),
  );
  // Hare wakes up! Frame him and the (possibly glowing, boosted) Tortoise ahead.
  center = lerp(
    center,
    (MARKS.nap + 60 + tortoiseX(ms, boostAt) + 260) / 2,
    ease(27.4, 28.4, s),
  );
  center = lerp(center, MARKS.finish + 80, ease(29.6, 31.2, s)); // the finish
  const x = Math.max(
    0,
    Math.min(WORLD_WIDTH - VIEW.width, center - VIEW.width / 2),
  );
  const zoom = reducedMotion
    ? 1
    : 1 +
      0.06 * (1 - ease(0, 4, s)) +
      0.05 * ease(18, 21, s) * (1 - ease(24, 27, s)) +
      0.1 * ease(31, 35, s);
  return { x, zoom };
}

/**
 * After a path choice the camera drifts a little toward the chosen side, then settles.
 * dir: -1 left/shady, +1 right/sunny. Returns a world-px offset for camera x.
 */
export function pathNudge(ms: number, at: number | null, dir: -1 | 1) {
  if (at === null) return 0;
  const s = ms / 1000,
    a = at / 1000;
  return dir * 90 * ease(a, a + 1.2, s) * (1 - ease(a + 3.5, a + 5.5, s));
}

/** Parallax factors: how fast each layer scrolls relative to the ground. */
export const PARALLAX = {
  clouds: 0.06,
  hills: 0.15,
  farTrees: 0.32,
  midTrees: 0.6,
  ground: 1,
  foreground: 1.35,
} as const;
export const layerWidth = (factor: number) =>
  Math.ceil(VIEW.width + (WORLD_WIDTH - VIEW.width) * factor) + 40;

/** World → stage px, matching the zoom applied around the stage center. */
export function toStage(x: number, y: number, cam: Camera) {
  return {
    x: (x - cam.x - VIEW.width / 2) * cam.zoom + VIEW.width / 2,
    y: (y - VIEW.height / 2) * cam.zoom + VIEW.height / 2,
  };
}

export const FINISH_CROSSED_MS = TORTOISE_FINISH_S * 1000;
export const ENDING_CARD_MS = 35500;
