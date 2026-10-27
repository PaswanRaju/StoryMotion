import { expect, it } from 'vitest';
import { blow } from '../gestures/detectors/blow';
import { clap } from '../gestures/detectors/clap';
import { climb } from '../gestures/detectors/climb';
import { runInPlace } from '../gestures/detectors/runInPlace';
import { initialDetectorState } from '../gestures/detector';
import type { DetectorFrame } from '../gestures/detector';
import { normalizeLandmarks } from '../gestures/normalize';
import { measure } from '../gestures/measure';
import { standing } from './fixtures/poses';
const frame = (
  timestamp: number,
  patch: Partial<DetectorFrame> = {},
): DetectorFrame => {
  const landmarks = normalizeLandmarks(standing(), 4 / 3),
    measured = measure(landmarks, 1, true);
  return {
    timestamp,
    landmarks,
    metrics: measured.metrics,
    baseline: { slope: 0, lean: 0 },
    standingHeight: measured.metrics.hipHeight,
    mirrored: true,
    legsVisible: true,
    lastHands: [-1, -1],
    ...patch,
  };
};
it('detects a held cheek puff or puckered mouth, ignores noise and unavailable face data', () => {
  for (const shape of ['cheekPuff', 'mouthPucker']) {
    let state = initialDetectorState();
    for (const t of [0, 180]) {
      const next = blow.step(state, frame(t, { face: { [shape]: 0.8 } }));
      state = next.state;
      expect(next.event).toBeNull();
    }
    expect(
      blow.step(state, frame(360, { face: { [shape]: 0.8 } })).event?.type,
    ).toBe('BLOW');
  }
  expect(blow.step(initialDetectorState(), frame(0)).available).toBe(false);
  expect(
    blow.step(initialDetectorState(), frame(100, { face: { cheekPuff: 0.1 } }))
      .event,
  ).toBeNull();
});
it('recognizes a clap only after hands were visibly apart and then meet', () => {
  const state = clap.step(
    initialDetectorState(),
    frame(0, { handDistance: 1.5 }),
  ).state;
  const result = clap.step(state, frame(100, { handDistance: 0.2 }));
  expect(result.event?.type).toBe('CLAP');
  expect(
    clap.step(initialDetectorState(), frame(0, { handDistance: 0.2 })).event,
  ).toBeNull();
  expect(
    clap.step(result.state, frame(400, { handDistance: 0.2 })).event,
  ).toBeNull();
});
it.each([climb, runInPlace])(
  'requires alternating movement for $id, with an arm-only seated fallback',
  (detector) => {
    for (const seated of [false, true]) {
      let state = initialDetectorState();
      let triggered = false;
      for (const [index, t] of [0, 180, 360, 540, 720].entries()) {
        const side = index % 2 ? -1 : 1;
        const sample = frame(t, { seated, kneeDifference: side * 0.6 });
        sample.metrics = {
          ...sample.metrics,
          leftHand: side * 0.8,
          rightHand: -side * 0.8,
        };
        const next = detector.step(state, sample);
        state = next.state;
        triggered ||= !!next.event;
      }
      expect(triggered).toBe(true);
    }
  },
);
it('makes running unavailable without legs unless seated mode is enabled', () => {
  expect(
    runInPlace.step(initialDetectorState(), frame(0, { legsVisible: false }))
      .available,
  ).toBe(false);
  expect(
    runInPlace.step(
      initialDetectorState(),
      frame(0, { legsVisible: false, seated: true }),
    ).available,
  ).toBe(true);
});
