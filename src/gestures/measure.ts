import type { PosePoint } from '../vision/magicGesture';
import type { Metrics, BodyTracking } from './types';
import { GESTURE_CONFIG } from './config';

export const visible = (p: PosePoint | undefined): p is PosePoint =>
  !!p &&
  Number.isFinite(p.x) &&
  Number.isFinite(p.y) &&
  p.x >= 0 &&
  p.x <= 1 &&
  p.y >= 0 &&
  p.y <= 1 &&
  (p.visibility ?? 0) >= GESTURE_CONFIG.visibility;
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
export function measure(
  points: readonly PosePoint[],
  aspect: number,
  normalized = false,
) {
  const have = (...indices: number[]) =>
    indices.every((index) =>
      normalized
        ? !!points[index] &&
          Number.isFinite(points[index].x) &&
          Number.isFinite(points[index].y) &&
          (points[index].visibility ?? 0) >= GESTURE_CONFIG.visibility
        : visible(points[index]),
    );
  const shoulders = have(11, 12);
  const scale = shoulders
    ? Math.hypot(
        (points[11].x - points[12].x) * aspect,
        points[11].y - points[12].y,
      )
    : 0;
  const upper = shoulders && scale > GESTURE_CONFIG.minShoulderWidth;
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
    if (span > GESTURE_CONFIG.head.minEarSpan) {
      const offset = (points[0].x - (points[7].x + points[8].x) / 2) / span;
      head =
        offset > GESTURE_CONFIG.head.turn
          ? 'right'
          : offset < -GESTURE_CONFIG.head.turn
            ? 'left'
            : 'forward';
    }
  }
  const arms = [11, 12, 13, 14, 15, 16].map(
    (index) => points[index]?.visibility ?? 0,
  );
  const confidence = arms.reduce((sum, value) => sum + value, 0) / arms.length;
  return { metrics, upper, legs, head, confidence };
}
