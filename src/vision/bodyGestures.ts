import type { PosePoint } from './magicGesture';

export const BODY_GESTURES = [
  'HAND_RAISE',
  'LEAN_LEFT',
  'LEAN_RIGHT',
  'ARMS_WIDE',
  'CROUCH',
] as const;
export type BodyGesture = (typeof BODY_GESTURES)[number];
export type BodyGestureEvent = { type: BodyGesture };
export type BodyTracking = {
  landmarkCount: number;
  upperBody: boolean;
  calibrated: boolean;
  legsVisible: boolean;
  crouchAvailable: boolean;
  headDirection: 'left' | 'right' | 'forward' | 'unknown';
  /** Gesture currently being recognized (for "Almost there…" feedback). */
  pending?: BodyGesture | null;
  /** 0–1 progress through the short stability window of `pending`. */
  progress?: number;
  /** Mean visibility of shoulders, elbows and wrists, 0–1 (developer view only). */
  confidence?: number;
};
export const BODY_TIMING = {
  calibrationMs: 600,
  stableMs: 300,
  neutralMs: 300,
  cooldownMs: 1100,
  maxGapMs: 350,
};
const VISIBILITY = 0.6;
// Only derived scalar measurements are smoothed in memory. No landmark history is kept.
type Metrics = {
  slope: number | null;
  lean: number | null;
  leftHand: number | null;
  rightHand: number | null;
  leftExtension: number | null;
  rightExtension: number | null;
  leftElbow: number | null;
  rightElbow: number | null;
  /** Elbow height below its shoulder, in shoulder widths (positive = lower). */
  leftElbowDrop: number | null;
  rightElbowDrop: number | null;
  knee: number | null;
  hipHeight: number | null;
};
type Baseline = { slope: number; lean: number | null };
export type BodyGestureState = {
  lastAt: number | null;
  smooth: Metrics | null;
  baseline: Baseline | null;
  calibration: { since: number; baseline: Baseline } | null;
  standingHeight: number | null;
  standingSince: number | null;
  candidate: BodyGesture | null;
  candidateSince: number | null;
  latched: BodyGesture | null;
  latchedHands: number;
  latchedLeanUsesHips: boolean;
  neutralSince: number | null;
  cooldownUntil: number;
  /** Last smoothed wrist height per side before it left the frame (lap vs. overhead). */
  lastHands: [number | null, number | null];
};
export const initialBodyGestureState = (): BodyGestureState => ({
  lastAt: null,
  smooth: null,
  baseline: null,
  calibration: null,
  standingHeight: null,
  standingSince: null,
  candidate: null,
  candidateSince: null,
  latched: null,
  latchedHands: 0,
  latchedLeanUsesHips: false,
  neutralSince: null,
  cooldownUntil: 0,
  lastHands: [null, null],
});
const visible = (p: PosePoint | undefined): p is PosePoint =>
  !!p &&
  Number.isFinite(p.x) &&
  Number.isFinite(p.y) &&
  p.x >= 0 &&
  p.x <= 1 &&
  p.y >= 0 &&
  p.y <= 1 &&
  (p.visibility ?? 0) >= VISIBILITY;
function angle(a: PosePoint, b: PosePoint, c: PosePoint, aspect: number) {
  const ax = (a.x - b.x) * aspect,
    ay = a.y - b.y;
  const cx = (c.x - b.x) * aspect,
    cy = c.y - b.y;
  const length = Math.hypot(ax, ay) * Math.hypot(cx, cy);
  return length > 0.00001
    ? (Math.acos(Math.max(-1, Math.min(1, (ax * cx + ay * cy) / length))) *
        180) /
        Math.PI
    : 0;
}
function measure(points: readonly PosePoint[], aspect: number) {
  const have = (...indices: number[]) =>
    indices.every((index) => visible(points[index]));
  const shoulders = have(11, 12);
  const scale = shoulders
    ? Math.hypot(
        (points[11].x - points[12].x) * aspect,
        points[11].y - points[12].y,
      )
    : 0;
  const upper = shoulders && scale > 0.04;
  const torso = upper && have(23, 24);
  const legs = torso && have(25, 26, 27, 28);
  const hand = (s: number, w: number) =>
    upper && have(s, w) ? (points[s].y - points[w].y) / scale : null;
  const extension = (s: number, other: number, w: number) =>
    upper && have(s, w)
      ? ((points[w].x - points[s].x) *
          aspect *
          Math.sign(points[s].x - points[other].x)) /
        scale
      : null;
  const drop = (s: number, e: number) =>
    upper && have(s, e) ? (points[e].y - points[s].y) / scale : null;
  const joint = (a: number, b: number, c: number) =>
    have(a, b, c) ? angle(points[a], points[b], points[c], aspect) : null;
  const metrics: Metrics = {
    // Sign is invariant to anatomical shoulder ordering: positive slope leans toward source +x.
    slope: upper
      ? ((points[12].y - points[11].y) *
          Math.sign(points[12].x - points[11].x)) /
        scale
      : null,
    lean: torso
      ? (((points[11].x + points[12].x - points[23].x - points[24].x) / 2) *
          aspect) /
        scale
      : null,
    leftHand: hand(11, 15),
    rightHand: hand(12, 16),
    leftExtension: extension(11, 12, 15),
    rightExtension: extension(12, 11, 16),
    leftElbow: upper ? joint(11, 13, 15) : null,
    rightElbow: upper ? joint(12, 14, 16) : null,
    leftElbowDrop: drop(11, 13),
    rightElbowDrop: drop(12, 14),
    knee: legs ? Math.min(joint(23, 25, 27)!, joint(24, 26, 28)!) : null,
    hipHeight: legs
      ? (points[27].y + points[28].y - points[23].y - points[24].y) /
        (2 * scale)
      : null,
  };
  let head: BodyTracking['headDirection'] = 'unknown';
  if (upper && have(0, 7, 8)) {
    const span = Math.abs(points[7].x - points[8].x);
    if (span > 0.02) {
      const offset = (points[0].x - (points[7].x + points[8].x) / 2) / span;
      head = offset > 0.2 ? 'right' : offset < -0.2 ? 'left' : 'forward';
    }
  }
  const arms = [11, 12, 13, 14, 15, 16].map(
    (index) => points[index]?.visibility ?? 0,
  );
  const confidence = arms.reduce((sum, value) => sum + value, 0) / arms.length;
  return { metrics, upper, legs, head, confidence };
}

