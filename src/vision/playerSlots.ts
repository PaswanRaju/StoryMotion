import type { PosePoint } from './magicGesture';
export type Centers = readonly [number | null, number | null];
/** Screen-side slots remember only scalar centers, never a person's identity or pose history. */
export function assignPlayerSlots<T extends PosePoint>(
  detected: readonly T[][],
  previous: Centers,
) {
  const center = (pose: readonly PosePoint[]) =>
    ((pose[11]?.x ?? 0.5) + (pose[12]?.x ?? 0.5)) / 2;
  const sorted = [...detected].sort((a, b) => center(b) - center(a));
  const poses: [T[], T[]] = [[], []];
  const centers: [number | null, number | null] = [...previous];
  if (sorted.length >= 2) {
    poses[0] = sorted[0];
    poses[1] = sorted[1];
    centers[0] = center(sorted[0]);
    centers[1] = center(sorted[1]);
  } else if (sorted.length === 1) {
    const x = center(sorted[0]);
    const distances = previous.map((value) =>
      value === null ? Infinity : Math.abs(value - x),
    );
    const slot =
      distances[0] === Infinity && distances[1] === Infinity
        ? x >= 0.5
          ? 0
          : 1
        : distances[0] <= distances[1]
          ? 0
          : 1;
    poses[slot] = sorted[0];
    centers[slot] = x;
  }
  return { poses, centers };
}
