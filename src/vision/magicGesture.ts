/** Pure state machine; only timing/phase is retained, never landmarks. */
export type PosePoint = { x: number; y: number; visibility?: number };
export type MagicAction = { type: 'MAGIC_ACTIVATE' };
export type HandPose = 'raised' | 'lowered' | 'unknown' | 'neutral';
export type GestureState = {
  armed: boolean;
  raisedSince: number | null;
  loweredSince: number | null;
  lastSample: number | null;
  cooldownUntil: number;
};
export const GESTURE_TIMING = {
  stableMs: 400,
  lowerMs: 250,
  cooldownMs: 1000,
  maxGapMs: 250,
};
export const initialGestureState = (): GestureState => ({
  armed: true,
  raisedSince: null,
  loweredSince: null,
  lastSample: null,
  cooldownUntil: 0,
});

export function classifyHands(points: readonly PosePoint[] = []): HandPose {
  // Scale the margin to shoulder width when both shoulders are visible. A fixed
  // image-space margin is disproportionately difficult when a child is farther away.
  const shoulders = [points[11], points[12]];
  const width = shoulders.every((p) => p && (p.visibility ?? 0) >= 0.6)
    ? Math.abs(shoulders[0].x - shoulders[1].x)
    : 0;
  const raiseMargin =
    width > 0.03 ? Math.max(0.02, Math.min(0.07, width * 0.25)) : 0.04;
  const lowerMargin = raiseMargin / 2;
  const side = (shoulderIndex: number, wristIndex: number): HandPose => {
    const shoulder = points[shoulderIndex];
    const wrist = points[wristIndex];
    if (
      ![shoulder, wrist].every(
        (p) =>
          p &&
          Number.isFinite(p.x) &&
          Number.isFinite(p.y) &&
          p.x >= 0 &&
          p.x <= 1 &&
          p.y >= 0 &&
          p.y <= 1 &&
          (p.visibility ?? 0) >= 0.6,
      )
    )
      return 'unknown';
    if (wrist.y < shoulder.y - raiseMargin) return 'raised';
    if (wrist.y > shoulder.y + lowerMargin) return 'lowered';
    return 'neutral';
  };
  const left = side(11, 15);
  const right = side(12, 16);
  if (left === 'raised' || right === 'raised') return 'raised';
  // Both hands must be visibly down: occlusion must never rearm a held raise.
  if (left === 'unknown' || right === 'unknown') return 'unknown';
  return left === 'lowered' && right === 'lowered' ? 'lowered' : 'neutral';
}

export function stepGesture(
  previous: GestureState,
  pose: HandPose,
  now: number,
): {
  state: GestureState;
  event: MagicAction | null;
} {
  const state = { ...previous, lastSample: now };
  if (
    previous.lastSample !== null &&
    (now - previous.lastSample > GESTURE_TIMING.maxGapMs ||
      now < previous.lastSample)
  ) {
    state.raisedSince = null;
    state.loweredSince = null;
  }
  if (pose !== 'raised') state.raisedSince = null;
  if (pose !== 'lowered') state.loweredSince = null;
  if (!state.armed && pose === 'lowered') {
    state.loweredSince ??= now;
    if (now - state.loweredSince >= GESTURE_TIMING.lowerMs) state.armed = true;
  }
  if (state.armed && pose === 'raised' && now >= state.cooldownUntil) {
    state.raisedSince ??= now;
    if (now - state.raisedSince >= GESTURE_TIMING.stableMs) {
      state.armed = false;
      state.raisedSince = null;
      state.loweredSince = null;
      state.cooldownUntil = now + GESTURE_TIMING.cooldownMs;
      return { state, event: { type: 'MAGIC_ACTIVATE' } };
    }
  }
  return { state, event: null };
}
