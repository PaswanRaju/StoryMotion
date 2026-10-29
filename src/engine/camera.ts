import type { Scene } from './schema';
export function cameraAt(scene: Scene, time: number, reduced = false) {
  const camera = { x: 0, y: 0, zoom: 1, shakeX: 0, shakeY: 0 };
  if (reduced) return camera;
  for (const action of scene.cameraActions ?? []) {
    if (time < action.atMs) continue;
    const amount = action.durationMs
      ? Math.min(1, (time - action.atMs) / action.durationMs)
      : 1;
    if (action.type === 'pan') {
      camera.x += (action.x - camera.x) * amount;
      camera.y += (action.y - camera.y) * amount;
    }
    if (action.type === 'zoom')
      camera.zoom += (action.value - camera.zoom) * amount;
    if (action.type === 'shake' && amount < 1) {
      camera.shakeX += Math.sin(time / 31) * action.intensity * (1 - amount);
      camera.shakeY += Math.cos(time / 43) * action.intensity * (1 - amount);
    }
  }
  return camera;
}
