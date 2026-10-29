import type { PosePoint } from '../../vision/magicGesture';

export function standing(): PosePoint[] {
  const points = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    visibility: 0,
  }));
  const set = (index: number, x: number, y: number) => {
    points[index] = { x, y, visibility: 1 };
  };
  set(0, 0.5, 0.16);
  set(7, 0.46, 0.16);
  set(8, 0.54, 0.16);
  set(11, 0.42, 0.3);
  set(12, 0.58, 0.3);
  set(13, 0.4, 0.4);
  set(14, 0.6, 0.4);
  set(15, 0.38, 0.5);
  set(16, 0.62, 0.5);
  set(23, 0.44, 0.52);
  set(24, 0.56, 0.52);
  set(25, 0.44, 0.7);
  set(26, 0.56, 0.7);
  set(27, 0.44, 0.9);
  set(28, 0.56, 0.9);
  return points;
}
export function raised(wrist = 15) {
  const p = standing();
  p[wrist].y = 0.18;
  return p;
}
export function wide() {
  const p = standing();
  p[13] = { x: 0.28, y: 0.3, visibility: 1 };
  p[14] = { x: 0.72, y: 0.3, visibility: 1 };
  p[15] = { x: 0.15, y: 0.3, visibility: 1 };
  p[16] = { x: 0.85, y: 0.3, visibility: 1 };
  return p;
}
export function lean(amount: number) {
  const p = standing();
  for (const index of [0, 7, 8, 11, 12, 13, 14, 15, 16]) p[index].x += amount;
  return p;
}
export function crouch() {
  const p = standing();
  p[23].y = 0.65;
  p[24].y = 0.65;
  p[25] = { x: 0.35, y: 0.73, visibility: 1 };
  p[26] = { x: 0.65, y: 0.73, visibility: 1 };
  return p;
}
