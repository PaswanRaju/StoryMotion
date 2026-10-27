import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createMainThreadPoseWorker } from '../vision/mainThreadPose';
const mocks = vi.hoisted(() => ({
  files: vi.fn(),
  create: vi.fn(),
  detect: vi.fn(),
  close: vi.fn(),
}));
vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: { forVisionTasks: mocks.files },
  PoseLandmarker: { createFromOptions: mocks.create, POSE_CONNECTIONS: [] },
  FaceLandmarker: {},
  HandLandmarker: {},
}));
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.stubGlobal('OffscreenCanvas', undefined);
  mocks.files.mockResolvedValue({
    wasmLoaderPath: '/wasm/runtime.js',
    wasmBinaryPath: '/wasm/runtime.wasm',
  });
  mocks.detect.mockReturnValue({ landmarks: [] });
  mocks.create.mockResolvedValue({
    detectForVideo: mocks.detect,
    close: mocks.close,
  });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it('uses the classic loader and the shared detector when worker canvas support is absent', async () => {
  const endpoint = createMainThreadPoseWorker();
  const messages = vi.fn();
  endpoint.onmessage = messages;
  endpoint.postMessage({
    type: 'init',
    wasmRoot: '/wasm',
    modelUrl: '/model.task',
  });
  await vi.advanceTimersByTimeAsync(0);
  expect(mocks.files).toHaveBeenCalledWith('/wasm', false);
  expect(messages.mock.calls.at(-1)?.[0].data.type).toBe('ready');
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  endpoint.postMessage({ type: 'frame', bitmap: canvas, at: 1000 });
  await vi.advanceTimersByTimeAsync(0);
  expect(mocks.detect).toHaveBeenCalledWith(canvas, 1000);
  expect(messages.mock.calls.at(-1)?.[0].data.type).toBe('pose');
  endpoint.terminate();
  expect(mocks.close).toHaveBeenCalledOnce();
});