/** Pure detector for all 33 MediaPipe landmarks. mirrored=true matches the mirrored preview. */
export function stepBodyGestures(
  previous: BodyGestureState,
  points: readonly PosePoint[],
  now: number,
  {
    mirrored = true,
    aspectRatio = 4 / 3,
  }: { mirrored?: boolean; aspectRatio?: number } = {},
): {
  state: BodyGestureState;
  event: BodyGestureEvent | null;
  tracking: BodyTracking;
} {
  const raw = measure(points, aspectRatio);
  const gap =
    previous.lastAt !== null &&
    (now - previous.lastAt > BODY_TIMING.maxGapMs || now < previous.lastAt);
  const state: BodyGestureState = { ...previous, lastAt: now };
  if (gap) {
    state.smooth = null;
    state.candidate = null;
    state.candidateSince = null;
    state.neutralSince = null;
    state.calibration = null;
    state.standingSince = null;
  }
  const smooth = { ...raw.metrics };
  for (const key of Object.keys(smooth) as (keyof Metrics)[]) {
    const value = raw.metrics[key],
      old = state.smooth?.[key];
    // Visibility loss resets this metric immediately, not after an EMA tail.
    smooth[key] =
      value === null ? null : old == null ? value : old * 0.45 + value * 0.55;
  }
  state.smooth = smooth;
  state.lastHands = [
    smooth.leftHand ?? (raw.upper ? state.lastHands[0] : null),
    smooth.rightHand ?? (raw.upper ? state.lastHands[1] : null),
  ];
  const handsRelaxed = [smooth.leftHand, smooth.rightHand].every(
    (value) => value === null || value < -0.1,
  );
  if (!state.baseline) {
    if (
      raw.upper &&
      handsRelaxed &&
      Math.abs(smooth.slope!) < 0.2 &&
      (smooth.lean === null || Math.abs(smooth.lean) < 0.3)
    ) {
      const baseline = { slope: smooth.slope!, lean: smooth.lean };
      const old = state.calibration;
      if (
        !old ||
        Math.abs(old.baseline.slope - baseline.slope) > 0.06 ||
        (old.baseline.lean !== null &&
          baseline.lean !== null &&
          Math.abs(old.baseline.lean - baseline.lean) > 0.1)
      ) {
        state.calibration = { since: now, baseline };
      } else if (now - old.since >= BODY_TIMING.calibrationMs)
        state.baseline = baseline;
    } else state.calibration = null;
  }
  // Seated/bent-knee starting poses must not silently become a standing baseline.
  if (state.standingHeight === null) {
    if (raw.legs && smooth.knee! >= 160 && smooth.hipHeight! > 0.8) {
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
  const tracking: BodyTracking = {
    landmarkCount: points.length,
    upperBody: raw.upper,
    calibrated: state.baseline !== null,
    legsVisible: raw.legs,
    crouchAvailable: raw.legs && state.standingHeight !== null,
    headDirection,
    pending: null,
    progress: 0,
    confidence: Math.round(raw.confidence * 100) / 100,
  };
  if (!state.baseline || !raw.upper) {
    state.candidate = null;
    state.candidateSince = null;
    state.neutralSince = null;
    return { state, event: null, tracking };
  }
  const leftUp = smooth.leftHand !== null && smooth.leftHand > 0.3;
  const rightUp = smooth.rightHand !== null && smooth.rightHand > 0.3;
  const raisedHands = (leftUp ? 1 : 0) | (rightUp ? 2 : 0);
  // A hand counts as relaxed when it is visibly low, its elbow is visibly low, or it
  // left the frame downward (a seated child's hands in the lap). A hand that left
  // through the top of the frame is still raised.
  const relaxed = (
    hand: number | null,
    elbowDrop: number | null,
    lastSeen: number | null,
  ) =>
    hand !== null
      ? hand < -0.15
      : elbowDrop !== null
        ? elbowDrop > 0.3
        : lastSeen !== null && lastSeen < -0.15;
  const downHands =
    (relaxed(smooth.leftHand, smooth.leftElbowDrop, state.lastHands[0])
      ? 1
      : 0) |
    (relaxed(smooth.rightHand, smooth.rightElbowDrop, state.lastHands[1])
      ? 2
      : 0);
  const torsoLean =
    smooth.lean !== null && state.baseline.lean !== null
      ? smooth.lean - state.baseline.lean
      : null;
  const tilt = smooth.slope! - state.baseline.slope;
  // Torso translation relative to hips is preferred; shoulder tilt supports cropped seated users.
  const lean = torsoLean !== null ? torsoLean : tilt;
  const leanThreshold = torsoLean !== null ? 0.28 : 0.22;
  // A loose "T": both wrists well out to the sides with fairly straight elbows, from a
  // slight droop to a slight lift. Both hands high (a "V") is a hand raise instead.
  const wide =
    smooth.leftExtension !== null &&
    smooth.rightExtension !== null &&
    smooth.leftExtension > 0.55 &&
    smooth.rightExtension > 0.55 &&
    smooth.leftElbow !== null &&
    smooth.rightElbow !== null &&
    smooth.leftElbow > 140 &&
    smooth.rightElbow > 140 &&
    smooth.leftHand !== null &&
    smooth.rightHand !== null &&
    smooth.leftHand > -0.6 &&
    smooth.rightHand > -0.6 &&
    smooth.leftHand < 0.55 &&
    smooth.rightHand < 0.55;
  const crouch =
    tracking.crouchAvailable &&
    smooth.knee! < 150 &&
    (smooth.knee! < 130 || smooth.hipHeight! < state.standingHeight! * 0.88);
  const sourceDirection = lean > 0 ? 'LEAN_RIGHT' : 'LEAN_LEFT';
  const direction: BodyGesture = mirrored
    ? sourceDirection === 'LEAN_LEFT'
      ? 'LEAN_RIGHT'
      : 'LEAN_LEFT'
    : sourceDirection;
  // One candidate at a time; intentional large poses win over incidental torso motion.
  const candidate: BodyGesture | null = wide
    ? 'ARMS_WIDE'
    : raisedHands
      ? 'HAND_RAISE'
      : crouch
        ? 'CROUCH'
        : Math.abs(lean) > leanThreshold
          ? direction
          : null;
  let neutral = false;
  switch (state.latched) {
    case 'HAND_RAISE':
      neutral =
        !raisedHands && (downHands & state.latchedHands) === state.latchedHands;
      break;
    case 'ARMS_WIDE':
      neutral = downHands === 3;
      break;
    case 'LEAN_LEFT':
    case 'LEAN_RIGHT':
      neutral =
        (!state.latchedLeanUsesHips || torsoLean !== null) &&
        Math.abs(lean) < 0.12 &&
        Math.abs(tilt) < 0.12;
      break;
    case 'CROUCH':
      neutral =
        tracking.crouchAvailable &&
        smooth.knee! >= 160 &&
        smooth.hipHeight! > state.standingHeight! * 0.94;
      break;
  }
  if (state.latched) {
    if (neutral && candidate === null) {
      state.neutralSince ??= now;
      if (now - state.neutralSince >= BODY_TIMING.neutralMs) {
        state.latched = null;
        state.neutralSince = null;
      }
    } else state.neutralSince = null;
    state.candidate = null;
    state.candidateSince = null;
    return { state, event: null, tracking };
  }
  if (!candidate || now < state.cooldownUntil) {
    state.candidate = null;
    state.candidateSince = null;
  } else {
    if (candidate !== state.candidate) {
      state.candidate = candidate;
      state.candidateSince = now;
    }
    tracking.pending = candidate;
    tracking.progress = Math.min(
      1,
      (now - state.candidateSince!) / BODY_TIMING.stableMs,
    );
    if (now - state.candidateSince! >= BODY_TIMING.stableMs) {
      state.latched = candidate;
      state.latchedHands = raisedHands;
      state.latchedLeanUsesHips = torsoLean !== null;
      state.cooldownUntil = now + BODY_TIMING.cooldownMs;
      state.candidate = null;
      state.candidateSince = null;
      return { state, event: { type: candidate }, tracking };
    }
  }
  return { state, event: null, tracking };
}
