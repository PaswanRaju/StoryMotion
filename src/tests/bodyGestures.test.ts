import { describe, expect, it } from 'vitest';
import {
  initialBodyGestureState,
  stepBodyGestures,
} from '../vision/bodyGestures';
import type {
  BodyGesture,
  BodyGestureEvent,
  BodyTracking,
} from '../vision/bodyGestures';
import type { PosePoint } from '../vision/magicGesture';

import { standing, raised, wide, lean, crouch } from './fixtures/poses';

function harness(mirrored = true) {
  let state = initialBodyGestureState();
  let time = 0;
  let tracking: BodyTracking | undefined;
  const events: BodyGestureEvent[] = [];
  return {
    events,
    feed(points: PosePoint[], ms = 1000) {
      for (let n = 0; n < ms; n += 100) {
        const result = stepBodyGestures(state, points, time, { mirrored });
        time += 100;
        state = result.state;
        tracking = result.tracking;
        if (result.event) events.push(result.event);
      }
      return tracking!;
    },
  };
}

describe('calibrated full body gestures', () => {
  it.each([15, 16])(
    'detects hand raise using wrist %i, including a cropped opposite arm',
    (wrist) => {
      const h = harness();
      h.feed(standing());
      const p = raised(wrist);
      p[wrist === 15 ? 16 : 15].visibility = 0;
      h.feed(p);
      expect(h.events).toEqual([{ type: 'HAND_RAISE' }]);
      h.feed(p, 3000);
      expect(h.events).toHaveLength(1);
      const neutral = standing();
      neutral[wrist === 15 ? 16 : 15].visibility = 0;
      h.feed(neutral);
      h.feed(p);
      expect(h.events).toHaveLength(2);
    },
  );
  it.each([
    [true, 0.07, 'LEAN_LEFT'],
    [true, -0.07, 'LEAN_RIGHT'],
    [false, 0.07, 'LEAN_RIGHT'],
    [false, -0.07, 'LEAN_LEFT'],
  ] as const)('maps mirrored=%s offset=%s to %s', (mirrored, offset, type) => {
    const h = harness(mirrored);
    h.feed(standing());
    h.feed(lean(offset));
    expect(h.events).toEqual([{ type }]);
  });
  it.each([
    ['ARMS_WIDE', wide],
    ['CROUCH', crouch],
  ] as const)(
    'recognizes %s once and rearms only after neutral',
    (type, pose) => {
      const h = harness();
      h.feed(standing());
      h.feed(pose(), 3000);
      expect(h.events).toEqual([{ type }]);
      h.feed([], 1000);
      h.feed(pose(), 1000);
      expect(h.events).toHaveLength(1);
      h.feed(standing(), 1500);
      h.feed(pose(), 1500);
      expect(h.events).toEqual([{ type }, { type }]);
    },
  );
  it('requires a standing baseline and visible legs for crouch, but supports seated upper body', () => {
    const h = harness();
    expect(h.feed(crouch()).crouchAvailable).toBe(false);
    h.feed(crouch(), 2000);
    expect(h.events).toHaveLength(0);
    h.feed(raised());
    expect(h.events).toEqual([{ type: 'HAND_RAISE' }]);
    const cropped = standing();
    [23, 24, 25, 26, 27, 28].forEach((i) => {
      cropped[i].visibility = 0;
    });
    expect(h.feed(cropped).legsVisible).toBe(false);
    expect(h.feed(cropped).crouchAvailable).toBe(false);
  });
  it('can use shoulder tilt for a seated person whose hips are outside the frame', () => {
    const h = harness();
    const neutral = standing();
    for (let i = 23; i < 33; i++) neutral[i].visibility = 0;
    h.feed(neutral);
    const tilted = structuredClone(neutral);
    tilted[11].y -= 0.05;
    tilted[12].y += 0.05;
    h.feed(tilted);
    expect(h.events).toEqual([{ type: 'LEAN_LEFT' }]);
  });
  it('rejects short movements and missing landmarks rather than bridging lost tracking', () => {
    const h = harness();
    h.feed(standing());
    h.feed(raised(), 200);
    h.feed([], 200);
    h.feed(raised(), 300);
    expect(h.events).toHaveLength(0);
    h.feed(standing());
    const unreliable = wide();
    unreliable[14].visibility = 0.1;
    h.feed(unreliable);
    expect(h.events).toHaveLength(0);
  });
  it('ignores jitter and does not calibrate from a raised-arm starting pose', () => {
    const h = harness();
    expect(h.feed(raised()).calibrated).toBe(false);
    h.feed(standing());
    for (let i = 0; i < 30; i++) h.feed(lean(i % 2 ? 0.015 : -0.015), 100);
    expect(h.events).toHaveLength(0);
  });
  it('uses body-relative thresholds at different distances', () => {
    for (const scale of [0.65, 1, 1.25]) {
      const resize = (pose: PosePoint[]) =>
        pose.map((p) => ({
          ...p,
          x: 0.5 + (p.x - 0.5) * scale,
          y: 0.5 + (p.y - 0.5) * scale,
        }));
      const h = harness();
      h.feed(resize(standing()));
      h.feed(resize(raised()));
      expect(h.events).toEqual([{ type: 'HAND_RAISE' }]);
    }
  });
  it('does not rearm a held raise when landmarks disappear; respects cooldown across different gestures', () => {
    const h = harness();
    h.feed(standing());
    h.feed(raised());
    h.feed([], 500);
    h.feed(raised(), 1500);
    expect(h.events).toHaveLength(1);
    h.feed(standing(), 400);
    h.feed(wide(), 200); // shorter than the stability window
    expect(h.events).toHaveLength(1);
    h.feed(standing(), 1000);
    h.feed(wide(), 1000);
    expect(h.events.map((event) => event.type)).toEqual([
      'HAND_RAISE',
      'ARMS_WIDE',
    ]);
  });
  it('does not rearm a hip-relative lean when the hips are occluded', () => {
    const h = harness();
    h.feed(standing());
    h.feed(lean(0.07));
    const hidden = lean(0.07);
    hidden[23].visibility = 0;
    hidden[24].visibility = 0;
    h.feed(hidden, 2000);
    h.feed(lean(0.07), 1500);
    expect(h.events).toEqual([{ type: 'LEAN_LEFT' }]);
    h.feed(standing());
    h.feed(lean(0.07));
    expect(h.events).toHaveLength(2);
  });
  it('requires the cooldown even when neutral rearming has already completed', () => {
    const h = harness();
    h.feed(standing());
    h.feed(raised(), 700); // Includes EMA settling before the stable-recognition window.
    expect(h.events).toHaveLength(1);
    h.feed(standing(), 500);
    h.feed(raised(), 500);
    expect(h.events).toHaveLength(1);
    h.feed(raised(), 600);
    expect(h.events).toHaveLength(2);
  });
  it('reports head orientation only with visible head landmarks', () => {
    const h = harness();
    const p = standing();
    p[0].x += 0.03;
    expect(h.feed(p).headDirection).toBe('left');
    p[7].visibility = 0;
    expect(h.feed(p).headDirection).toBe('unknown');
  });
  it('never emits any gesture from empty poses', () => {
    const h = harness();
    const tracking = h.feed([], 5000);
    expect(tracking.calibrated).toBe(false);
    expect(tracking.upperBody).toBe(false);
    expect(h.events).toEqual([] as { type: BodyGesture }[]);
  });
  it('counts a brief ~0.6 s gesture once, then lets the child relax', () => {
    const h = harness();
    h.feed(standing());
    h.feed(wide(), 600);
    h.feed(standing(), 2000);
    expect(h.events).toEqual([{ type: 'ARMS_WIDE' }]);
  });
  it('recognizes a loose T with slightly lifted or drooping arms as ARMS_WIDE', () => {
    for (const dy of [-0.08, 0.06]) {
      const h = harness();
      h.feed(standing());
      const p = wide();
      for (const i of [13, 14]) p[i].y += dy / 2;
      for (const i of [15, 16]) p[i].y += dy;
      h.feed(p);
      expect(h.events).toEqual([{ type: 'ARMS_WIDE' }]);
    }
  });
  it('treats both hands high in a V as a hand raise, not a shield', () => {
    const h = harness();
    h.feed(standing());
    const p = standing();
    p[13] = { x: 0.34, y: 0.2, visibility: 1 };
    p[14] = { x: 0.66, y: 0.2, visibility: 1 };
    p[15] = { x: 0.28, y: 0.08, visibility: 1 };
    p[16] = { x: 0.72, y: 0.08, visibility: 1 };
    h.feed(p);
    expect(h.events).toEqual([{ type: 'HAND_RAISE' }]);
  });
  it('rearms when a seated child drops their hands out of the bottom of the frame', () => {
    const h = harness();
    h.feed(standing());
    h.feed(wide());
    const lap = standing();
    for (const i of [13, 14, 15, 16]) lap[i].visibility = 0;
    // Hands pass through view on the way down, then leave the frame.
    h.feed(standing(), 300);
    h.feed(lap, 1500);
    h.feed(wide());
    expect(h.events).toEqual([{ type: 'ARMS_WIDE' }, { type: 'ARMS_WIDE' }]);
  });
  it('does not rearm a hand raised out of the top of the frame', () => {
    const h = harness();
    h.feed(standing());
    h.feed(raised());
    const offTop = raised();
    offTop[15].visibility = 0;
    offTop[13].visibility = 0;
    h.feed(offTop, 3000);
    h.feed(raised());
    expect(h.events).toEqual([{ type: 'HAND_RAISE' }]);
  });
  it('reports recognition progress while a gesture is forming', () => {
    const h = harness();
    h.feed(standing());
    const early = h.feed(wide(), 300);
    expect(early.pending).toBe('ARMS_WIDE');
    expect(early.progress).toBeGreaterThan(0);
    expect(early.progress).toBeLessThan(1);
    expect(h.feed(standing(), 300).pending).toBeNull();
    expect(early.confidence).toBe(1);
  });
});

it('calibrates with recognition disabled without accumulating a gesture candidate', () => {
  let state = initialBodyGestureState();
  for (let at = 0; at < 1000; at += 100) {
    const next = stepBodyGestures(state, standing(), at, { enabled: false });
    state = next.state;
    expect(next.event).toBeNull();
  }
  expect(state.baseline).not.toBeNull();
  for (let at = 1000; at < 3000; at += 100) {
    const next = stepBodyGestures(state, wide(), at, { enabled: false });
    state = next.state;
    expect(next.event).toBeNull();
    expect(next.tracking.pending).toBeNull();
  }
  const first = stepBodyGestures(state, wide(), 3000, { enabled: true });
  expect(first.event).toBeNull();
  expect(first.tracking.pending).toBe('ARMS_WIDE');
});
