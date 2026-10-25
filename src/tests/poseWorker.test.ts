import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  files: vi.fn(),
  create: vi.fn(),
  detect: vi.fn(),
  close: vi.fn(),
}));
vi.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: { forVisionTasks: mocks.files },
  PoseLandmarker: {
    createFromOptions: mocks.create,
    POSE_CONNECTIONS: [{ start: 11, end: 12 }],
  },
}));
const debugContext = {
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  fillText: vi.fn(),
};
const debugBitmap = { width: 640, height: 480, close: vi.fn() };
const transfer = vi.fn(() => debugBitmap);
const scope = {
  postMessage: vi.fn(),
  onmessage: null as null | ((event: { data: unknown }) => Promise<void>),
};
beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubGlobal('self', scope);
  vi.stubGlobal(
    'OffscreenCanvas',
    class {
      width: number;
      height: number;
      getContext() {
        return debugContext;
      }
      transferToImageBitmap() {
        return transfer();
      }
      constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
      }
    },
  );
  mocks.files.mockResolvedValue({
    wasmLoaderPath: 'module.js',
    wasmBinaryPath: 'module.wasm',
  });
  mocks.create.mockResolvedValue({
    detectForVideo: mocks.detect,
    close: mocks.close,
  });
  await import('../vision/pose.worker');
});
afterEach(() => vi.unstubAllGlobals());
it('uses the installed API ES-module loader and VIDEO mode, then returns derived tracking only', async () => {
  await scope.onmessage!({
    data: { type: 'init', wasmRoot: '/wasm', modelUrl: '/model.task' },
  });
  expect(mocks.files).toHaveBeenCalledExactlyOnceWith('/wasm', true);
  expect(mocks.create).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      runningMode: 'VIDEO',
      numPoses: 1,
      baseOptions: { modelAssetPath: '/model.task', delegate: 'CPU' },
    }),
  );
  expect(scope.postMessage).toHaveBeenLastCalledWith({ type: 'ready' });
  mocks.detect.mockReturnValue({
    landmarks: [
      Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 })),
    ],
  });
  const bitmap = { width: 640, height: 480, close: vi.fn() };
  await scope.onmessage!({ data: { type: 'frame', bitmap, at: 1000 } });
  expect(mocks.detect).toHaveBeenCalledExactlyOnceWith(bitmap, 1000);
  expect(bitmap.close).toHaveBeenCalledOnce();
  const result = scope.postMessage.mock.lastCall![0];
  expect(result.type).toBe('pose');
  expect(result.tracking.landmarkCount).toBe(33);
  expect(result).not.toHaveProperty('landmarks');
});
it('falls back to the official model URL when the self-hosted model fails to load', async () => {
  mocks.create
    .mockRejectedValueOnce(new Error('404'))
    .mockResolvedValueOnce({ detectForVideo: mocks.detect, close: mocks.close });
  await scope.onmessage!({
    data: {
      type: 'init',
      wasmRoot: '/wasm',
      modelUrl: '/local.task',
      fallbackModelUrl: 'https://example.test/model.task',
    },
  });
  expect(mocks.create).toHaveBeenLastCalledWith(
    expect.anything(),
    expect.objectContaining({
      baseOptions: {
        modelAssetPath: 'https://example.test/model.task',
        delegate: 'CPU',
      },
    }),
  );
  expect(scope.postMessage).toHaveBeenLastCalledWith({ type: 'ready' });
});
it('closes the frame and model on inference failure and reports a diagnostic', async () => {
  await scope.onmessage!({
    data: { type: 'init', wasmRoot: '/wasm', modelUrl: '/model.task' },
  });
  mocks.detect.mockImplementationOnce(() => {
    throw new Error('Inference failed');
  });
  const bitmap = { width: 640, height: 480, close: vi.fn() };
  await scope.onmessage!({ data: { type: 'frame', bitmap, at: 1000 } });
  expect(bitmap.close).toHaveBeenCalledOnce();
  expect(mocks.close).toHaveBeenCalledOnce();
  expect(scope.postMessage).toHaveBeenLastCalledWith({
    type: 'error',
    reason: 'Inference failed',
  });
});

it('produces transient skeleton pixels only after opt-in, excluding invisible joints', async () => {
  await scope.onmessage!({
    data: { type: 'init', wasmRoot: '/wasm', modelUrl: '/model.task' },
  });
  const points = Array.from({ length: 33 }, () => ({
    x: 0.5,
    y: 0.5,
    visibility: 0,
  }));
  points[11] = { x: 0.4, y: 0.3, visibility: 1 };
  points[12] = { x: 0.6, y: 0.3, visibility: 1 };
  mocks.detect.mockReturnValue({ landmarks: [points] });
  const frame = (at: number) =>
    scope.onmessage!({
      data: {
        type: 'frame',
        bitmap: { width: 640, height: 480, close: vi.fn() },
        at,
      },
    });
  await frame(0);
  expect(transfer).not.toHaveBeenCalled();
  await scope.onmessage!({ data: { type: 'debug', enabled: true } });
  await frame(100);
  expect(debugContext.arc).toHaveBeenCalledTimes(2);
  expect(debugContext.stroke).toHaveBeenCalledOnce();
  expect(scope.postMessage).toHaveBeenLastCalledWith(
    expect.objectContaining({ debugFrame: debugBitmap }),
    { transfer: [debugBitmap] },
  );
  expect(scope.postMessage.mock.lastCall![0]).not.toHaveProperty('landmarks');
  await scope.onmessage!({ data: { type: 'debug', enabled: false } });
  await frame(200);
  expect(transfer).toHaveBeenCalledOnce();
  expect(scope.postMessage.mock.lastCall![0]).not.toHaveProperty('debugFrame');
});
