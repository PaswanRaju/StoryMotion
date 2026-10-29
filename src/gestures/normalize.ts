import type { PosePoint } from '../vision/magicGesture';
import { GESTURE_CONFIG } from './config';
import { visible } from './measure';

/** Translate to shoulder center and divide by shoulder width in aspect-correct coordinates. */
export function normalizeLandmarks(
  points: readonly PosePoint[],
  aspectRatio: number,
): PosePoint[] {
  if (
    !visible(points[11]) ||
    !visible(points[12]) ||
    !Number.isFinite(aspectRatio) ||
    aspectRatio <= 0
  )
    return [];
  const left = points[11],
    right = points[12];
  const width = Math.hypot((left.x - right.x) * aspectRatio, left.y - right.y);
  if (width <= GESTURE_CONFIG.minShoulderWidth) return [];
  const cx = (left.x + right.x) / 2,
    cy = (left.y + right.y) / 2;
  return points.map((point) =>
    visible(point)
      ? {
          x: ((point.x - cx) * aspectRatio) / width,
          y: (point.y - cy) / width,
          visibility: point.visibility,
        }
      : { x: 0, y: 0, visibility: 0 },
  );
}

/** EMA in body coordinates avoids camera-distance jitter; occlusion drops a point immediately. */
export function smoothLandmarks(
  previous: readonly PosePoint[],
  current: readonly PosePoint[],
): PosePoint[] {
  const alpha = GESTURE_CONFIG.landmarkAlpha;
  return current.map((point, index) => {
    const old = previous[index];
    if (
      (point.visibility ?? 0) < GESTURE_CONFIG.visibility ||
      !old ||
      (old.visibility ?? 0) < GESTURE_CONFIG.visibility
    )
      return { ...point };
    return {
      ...point,
      x: old.x + alpha * (point.x - old.x),
      y: old.y + alpha * (point.y - old.y),
    };
  });
}
