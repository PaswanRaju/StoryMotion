import { describe, expect, it } from 'vitest';
import {
  camera,
  hareState,
  hareX,
  MARKS,
  tortoiseMood,
  pathNudge,
  tortoiseX,
  VIEW,
  WORLD_WIDTH,
} from '../rendering/forest/timeline';
import { tortoiseState, TIRED_FROM_MS } from '../rendering/forest/characterState';
import type { Reaction } from '../rendering/forest/characterState';
import { ParticleField } from '../rendering/forest/particles';
import {
  activateShield,
  boostBurst,
  celebrationBurst,
  pathHighlight,
} from '../rendering/forest/effects';

describe('forest race choreography', () => {
  it('keeps the classic story: Hare naps, Tortoise passes and wins, Hare finishes behind', () => {
    expect(hareState(20000)).toBe('sleep');
    expect(tortoiseX(22000)).toBeGreaterThan(hareX(22000));
    expect(tortoiseX(31000)).toBeGreaterThanOrEqual(MARKS.finish);
    expect(hareX(31000)).toBeLessThan(MARKS.finish);
    for (let ms = 31000; ms <= 42000; ms += 500)
      expect(hareX(ms)).toBeLessThan(tortoiseX(ms) - 150);
    expect(tortoiseMood(36000)).toBe('cheer');
    expect(hareState(36000)).toBe('celebrate');
  });

  it('a magic boost moves Tortoise ahead but never past the finish stop', () => {
    expect(tortoiseX(14000, 10000)).toBeGreaterThan(tortoiseX(14000));
    expect(tortoiseX(42000, 10000)).toBe(tortoiseX(42000));
  });

  it('moves continuously (no teleporting) and keeps the camera inside the world', () => {
    for (let ms = 0; ms <= 42000; ms += 50) {
      expect(Math.abs(tortoiseX(ms + 50) - tortoiseX(ms))).toBeLessThan(40);
      expect(Math.abs(hareX(ms + 50) - hareX(ms))).toBeLessThan(40);
      const a = camera(ms).x;
      expect(a).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual(WORLD_WIDTH - VIEW.width);
      // Smooth pans everywhere except the quick cut hidden by the fade at 27–28.8 s.
      if (ms < 27000 || ms > 28800)
        expect(Math.abs(camera(ms + 50).x - a)).toBeLessThan(80);
    }
  });

  it('turns camera zoom off for reduced motion', () => {
    expect(camera(33000, null, true).zoom).toBe(1);
    expect(camera(33000).zoom).toBeGreaterThan(1);
  });

  it('drifts the camera toward the chosen path, then settles back', () => {
    expect(pathNudge(21500, null, 1)).toBe(0);
    expect(pathNudge(23000, 21500, -1)).toBeLessThan(-80);
    expect(pathNudge(23000, 21500, 1)).toBeGreaterThan(80);
    expect(pathNudge(30000, 21500, 1)).toBe(0);
  });
});

describe('tortoise animation states', () => {
  const state = (t: number, open: Reaction['moment'] | null, reactions: Reaction[] = [], boostAt: number | null = null) =>
    tortoiseState({ t, open, reactions, boostAt });
  it('follows the story: idle, walk, worried/ponder/tired while asked, celebrate', () => {
    expect(state(1000, null)).toBe('idle');
    expect(state(8000, null)).toBe('walk');
    expect(state(11000, 'shield')).toBe('worried');
    expect(state(21500, 'path')).toBe('ponder');
    expect(state(26000, 'boost')).toBe('tired');
    expect(state(TIRED_FROM_MS + 500, null)).toBe('tired');
    expect(state(36000, null)).toBe('celebrate');
  });
  it('reacts to gestures with magic, then an energized boost', () => {
    const shield: Reaction = { moment: 'shield', outcome: 'ARMS_WIDE', at: 11000 };
    expect(state(11200, null, [shield])).toBe('magic');
    expect(state(13000, null, [shield])).toBe('walk');
    const boost: Reaction = { moment: 'boost', outcome: 'HAND_RAISE', at: 26000 };
    expect(state(26500, null, [boost], 26000)).toBe('magic');
    expect(state(28000, null, [boost], 26000)).toBe('energized');
  });
  it('tucks in safely when the shield moment resolves on its own', () => {
    const auto: Reaction = { moment: 'shield', outcome: 'auto', at: 11000 };
    expect(state(11500, null, [auto])).toBe('tuck');
    expect(state(13500, null, [auto])).toBe('walk');
  });
});

describe('gesture effects', () => {
  it('stay bounded and clean themselves up', () => {
    const field = new ParticleField();
    const p = { x: 1000, y: 800 };
    activateShield(field, p);
    boostBurst(field, p);
    pathHighlight(field, p, true, 0, 1920);
    celebrationBurst(field, p);
    expect(field.count).toBeGreaterThan(100);
    expect(field.count).toBeLessThanOrEqual(450);
    for (let i = 0; i < 400; i++) field.update(0.05, null);
    expect(field.count).toBe(0);
  });
  it('stages the shield: a delayed ring is invisible until it starts', () => {
    const field = new ParticleField();
    field.add('ring', 0, 0, { delay: 0.5, max: 0.5, size: 200 });
    field.update(0.3, null);
    expect(field.count).toBe(1);
    field.update(0.6, null);
    field.update(0.5, null);
    expect(field.count).toBe(0);
  });
});
