/**
 * Pure choreography for Jack and the Beanstalk. Everything is a function of story
 * time (ms), so the renderer samples it at display rate and tests run without a
 * browser. The world is TALL: the camera travels from the cottage garden up the
 * beanstalk to the cloud kingdom, cuts inside the giant's castle, then glides home.
 *
 * World coordinates: x 0–1920, y 0 (sky top) → WORLD_H (below the garden).
 */
import { ease } from '../forest/timeline';

export const VIEW = { width: 1920, height: 1080 } as const;
export const WORLD_H = 5600;
/** Jack's feet on the garden path. */
export const GROUND_Y = 5380;
/** Jack's feet on top of the cloud kingdom. */
export const CLOUD_Y = 980;
export const STALK_X = 1150;
/** The stalk's top, buried in the cloud floor. */
export const STALK_TOP_Y = 900;
export const COTTAGE_X = 460;
/** Camera tops for the two "home" views. */
export const GROUND_VIEW = GROUND_Y - 860;
export const CLOUD_VIEW = CLOUD_Y - 820;
/** Interior (castle) set: floor line in stage px. */
export const INSIDE_FLOOR = 1000;
export const JACK_BOX = { x: -110, y: -330, w: 220, h: 345 } as const;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Gentle S-curve of the stalk; the growing tip and the climbing Jack both follow it. */
export const stalkX = (y: number) =>
  STALK_X + 70 * Math.sin(y / 420) + 28 * Math.sin(y / 170 + 1);

/** 0 → 1: how much of the beanstalk has grown (staged, fast in the middle). */
export function growth(ms: number) {
  const s = ms / 1000;
  return ease(12.2, 17.6, s);
}
/** The little sprout that appears when the beans are planted. */
export const sproutScale = (ms: number) => ease(11.2, 11.9, ms / 1000);
export const tipY = (ms: number) =>
  GROUND_Y - growth(ms) * (GROUND_Y - STALK_TOP_Y);

export type JackState =
  | 'idle'
  | 'walk'
  | 'curious'
  | 'beans'
  | 'plant'
  | 'surprised'
  | 'lookUp'
  | 'climb'
  | 'scared'
  | 'sneak'
  | 'run'
  | 'glide'
  | 'slide'
  | 'celebrate';

export type JackPlan = {
  /** Side Jack swings to on the climb (−1 left, +1 right), and when. */
  dodge: { side: -1 | 1; at: number; byChild: boolean } | null;
  /** How Jack gets home: a magic leaf glider (child) or sliding down (auto). */
  glide: { at: number; byChild: boolean } | null;
};
export type JackPose = {
  x: number;
  /** World y of the feet (outside) or stage y (inside the castle). */
  y: number;
  state: JackState;
  inside: boolean;
  facing: 1 | -1;
  scale: number;
};

/** Climb progress with two little pauses to look up. */
function climbK(s: number) {
  if (s < 21) return 0.32 * ease(18, 21, s);
  if (s < 21.8) return 0.32;
  if (s < 24) return lerp(0.32, 0.56, ease(21.8, 24, s));
  if (s < 24.9) return 0.56;
  return lerp(0.56, 1, ease(24.9, 27.6, s));
}
export const DESCENT = { start: 40.6, end: 45.4 } as const;

export function jack(ms: number, plan: JackPlan): JackPose {
  const s = ms / 1000;
  const out = (x: number, y: number, state: JackState, facing: 1 | -1 = 1): JackPose => ({
    x,
    y,
    state,
    inside: false,
    facing,
    scale: 1,
  });
  if (s < 3) return out(lerp(COTTAGE_X + 150, 860, ease(0, 3, s)), GROUND_Y, 'walk');
  if (s < 7) return out(860, GROUND_Y, 'curious');
  if (s < 10.5) return out(860, GROUND_Y, 'beans');
  if (s < 11.6) return out(860, GROUND_Y, 'plant');
  if (s < 12.2) return out(860, GROUND_Y, 'curious');
  if (s < 15) return out(lerp(860, 820, ease(12.2, 12.8, s)), GROUND_Y, 'surprised');
  if (s < 18) return out(lerp(820, stalkX(GROUND_Y) - 90, ease(16.8, 18, s)), GROUND_Y, 'lookUp');
  if (s < 28) {
    const y = lerp(GROUND_Y - 40, CLOUD_Y + 10, climbK(s));
    let x = stalkX(y) - 80;
    const d = plan.dodge;
    if (d) {
      const a = d.at / 1000;
      x += d.side * 190 * ease(a, a + 0.6, s) * (1 - ease(a + 2.4, a + 3.2, s));
    }
    const pausing = (s >= 21 && s < 21.8) || s >= 27.6;
    let state: JackState = pausing ? 'lookUp' : 'climb';
    if (d?.byChild && s >= d.at / 1000 && s < d.at / 1000 + 0.9) state = 'celebrate';
    return out(x, y, state);
  }
  if (s < 30.5)
    return out(lerp(stalkX(CLOUD_Y) - 40, 1380, ease(28, 30.5, s)), CLOUD_Y, 'walk');
  if (s < 33) return out(1380, CLOUD_Y, 'curious');
  if (s < 40) {
    const pose: JackPose = {
      x: lerp(230, 1180, ease(33.3, 39.4, s)),
      y: INSIDE_FLOOR,
      state: s < 39.4 ? 'sneak' : 'curious',
      inside: true,
      facing: 1,
      scale: 0.5,
    };
    return pose;
  }
  if (s < DESCENT.start && !plan.glide)
    // Still at the castle when the giant stirs (the invitation holds story time here).
    return { x: 1180, y: INSIDE_FLOOR, state: 'scared', inside: true, facing: 1, scale: 0.5 };
  if (s < DESCENT.end + 0.4) {
    const k = ease(DESCENT.start, DESCENT.end, s);
    const y = lerp(CLOUD_Y, GROUND_Y, k);
    if (plan.glide?.byChild)
      return out(STALK_X - 120 + 260 * Math.sin((s - 40) * 1.5) * (1 - k * 0.6), y, k >= 1 ? 'celebrate' : 'glide');
    return out(stalkX(y) - 80, y, k >= 1 ? 'celebrate' : 'slide');
  }
  return out(lerp(STALK_X - 120, 900, ease(45.8, 47.4, s)), GROUND_Y, s < 47.4 ? 'run' : 'celebrate', -1);
}

