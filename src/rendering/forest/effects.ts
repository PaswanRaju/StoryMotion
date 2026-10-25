import { CONFETTI_COLORS, LEAF_COLORS, SPARK_COLORS } from './particles';
import type { ParticleField } from './particles';

/**
 * Reusable gesture effects. Each one adds a bounded number of short-lived particles
 * to the scene's single ParticleField; nothing here owns a timer or animation loop,
 * so effects clean themselves up when their particles expire.
 * `amount` scales particle counts (reduced motion uses a fraction).
 */
type Point = { x: number; y: number };
const random = (a: number, b: number) => a + Math.random() * (b - a);
const n = (count: number, amount: number) => Math.round(count * amount);
export const GOLD = ['#fff4c2', '#ffd36e', '#ffe9a8', '#ffc14d'];

/** A radial puff of sparkles with a soft flash. */
export function spawnSparkles(
  field: ParticleField,
  p: Point,
  count: number,
  amount = 1,
  colors = SPARK_COLORS,
  speed = 420,
) {
  field.burst(p.x, p.y, n(count, amount), colors, speed);
}

/**
 * ARMS_WIDE: small spark → expanding golden ring → shield forms (the DOM bubble fades
 * in on the same beat) → sparks circle the bubble and drift away.
 */
export function activateShield(
  field: ParticleField,
  p: Point,
  amount = 1,
  radius = 220,
) {
  field.add('flash', p.x, p.y, { max: 0.45, size: 160, color: '#ffe9a8' });
  field.add('ring', p.x, p.y, { delay: 0.1, max: 0.8, size: radius * 1.25, color: '#ffd36e' });
  field.add('ring', p.x, p.y, { delay: 0.28, max: 0.9, size: radius, color: '#bfe6ff' });
  const sparks = n(36, amount);
  for (let i = 0; i < sparks; i++) {
    const a = (i / sparks) * Math.PI * 2;
    const r = radius * random(0.85, 1.05);
    field.add('spark', p.x + Math.cos(a) * r, p.y + Math.sin(a) * r * 0.75, {
      delay: 0.3 + (i / sparks) * 0.35,
      // Tangential: sparks sweep around the bubble, then lift away.
      vx: -Math.sin(a) * 260,
      vy: Math.cos(a) * 200 - 40,
      max: random(0.9, 1.4),
      size: random(5, 10),
      color: GOLD[i % GOLD.length],
      gravity: -30,
    });
  }
  field.burst(p.x, p.y, n(24, amount), ['#e6f6ff', '#8fd0ff', '#ffffff'], 420);
}

/** HAND_RAISE: bright sparkle bloom and a quick ring; the trail follows each frame. */
export function boostBurst(field: ParticleField, p: Point, amount = 1) {
  field.add('ring', p.x, p.y, { max: 0.7, size: 240, color: '#ffd36e' });
  field.burst(p.x, p.y, n(60, amount), GOLD, 520);
  spawnSparkles(field, { x: p.x, y: p.y - 60 }, 20, amount, SPARK_COLORS, 260);
}

/** Per-frame golden trail behind a moving character (call while the boost lasts). */
export function createMagicTrail(
  field: ParticleField,
  p: Point,
  dt: number,
  amount = 1,
) {
  if (Math.random() >= 45 * dt * amount) return;
  field.add('spark', p.x - 100, p.y + random(-60, 30), {
    vx: random(-220, -80),
    vy: random(-80, 40),
    max: 1,
    size: random(5, 10),
    gravity: 40,
    color: GOLD[Math.floor(random(0, GOLD.length))],
  });
}

/** Lean choice: the chosen side's sparkles or leaves drift down over the view. */
export function pathHighlight(
  field: ParticleField,
  p: Point,
  sunny: boolean,
  viewLeft: number,
  viewWidth: number,
  amount = 1,
) {
  field.burst(p.x, p.y, n(26, amount), sunny ? ['#ffd36e', '#fff4c2'] : ['#93d27a', '#c3e69a'], 300);
  for (let i = 0; i < n(26, amount); i++)
    field.add(sunny ? 'spark' : 'leaf', viewLeft + random(0, viewWidth), random(-40, 200), {
      vx: random(-40, 40),
      vy: random(60, 160),
      vr: random(-3, 3),
      max: random(3, 5),
      size: random(6, 14),
      gravity: 10,
      color: sunny ? '#ffe9a8' : LEAF_COLORS[i % 2],
    });
}

/** Finish line: a confetti cannon plus a sparkle bloom. */
export function celebrationBurst(field: ParticleField, p: Point, amount = 1) {
  for (let i = 0; i < 150 * amount; i++)
    field.add('confetti', p.x + random(-140, 140), p.y + random(-120, -40), {
      vx: random(-520, 520),
      vy: random(-760, -220),
      vr: random(-8, 8),
      gravity: 520,
      max: random(2.5, 4),
      size: random(14, 22),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    });
  field.burst(p.x, p.y, n(40, amount));
}
