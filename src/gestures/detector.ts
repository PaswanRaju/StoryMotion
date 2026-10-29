import type { PosePoint } from '../vision/magicGesture';
import type { Baseline, BodyGesture, BodyGestureEvent, Metrics } from './types';
import { GESTURE_CONFIG } from './config';

export type DetectorState = {
  phase: 'idle' | 'detecting' | 'triggered' | 'cooldown';
  since: number | null;
  lastAt: number | null;
  neutralSince: number | null;
  cooldownUntil: number;
  hands: number;
  usedHips: boolean;
  cycles: number;
  lastSide: number;
  lastMotionAt: number;
  wasOpen: boolean;
};
export const initialDetectorState = (): DetectorState => ({
  phase: 'idle',
  cycles: 0,
  lastSide: 0,
  lastMotionAt: -Infinity,
  wasOpen: false,
  since: null,
  lastAt: null,
  neutralSince: null,
  cooldownUntil: 0,
  hands: 0,
  usedHips: false,
});
export type DetectorFrame = {
  landmarks: readonly PosePoint[];
  timestamp: number;
  metrics: Metrics;
  baseline: Baseline;
  standingHeight: number | null;
  legsVisible: boolean;
  mirrored: boolean;
  lastHands: readonly (number | null)[];
  face?: Readonly<Record<string, number>>;
  handDistance?: number;
  kneeDifference?: number;
  seated?: boolean;
  sensitivity?: number;
};
export type GestureSample = {
  available: boolean;
  matches: boolean;
  neutral: boolean;
  hands?: number;
  usedHips?: boolean;
  memory?: Partial<DetectorState>;
};
export type DetectorResult = {
  state: DetectorState;
  event: BodyGestureEvent | null;
  progress: number;
  available: boolean;
};
export type GestureDetector = {
  id: BodyGesture;
  sample: (frame: DetectorFrame, state: DetectorState) => GestureSample;
  step: (
    state: DetectorState,
    frame: DetectorFrame,
    eligible?: boolean,
  ) => DetectorResult;
};

/** Shared, pure per-gesture lifecycle. No detector retains frames or landmarks. */
export function defineDetector(
  id: BodyGesture,
  sample: GestureDetector['sample'],
): GestureDetector {
  return {
    id,
    sample,
    step(previous, frame, eligible = true) {
      const now = frame.timestamp;
      const reading = sample(frame, previous);
      let state = { ...previous, ...reading.memory, lastAt: now };
      const timing = GESTURE_CONFIG.gestures[id];
      const gap =
        previous.lastAt !== null &&
        (now - previous.lastAt > GESTURE_CONFIG.timing.maxGapMs ||
          now < previous.lastAt);
      if (gap) {
        state.since = null;
        state.neutralSince = null;
        if (state.phase === 'detecting') state.phase = 'idle';
      }
      const result = (
        event: BodyGestureEvent | null = null,
        progress = 0,
      ): DetectorResult => ({
        state,
        event,
        progress,
        available: reading.available,
      });
      if (state.phase === 'triggered') {
        if (reading.available && reading.neutral) {
          state.neutralSince ??= now;
          if (now - state.neutralSince >= GESTURE_CONFIG.timing.neutralMs)
            state.phase = 'cooldown';
        } else state.neutralSince = null;
        return result();
      }
      if (state.phase === 'cooldown') {
        if (now < state.cooldownUntil) return result();
        state = {
          ...state,
          phase: 'idle',
          cycles: 0,
          lastSide: 0,
          lastMotionAt: -Infinity,
          wasOpen: false,
          since: null,
          neutralSince: null,
        };
      }
      if (!reading.available || !reading.matches || !eligible) {
        state.phase = 'idle';
        state.since = null;
        return result();
      }
      state.phase = 'detecting';
      state.since ??= now;
      const progress =
        timing.holdMs === 0
          ? 1
          : Math.min(1, (now - state.since) / timing.holdMs);
      if (progress >= 1) {
        state = {
          ...state,
          phase: 'triggered',
          since: null,
          neutralSince: null,
          cooldownUntil: now + timing.cooldownMs,
          hands: reading.hands ?? 0,
          usedHips: reading.usedHips ?? false,
        };
        return result({ type: id }, 1);
      }
      return result(null, progress);
    },
  };
}
