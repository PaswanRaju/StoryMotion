import type { PosePoint } from '../vision/magicGesture';
import { GESTURE_CONFIG } from './config';
import { measure } from './measure';
import { normalizeLandmarks, smoothLandmarks } from './normalize';
import { initialDetectorState } from './detector';
import type { DetectorFrame, DetectorState } from './detector';
import { raiseHand } from './detectors/raiseHand';
import { spreadArms } from './detectors/spreadArms';
import { leanLeft } from './detectors/leanLeft';
import { leanRight } from './detectors/leanRight';
import { blow } from './detectors/blow';
import { clap } from './detectors/clap';
import { climb } from './detectors/climb';
import { runInPlace } from './detectors/runInPlace';
import { crouch } from './detectors/crouch';
import type {
  Baseline,
  BodyGesture,
  BodyGestureEvent,
  BodyTracking,
} from './types';
export { BODY_GESTURES } from './types';
export type { BodyGesture, BodyGestureEvent, BodyTracking } from './types';
export const BODY_TIMING = GESTURE_CONFIG.timing;
// Priority preserves the existing behavior: wide arms, raised hand, crouch, leans.
export const detectors = [
  blow,
  clap,
  climb,
  runInPlace,
  spreadArms,
  raiseHand,
  crouch,
  leanLeft,
  leanRight,
];
const initialDetectors = (): Record<BodyGesture, DetectorState> => ({
  BLOW: initialDetectorState(),
  CLAP: initialDetectorState(),
  CLIMB: initialDetectorState(),
  RUN_IN_PLACE: initialDetectorState(),
  HAND_RAISE: initialDetectorState(),
  ARMS_WIDE: initialDetectorState(),
  LEAN_LEFT: initialDetectorState(),
  LEAN_RIGHT: initialDetectorState(),
  CROUCH: initialDetectorState(),
});

