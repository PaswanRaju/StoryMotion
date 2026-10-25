import { describe, expect, it } from 'vitest';
import { classifyHands, initialGestureState, stepGesture } from '../vision/magicGesture';
import type { HandPose, PosePoint } from '../vision/magicGesture';

function sequence() {
  let state = initialGestureState();
  let count = 0;
  return {
    sample(pose: HandPose, at: number) {
      const result = stepGesture(state, pose, at);
      state = result.state;
      if (result.event) { expect(result.event).toEqual({ type: 'MAGIC_ACTIVATE' }); count++; }
      return count;
    },
  };
}
const pose = () => Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));

describe('magic gesture', () => {
  it.each([15, 16])('detects either wrist %s with visibility checks', wrist => {
    const points = pose();
    points[wrist].y = 0.3;
    expect(classifyHands(points)).toBe('raised');
    points[wrist].visibility = 0.2;
    expect(classifyHands(points)).toBe('unknown');
  });
  it('rejects missing, nonfinite, out-of-frame and shoulder-level landmarks', () => {
    expect(classifyHands()).toBe('unknown');
    expect(classifyHands(pose())).toBe('neutral');
    const points = pose();
    points[15].y = NaN;
    expect(classifyHands(points)).toBe('unknown');
    points[15].y = -0.1;
    expect(classifyHands(points)).toBe('unknown');
    expect(classifyHands([{ x: 0, y: 0 }] as PosePoint[])).toBe('unknown');
  });
  it('emits once after 400 ms and never repeats for a held raise', () => {
    const s = sequence();
    [0, 100, 200, 300].forEach(t => expect(s.sample('raised', t)).toBe(0));
    expect(s.sample('raised', 400)).toBe(1);
    for (let t = 500; t < 5000; t += 100) expect(s.sample('raised', t)).toBe(1);
  });
  it('requires stable lowering and a cooldown before a fresh stable raise', () => {
    const s = sequence();
    [0, 100, 200, 300, 400].forEach(t => s.sample('raised', t));
    [500, 600, 750].forEach(t => s.sample('lowered', t));
    for (let t = 800; t < 1800; t += 100) expect(s.sample('raised', t)).toBe(1);
    expect(s.sample('raised', 1800)).toBe(2);
  });
  it('does not rearm on a brief lowering or lost tracking', () => {
    const s = sequence();
    [0, 100, 200, 300, 400].forEach(t => s.sample('raised', t));
    s.sample('lowered', 500);
    s.sample('lowered', 600);
    s.sample('unknown', 700);
    for (let t = 800; t < 3000; t += 100) expect(s.sample('raised', t)).toBe(1);
  });
  it('cancels pending activation on missing landmarks, neutral pose, or sample gaps', () => {
    for (const interruption of ['unknown', 'neutral', 'lowered'] as const) {
      const s = sequence();
      s.sample('raised', 0); s.sample('raised', 200);
      s.sample(interruption, 300);
      expect(s.sample('raised', 400)).toBe(0);
      expect(s.sample('raised', 600)).toBe(0);
      expect(s.sample('raised', 800)).toBe(1);
    }
    const s = sequence();
    s.sample('raised', 0);
    expect(s.sample('raised', 1000)).toBe(0);
    expect(s.sample('raised', 1200)).toBe(0);
    expect(s.sample('raised', 1400)).toBe(1);
  });
});
