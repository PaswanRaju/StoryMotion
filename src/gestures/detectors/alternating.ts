import type { DetectorFrame, DetectorState, GestureSample } from '../detector';
import { GESTURE_CONFIG } from '../config';
export function alternating(
  frame: DetectorFrame,
  state: DetectorState,
  legs = false,
): GestureSample {
  const c = GESTURE_CONFIG.extended;
  const m = frame.metrics;
  const useLegs = legs && !frame.seated;
  const difference = useLegs
    ? frame.kneeDifference
    : m.leftHand !== null && m.rightHand !== null
      ? m.leftHand - m.rightHand
      : undefined;
  const threshold =
    (useLegs ? c.kneeLift : c.alternatingRaise) * (frame.sensitivity ?? 1);
  const side =
    difference === undefined
      ? 0
      : difference > threshold
        ? 1
        : difference < -threshold
          ? -1
          : 0;
  let cycles = state.cycles,
    lastSide = state.lastSide,
    lastMotionAt = state.lastMotionAt;
  if (frame.timestamp - lastMotionAt > c.cycleWindowMs) {
    cycles = 0;
    lastSide = 0;
  }
  if (side && side !== lastSide) {
    cycles++;
    lastSide = side;
    lastMotionAt = frame.timestamp;
  }
  return {
    available: difference !== undefined && (!useLegs || frame.legsVisible),
    matches:
      cycles >= c.cycles && frame.timestamp - lastMotionAt < c.cycleWindowMs,
    neutral: side === 0,
    memory: { cycles, lastSide, lastMotionAt },
  };
}