export type BeanCamera = {
  /** World y at the top of the view. */
  y: number;
  zoom: number;
  /** Stage-space focus point for the zoom (keeps Jack framed). */
  fx: number;
  fy: number;
};

/** Camera that follows the story: garden → rising tip → climbing Jack → castle reveal → descent. */
export function camera(ms: number, plan: JackPlan, reduced = false): BeanCamera {
  const s = ms / 1000;
  const j = jack(ms, plan);
  let y = GROUND_VIEW;
  let zoom = 1;
  if (s < 12.4) {
    zoom += 0.05 * (1 - ease(0, 3, s)); // opening push
    zoom += 0.16 * ease(7, 9, s) * (1 - ease(11.4, 12.4, s)); // the glowing beans
  } else if (s < 18) {
    // Follow the growing tip upward; clouds slide into frame.
    y = lerp(GROUND_VIEW, tipY(ms) - 360, ease(12.4, 13.6, s));
  } else if (s < 28) {
    // Lower the camera around the dodge so the tumbling cloud shows under the prompt card.
    y = j.y - 720 - 250 * ease(22.6, 23.8, s) * (1 - ease(25.2, 26.4, s));
  } else if (s < 33) {
    // Reveal: rise past the cloud floor to show the castle above.
    y = lerp(CLOUD_VIEW + 120, CLOUD_VIEW - 120, ease(28.6, 32, s));
    zoom = 1 + 0.12 * (1 - ease(28.2, 31.5, s));
  } else if (j.inside) {
    y = CLOUD_VIEW;
    zoom = 1.02;
  } else if (s < DESCENT.end + 0.4) {
    y = j.y - 640;
  } else {
    y = GROUND_VIEW;
    zoom = 1 + 0.1 * ease(47, 50, s);
  }
  y = Math.max(0, Math.min(WORLD_H - VIEW.height, y));
  if (reduced) zoom = 1;
  const fx = j.inside ? j.x : j.x;
  const fy = j.inside ? j.y - 80 : j.y - y - 140;
  return { y, zoom, fx, fy };
}

/** 0 (garden) → 1 (cloud kingdom): drives the sky colour. */
export const altitude = (cam: BeanCamera) => clamp01(1 - cam.y / GROUND_VIEW);
/** Sunset warmth for the ending. */
export const sunset = (ms: number) => ease(44, 48, ms / 1000);

/** The tumbling cloud on the climb: hovers above Jack, then falls past down the middle. */
export function obstacle(ms: number, plan: JackPlan) {
  const s = ms / 1000;
  const top = lerp(GROUND_Y - 40, CLOUD_Y + 10, 0.56) - 520;
  if (s < 22.6) return null;
  const at = plan.dodge ? plan.dodge.at / 1000 : null;
  let y = lerp(top - 700, top, ease(22.6, 24, s));
  if (at !== null && s > at) y = top + (s - at) * 950;
  if (at !== null && s > at + 2.6) return null;
  return { x: STALK_X - 20, y, spin: s * 40 };
}

/** A flock of birds crossing the climb. */
export function birds(ms: number) {
  const s = ms / 1000;
  if (s < 18.6 || s > 23) return null;
  return { x: lerp(-300, 2300, (s - 18.6) / 4.4), y: lerp(GROUND_Y - 40, CLOUD_Y, climbK(s)) - 380 };
}

/** Interior beats. */
export const INSIDE = { start: 33, end: 40 } as const;
export const isInside = (ms: number, gliding: boolean) =>
  ms >= INSIDE.start * 1000 && (ms < INSIDE.end * 1000 || !gliding);
export const ENDCARD_MS = 50000;
export const LANDING_MS = DESCENT.end * 1000;

export const layerHeight = (factor: number) =>
  Math.ceil(VIEW.height + (WORLD_H - VIEW.height) * factor) + 40;
export const PARALLAX = { far: 0.22, mid: 0.6, ground: 1, fore: 1.4 } as const;

/** Leaves along the stalk: `at` is the growth fraction where each one unfolds. */
export const STALK_LEAVES = Array.from({ length: 30 }, (_, i) => {
  const at = 0.03 + (i / 30) * 0.95;
  const y = GROUND_Y - at * (GROUND_Y - STALK_TOP_Y);
  return { at, x: stalkX(y), y, side: i % 2 ? 1 : -1, s: 0.8 + ((i * 37) % 10) / 20 };
});
/** Fallback when the browser cannot measure the stalk path. */
export const STALK_LENGTH_GUESS = GROUND_Y - STALK_TOP_Y + 900;

