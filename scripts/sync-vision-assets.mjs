import { copyFile, mkdir, readdir } from 'node:fs/promises';
await mkdir('public/wasm', { recursive: true });
await mkdir('public/rive', { recursive: true });
const root = 'node_modules/@mediapipe/tasks-vision/wasm';
for (const file of await readdir(root)) {
  if (/^vision_wasm.*\.(js|wasm)$/.test(file))
    await copyFile(`${root}/${file}`, `public/wasm/${file}`);
}
await copyFile(
  'node_modules/@rive-app/canvas/rive.wasm',
  'public/rive/rive.wasm',
);