export type BodyGestureState = {
  landmarks: PosePoint[];
  detectors: Record<BodyGesture, DetectorState>;
  lastAt: number | null;
  baseline: Baseline | null;
  calibration: { since: number; baseline: Baseline } | null;
  standingHeight: number | null;
  standingSince: number | null;
  /** Last smoothed wrist height per side before it left the frame (lap vs. overhead). */
  lastHands: [number | null, number | null];
};
export const initialBodyGestureState = (): BodyGestureState => ({
  landmarks: [],
  detectors: initialDetectors(),
  lastAt: null,
  baseline: null,
  calibration: null,
  standingHeight: null,
  standingSince: null,
  lastHands: [null, null],
});
/** Pure detector for all 33 MediaPipe landmarks. mirrored=true matches the mirrored preview. */
export function stepBodyGestures(
  previous: BodyGestureState,
  points: readonly PosePoint[],
  now: number,
  {
    enabled = true,
    mirrored = true,
    aspectRatio = 4 / 3,
    allowed,
    seated = false,
    sensitivity = 1,
    face,
    handDistance,
  }: {
    enabled?: boolean;
    mirrored?: boolean;
    aspectRatio?: number;
    allowed?: readonly BodyGesture[];
    seated?: boolean;
    sensitivity?: number;
    face?: Readonly<Record<string, number>>;
    handDistance?: number;
  } = {},
): {
  state: BodyGestureState;
  event: BodyGestureEvent | null;
  tracking: BodyTracking;
} {
  const gap =
    previous.lastAt !== null &&
    (now - previous.lastAt > BODY_TIMING.maxGapMs || now < previous.lastAt);
  const state: BodyGestureState = { ...previous, lastAt: now };
  if (gap) {
    state.calibration = null;
    state.standingSince = null;
  }
  const normalized = normalizeLandmarks(points, aspectRatio);
  state.landmarks = smoothLandmarks(gap ? [] : previous.landmarks, normalized);
  const raw = measure(state.landmarks, 1, true);
  const smooth = raw.metrics;
  state.lastHands = [
    smooth.leftHand ?? (raw.upper ? state.lastHands[0] : null),
    smooth.rightHand ?? (raw.upper ? state.lastHands[1] : null),
  ];
  const handsRelaxed = [smooth.leftHand, smooth.rightHand].every(
    (value) => value === null || value < GESTURE_CONFIG.calibration.handBelow,
  );
  if (!state.baseline) {
    if (
      raw.upper &&
      handsRelaxed &&
      Math.abs(smooth.slope!) < GESTURE_CONFIG.calibration.maxSlope &&
      (smooth.lean === null ||
        Math.abs(smooth.lean) < GESTURE_CONFIG.calibration.maxLean)
    ) {
      const baseline = { slope: smooth.slope!, lean: smooth.lean };
      const old = state.calibration;
      if (
        !old ||
        Math.abs(old.baseline.slope - baseline.slope) >
          GESTURE_CONFIG.calibration.slopeJitter ||
        (old.baseline.lean !== null &&
          baseline.lean !== null &&
          Math.abs(old.baseline.lean - baseline.lean) >
            GESTURE_CONFIG.calibration.leanJitter)
      ) {
        state.calibration = { since: now, baseline };
      } else if (now - old.since >= BODY_TIMING.calibrationMs)
        state.baseline = baseline;
    } else state.calibration = null;
  }
  // Seated/bent-knee starting poses must not silently become a standing baseline.
  if (state.standingHeight === null) {
    if (
      raw.legs &&
      smooth.knee! >= GESTURE_CONFIG.crouch.standingKnee &&
      smooth.hipHeight! > GESTURE_CONFIG.crouch.minStandingHeight
    ) {
      state.standingSince ??= now;
      if (now - state.standingSince >= BODY_TIMING.calibrationMs)
        state.standingHeight = smooth.hipHeight;
    } else state.standingSince = null;
  }
  const headDirection =
    mirrored && raw.head !== 'unknown' && raw.head !== 'forward'
      ? raw.head === 'left'
        ? 'right'
        : 'left'
      : raw.head;
  const inView = (index: number) =>
    (points[index]?.visibility ?? 0) >= GESTURE_CONFIG.visibility;
  const framing: BodyTracking['framing'] = !raw.upper
    ? 'moveIntoView'
    : Math.abs(points[11].x - points[12].x) >
          GESTURE_CONFIG.framing.maxShoulderWidth ||
        [11, 12, 15, 16].some(
          (index) =>
            inView(index) &&
            (points[index].x < GESTURE_CONFIG.framing.edge ||
              points[index].x > 1 - GESTURE_CONFIG.framing.edge),
        )
      ? 'stepBack'
      : !inView(15) || !inView(16)
        ? 'showHands'
        : 'ready';
  const tracking: BodyTracking = {
    framing,
    landmarkCount: points.length,
    upperBody: raw.upper,
    calibrated: state.baseline !== null,
    legsVisible: raw.legs,
    crouchAvailable: !seated && raw.legs && state.standingHeight !== null,
    headDirection,
    pending: null,
    progress: 0,
    confidence: Math.round(raw.confidence * 100) / 100,
  };
  const frame: DetectorFrame = {
    landmarks: state.landmarks,
    timestamp: now,
    metrics: smooth,
    baseline: state.baseline ?? { slope: 0, lean: null },
    standingHeight: state.standingHeight,
    legsVisible: raw.legs,
    mirrored,
    lastHands: state.lastHands,
    seated,
    sensitivity,
    face,
    handDistance,
    kneeDifference: raw.legs
      ? state.landmarks[25].y - state.landmarks[26].y
      : undefined,
  };
  const active = enabled && state.baseline !== null && raw.upper;
  const locked = Object.values(previous.detectors).some(
    (detector) =>
      detector.phase === 'triggered' ||
      (detector.phase === 'cooldown' && now < detector.cooldownUntil),
  );
  const candidate = active
    ? (detectors.find(
        (detector) =>
          (!allowed || allowed.includes(detector.id)) &&
          !(seated && detector.id === 'CROUCH') &&
          detector.sample(frame, previous.detectors[detector.id]).matches,
      )?.id ?? null)
    : null;
  let event: BodyGestureEvent | null = null;
  state.detectors = { ...previous.detectors };
  for (const detector of detectors) {
    const next = detector.step(
      previous.detectors[detector.id],
      frame,
      active && !locked && candidate === detector.id,
    );
    state.detectors[detector.id] = next.state;
    if (next.event) event = next.event;
    if (next.state.phase === 'detecting') {
      tracking.pending = detector.id;
      tracking.progress = next.progress;
    }
  }
  return { state, event, tracking };
}

/** New interaction windows discard stale holds/cooldowns while keeping calibration. */
export function resetRecognitionState(
  state: BodyGestureState,
): BodyGestureState {
  return {
    ...state,
    detectors: initialDetectors(),
    lastAt: null,
    landmarks: [],
  };
}
