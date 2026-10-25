import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Pure easing helpers in milliseconds, shared by every storybook scene. */
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** Linear 0 → 1 between a and b. */
export const lin = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
/** Smoothstep 0 → 1 between a and b. */
export const ease = (t: number, a: number, b: number) => {
  const x = lin(t, a, b);
  return x * x * (3 - 2 * x);
};
/** Ease-out with a small overshoot (anticipation/settle for pops and landings). */
export const pop = (t: number, a: number, b: number) => {
  const x = lin(t, a, b);
  if (x === 0) return 0;
  return 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2;
};
/** Rises 0 → 1 over [a, b], holds, then falls back over [c, d]. */
export const span = (t: number, a: number, b: number, c: number, d: number) =>
  ease(t, a, b) * (1 - ease(t, c, d));
/** Sine wave with period in ms. */
export const wave = (time: number, periodMs: number, phase = 0) =>
  Math.sin((time / periodMs) * Math.PI * 2 + phase);
/** Keyframed path: piecewise smooth interpolation between [time, value] keys. */
export function keys(t: number, frames: readonly (readonly [number, number])[]) {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++) {
    const [b, vb] = frames[i];
    if (t <= b) {
      const [a, va] = frames[i - 1];
      return lerp(va, vb, ease(t, a, b));
    }
  }
  return frames[frames.length - 1][1];
}
/** Deterministic pseudo-random in [0, 1) for particle layouts. */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Smooth story time for rendering. `elapsed` (story time) arrives from the player
 * about five times a second; between updates this extrapolates at display rate.
 * Story time freezes while `frozen` (paused, or an invitation holds the story).
 * `idle` is a second clock that keeps running while the story holds (breathing,
 * blinking, drifting clouds) and stops only while paused.
 */
export function useStoryClock(elapsed: number, paused: boolean, holding: boolean) {
  const [now, setNow] = useState({ t: elapsed, idle: 0 });
  const ref = useRef({ base: elapsed, at: 0, paused, holding, shown: elapsed, idle: 0 });
  useLayoutEffect(() => {
    Object.assign(ref.current, {
      base: elapsed,
      at: performance.now(),
      paused,
      holding,
    });
  });
  useEffect(() => {
    if (typeof requestAnimationFrame !== 'function') return;
    let frame = 0;
    let last = performance.now();
    const loop = (time: number) => {
      const c = ref.current;
      const dt = Math.min(100, Math.max(0, time - last));
      last = time;
      if (!c.paused) c.idle += dt;
      if (Math.abs(c.shown - c.base) > 1000) c.shown = c.base; // restart or seek
      else if (c.holding && !c.paused) c.shown = c.base;
      else if (!c.paused) {
        const candidate = Math.min(c.base + (time - c.at), c.base + 400);
        // Small backwards corrections are ignored (no jitter).
        if (!(candidate < c.shown && c.shown - candidate < 500)) c.shown = candidate;
      }
      setNow((prev) =>
        prev.t === c.shown && Math.abs(prev.idle - c.idle) < 1 ? prev : { t: c.shown, idle: c.idle },
      );
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);
  // Never drift far from story time, even if the display loop stalls or is throttled.
  // (The display loop re-syncs its own position from `base` on its next frame.)
  if (Math.abs(now.t - elapsed) > 600) setNow({ t: elapsed, idle: now.idle });
  // Without a display loop (tests, very old browsers) render story time directly.
  return typeof requestAnimationFrame === 'function' ? now : { t: elapsed, idle: 0 };
}
