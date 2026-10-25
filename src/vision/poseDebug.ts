import { PoseLandmarker } from '@mediapipe/tasks-vision';
import type { PosePoint } from './magicGesture';

/** Transient diagnostic pixels only. Raw landmarks remain inside the pose worker. */
export function drawPoseDebug(
  canvas: OffscreenCanvas,
  points: readonly PosePoint[],
): ImageBitmap | undefined {
  const context = canvas.getContext('2d');
  if (!context) return;
  const visible = (point: PosePoint | undefined): point is PosePoint =>
    !!point &&
    Number.isFinite(point.x) &&
    Number.isFinite(point.y) &&
    point.x >= 0 &&
    point.x <= 1 &&
    point.y >= 0 &&
    point.y <= 1 &&
    (point.visibility ?? 0) >= 0.6;
  // Mirror geometry to match the preview, keeping joint labels readable.
  const displayX = (point: PosePoint) => (1 - point.x) * canvas.width;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#00ffb3';
  context.fillStyle = '#ffdd00';
  context.lineWidth = 3;
  context.font = '12px monospace';
  for (const { start, end } of PoseLandmarker.POSE_CONNECTIONS) {
    const a = points[start],
      b = points[end];
    if (!visible(a) || !visible(b)) continue;
    context.beginPath();
    context.moveTo(displayX(a), a.y * canvas.height);
    context.lineTo(displayX(b), b.y * canvas.height);
    context.stroke();
  }
  points.forEach((point, index) => {
    if (!visible(point)) return;
    const x = displayX(point),
      y = point.y * canvas.height;
    context.beginPath();
    context.arc(x, y, 4, 0, Math.PI * 2);
    context.fill();
    context.fillText(String(index), x + 6, y - 6);
  });
  return canvas.transferToImageBitmap();
}
