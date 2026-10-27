import { describe, expect, it } from 'vitest';
import {
  detectors,
  initialBodyGestureState,
  stepBodyGestures,
} from '../gestures';
import { GESTURE_CONFIG } from '../gestures/config';
import { initialDetectorState } from '../gestures/detector';
import type { DetectorFrame } from '../gestures/detector';
import { normalizeLandmarks } from '../gestures/normalize';
import { measure } from '../gestures/measure';
import { PoseFixtureSchema, replayFixture } from '../gestures/fixtures';
import type { FixtureFrame, PoseFixture } from '../gestures/fixtures';
import type { PosePoint } from '../vision/magicGesture';
import { standing, raised, wide, lean, crouch } from './fixtures/poses';

const poses = {
  HAND_RAISE: raised,
  ARMS_WIDE: wide,
  LEAN_LEFT: () => lean(0.07),
  LEAN_RIGHT: () => lean(-0.07),
  CROUCH: crouch,
};
const transform = (points: PosePoint[], scale: number) =>
  points.map((point) => ({
    ...point,
    x: 0.5 + (point.x - 0.5) * scale,
    y: 0.5 + (point.y - 0.5) * scale,
  }));
function sequence(parts: [PosePoint[], number][]): FixtureFrame[] {
  const frames: FixtureFrame[] = [];
  let atMs = 0;
  for (const [landmarks, duration] of parts)
    for (let t = 0; t < duration; t += 60) {
      frames.push({ atMs, aspectRatio: 4 / 3, landmarks });
      atMs += 60;
    }
  return frames;
}
const fixture = (
  frames: FixtureFrame[],
  label: PoseFixture['label'] = 'neutral',
): PoseFixture => ({ version: 1, mirrored: true, label, frames });

for (const detector of detectors.filter(
  (detector): detector is typeof detector & { id: keyof typeof poses } =>
    detector.id in poses,
)) {
  describe(`${detector.id} sequences`, () => {
    it.each([0.4, 0.65, 1, 1.2])(
      'triggers at body scale %s, stays latched and rearms after neutral',
      (scale) => {
        const neutral = transform(standing(), scale);
        const pose = transform(poses[detector.id](), scale);
        const frames = sequence([
          [neutral, 1000],
          [pose, 2400],
          [neutral, 1500],
          [pose, 1000],
        ]);
        expect(
          replayFixture(fixture(frames, detector.id)).map(
            ({ event }) => event.type,
          ),
        ).toEqual([detector.id, detector.id]);
      },
    );
    it('ignores neutral standing, short noise and invisible landmarks', () => {
      const pose = poses[detector.id]();
      const hidden = pose.map((point) => ({ ...point, visibility: 0.1 }));
      const frames = sequence([
        [standing(), 1000],
        [pose, 180],
        [standing(), 1000],
        [hidden, 1000],
        [standing(), 1000],
      ]);
      expect(replayFixture(fixture(frames))).toEqual([]);
    });
    it('uses the common idle → detecting → triggered → cooldown lifecycle and exposes progress', () => {
      const baselinePoints = normalizeLandmarks(standing(), 4 / 3);
      const frame = (points: PosePoint[], timestamp: number): DetectorFrame => {
        const landmarks = normalizeLandmarks(points, 4 / 3);
        const measured = measure(landmarks, 1, true);
        return {
          landmarks,
          timestamp,
          metrics: measured.metrics,
          baseline: { slope: 0, lean: 0 },
          legsVisible: measured.legs,
          standingHeight: measure(baselinePoints, 1, true).metrics.hipHeight,
          mirrored: true,
          lastHands: [measured.metrics.leftHand, measured.metrics.rightHand],
        };
      };
      const pose = poses[detector.id]();
      let result = detector.step(initialDetectorState(), frame(pose, 0));
      expect(result.state.phase).toBe('detecting');
      result = detector.step(result.state, frame(pose, 180));
      expect(result.progress).toBeCloseTo(
        180 / GESTURE_CONFIG.gestures[detector.id].holdMs,
      );
      result = detector.step(result.state, frame(pose, 300));
      expect(result.event?.type).toBe(detector.id);
      expect(result.state.phase).toBe('triggered');
      result = detector.step(result.state, frame(pose, 400));
      expect(result.event).toBeNull();
      result = detector.step(result.state, frame(standing(), 500));
      result = detector.step(result.state, frame(standing(), 800));
      expect(result.state.phase).toBe('cooldown');
      result = detector.step(result.state, frame(pose, 1000));
      expect(result.event).toBeNull();
      expect(result.state.phase).toBe('cooldown');
      result = detector.step(result.state, frame(pose, 1300));
      result = detector.step(result.state, frame(pose, 1400));
      expect(result.state.phase).toBe('detecting');
      result = detector.step(result.state, frame(pose, 1700));
      expect(result.event?.type).toBe(detector.id);
    });
  });
}

it('normalizes shoulders to a centered width of one across translation, scale and aspect ratios', () => {
  for (const scale of [0.5, 1]) {
    const points = transform(standing(), scale).map((point) => ({
      ...point,
      x: point.x + 0.04,
    }));
    const normalized = normalizeLandmarks(points, 16 / 9);
    expect((normalized[11].x + normalized[12].x) / 2).toBeCloseTo(0);
    expect((normalized[11].y + normalized[12].y) / 2).toBeCloseTo(0);
    expect(normalized[12].x - normalized[11].x).toBeCloseTo(1);
  }
});
it('smooths in body coordinates and immediately drops low-visibility landmarks', () => {
  let state = initialBodyGestureState();
  state = stepBodyGestures(state, standing(), 0).state;
  const changed = standing();
  changed[15].y -= 0.06;
  const next = stepBodyGestures(state, changed, 60).state;
  const target = normalizeLandmarks(changed, 4 / 3)[15].y;
  expect(next.landmarks[15].y).toBeGreaterThan(target);
  expect(next.landmarks[15].y).toBeLessThan(state.landmarks[15].y);
  changed[15].visibility = 0.1;
  const hidden = stepBodyGestures(next, changed, 120);
  expect(hidden.state.landmarks[15].visibility).toBe(0);
  expect(measure(hidden.state.landmarks, 1, true).metrics.leftHand).toBeNull();
});
it('reports crouch unavailable when hips, knees or ankles are missing', () => {
  for (const joint of [23, 24, 25, 26, 27, 28]) {
    let state = initialBodyGestureState();
    for (const sample of sequence([[standing(), 1000]]))
      state = stepBodyGestures(state, sample.landmarks, sample.atMs).state;
    const pose = crouch();
    pose[joint].visibility = 0.1;
    const next = stepBodyGestures(state, pose, 1100);
    expect(next.tracking.crouchAvailable).toBe(false);
    expect(next.event).toBeNull();
  }
});
it('validates local fixtures and replays JSON round-trips deterministically', () => {
  const data = fixture(
    sequence([
      [standing(), 1000],
      [wide(), 1000],
    ]),
    'ARMS_WIDE',
  );
  expect(replayFixture(JSON.parse(JSON.stringify(data)))).toEqual(
    replayFixture(data),
  );
  const reversed = { ...data, frames: [...data.frames].reverse() };
  expect(PoseFixtureSchema.safeParse(reversed).success).toBe(false);
  expect(PoseFixtureSchema.safeParse({ ...data, version: 2 }).success).toBe(
    false,
  );
});
