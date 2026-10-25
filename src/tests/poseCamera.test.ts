import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPoseCamera } from '../vision/poseCamera';
import type { PoseWorkerReply } from '../vision/poseCamera';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};
let getUserMedia: ReturnType<typeof vi.fn>;
let track: {
  stop: ReturnType<typeof vi.fn>;
  onended: (() => void) | null;
  onmute: (() => void) | null;
};
let stream: MediaStream;
let video: HTMLVideoElement;
let worker: {
  terminate: ReturnType<typeof vi.fn>;
  postMessage: ReturnType<typeof vi.fn>;
  onmessage: ((event: { data: PoseWorkerReply }) => void) | null;
  onerror: (() => void) | null;
};
let tick: FrameRequestCallback;
beforeEach(() => {
  vi.useFakeTimers();
  track = { stop: vi.fn(), onended: null, onmute: null };
  stream = { getTracks: () => [track] } as unknown as MediaStream;
  getUserMedia = vi.fn().mockResolvedValue(stream);
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: FrameRequestCallback) => {
      tick = callback;
      return 1;
    }),
  );
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  worker = {
    terminate: vi.fn(),
    postMessage: vi.fn(),
    onmessage: null,
    onerror: null,
  };
  vi.stubGlobal(
    'Worker',
    vi.fn(function () {
      return worker;
    }),
  );
  video = document.createElement('video');
  vi.spyOn(video, 'play').mockResolvedValue();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
const reply = (data: PoseWorkerReply) => worker.onmessage?.({ data });

describe('pose camera resource lifecycle', () => {
  it('requests only on start, avoids duplicate starts, and releases resources on stop', async () => {
    const camera = createPoseCamera(video, {
      onAction: vi.fn(),
      onStatus: vi.fn(),
    });
    expect(getUserMedia).not.toHaveBeenCalled();
    await Promise.all([camera.start(), camera.start()]);
    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(getUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({ audio: false }),
    );
    camera.stop();
    camera.stop();
    expect(track.stop).toHaveBeenCalledTimes(1);
    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect(video.srcObject).toBeNull();
  });
  it('stops a permission result arriving after exit', async () => {
    const pending = deferred<MediaStream>();
    getUserMedia.mockReturnValue(pending.promise);
    const camera = createPoseCamera(video, {
      onAction: vi.fn(),
      onStatus: vi.fn(),
    });
    const started = camera.start();
    camera.stop();
    pending.resolve(stream);
    await started;
    expect(track.stop).toHaveBeenCalledOnce();
    expect(Worker).not.toHaveBeenCalled();
  });
  it('ignores a worker model result after exit and closes a late bitmap', async () => {
    const camera = createPoseCamera(video, {
      onAction: vi.fn(),
      onStatus: vi.fn(),
    });
    await camera.start();
    reply({ type: 'ready' });
    Object.defineProperty(video, 'readyState', { value: 4 });
    const pending = deferred<ImageBitmap>();
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockReturnValue(pending.promise),
    );
    tick(100);
    camera.stop();
    const close = vi.fn();
    pending.resolve({ close } as unknown as ImageBitmap);
    await Promise.resolve();
    reply({ type: 'ready' });
    expect(close).toHaveBeenCalledOnce();
    expect(worker.postMessage).toHaveBeenCalledTimes(1); // initialization only
  });
  it('reports permission denial and worker/model failure without retaining tracks', async () => {
    const onStatus = vi.fn();
    const camera = createPoseCamera(video, { onAction: vi.fn(), onStatus });
    getUserMedia.mockRejectedValueOnce(
      new DOMException('Denied', 'NotAllowedError'),
    );
    await camera.start();
    expect(onStatus).toHaveBeenLastCalledWith('denied');
    await camera.start();
    reply({ type: 'error' });
    expect(onStatus).toHaveBeenLastCalledWith('error');
    expect(track.stop).toHaveBeenCalledOnce();
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
  it('releases resources when the camera disconnects or model loading times out', async () => {
    const onStatus = vi.fn();
    const camera = createPoseCamera(video, { onAction: vi.fn(), onStatus });
    await camera.start();
    track.onended?.();
    expect(worker.terminate).toHaveBeenCalledOnce();
    expect(onStatus).toHaveBeenLastCalledWith('error');
    await camera.start();
    vi.advanceTimersByTime(30000);
    expect(worker.terminate).toHaveBeenCalledTimes(2);
    expect(onStatus).toHaveBeenLastCalledWith('error');
  });
  it('preserves MAGIC_ACTIVATE compatibility and passes through body gestures', async () => {
    const onAction = vi.fn();
    const onGesture = vi.fn();
    const onStatus = vi.fn();
    const camera = createPoseCamera(video, { onAction, onGesture, onStatus });
    await camera.start();
    reply({ type: 'ready' });
    const tracking = {
      landmarkCount: 33,
      upperBody: true,
      calibrated: true,
      legsVisible: false,
      crouchAvailable: false,
      headDirection: 'unknown' as const,
    };
    reply({ type: 'pose', event: { type: 'HAND_RAISE' }, tracking });
    expect(onAction).toHaveBeenCalledExactlyOnceWith({
      type: 'MAGIC_ACTIVATE',
    });
    expect(onGesture).toHaveBeenLastCalledWith({ type: 'HAND_RAISE' });
    reply({ type: 'pose', event: { type: 'LEAN_LEFT' }, tracking });
    expect(onGesture).toHaveBeenLastCalledWith({ type: 'LEAN_LEFT' });
    expect(onAction).toHaveBeenCalledOnce();
    reply({
      type: 'pose',
      event: null,
      tracking: { ...tracking, upperBody: false },
    });
    expect(onStatus).toHaveBeenLastCalledWith('missing');
    track.onmute?.();
    expect(worker.postMessage).toHaveBeenLastCalledWith({
      type: 'resetPending',
    });
    camera.stop();
  });
});

it('disposes debug pixels on disable, stop, and late worker replies', async () => {
  const onDebug = vi.fn();
  const camera = createPoseCamera(video, {
    onAction: vi.fn(),
    onStatus: vi.fn(),
    onDebug,
  });
  camera.setDebug(true);
  await camera.start();
  expect(worker.postMessage).toHaveBeenLastCalledWith({
    type: 'debug',
    enabled: true,
  });
  const debugFrame = { close: vi.fn() } as unknown as ImageBitmap;
  const tracking = {
    landmarkCount: 0,
    upperBody: false,
    calibrated: false,
    legsVisible: false,
    crouchAvailable: false,
    headDirection: 'unknown' as const,
  };
  reply({ type: 'pose', event: null, tracking, debugFrame });
  expect(onDebug).toHaveBeenLastCalledWith(debugFrame);
  expect(debugFrame.close).toHaveBeenCalledOnce();
  camera.setDebug(false);
  expect(onDebug).toHaveBeenLastCalledWith(null);
  reply({ type: 'pose', event: null, tracking, debugFrame });
  expect(onDebug).toHaveBeenLastCalledWith(null);
  expect(debugFrame.close).toHaveBeenCalledTimes(2);
  camera.stop();
  reply({ type: 'pose', event: null, tracking, debugFrame });
  expect(debugFrame.close).toHaveBeenCalledTimes(3);
});
