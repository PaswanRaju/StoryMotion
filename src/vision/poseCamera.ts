import type { MagicAction } from './magicGesture';
import type { BodyGestureEvent, BodyTracking } from './bodyGestures';
import { GESTURE_CONFIG } from '../gestures/config';
import type { VisionOptions } from './poseProcessor';
import type { FixtureFrame } from '../gestures/fixtures';
import { FALLBACK_MODEL_URL, MODEL_URL, WASM_ROOT } from './poseAssets';

export type TrackingStatus =
  | 'idle'
  | 'requesting'
  | 'loading'
  | 'tracking'
  | 'missing'
  | 'denied'
  | 'unavailable'
  | 'error';
export type PoseCameraOptions = {
  onAction: (action: MagicAction) => void;
  onStatus: (status: TrackingStatus) => void;
  onGesture?: (event: BodyGestureEvent) => void;
  onTracking?: (tracking: BodyTracking) => void;
  /** Bitmap is valid only during this callback; the controller closes it afterward. */
  onShadow?: (frame: ImageBitmap | HTMLCanvasElement | null) => void;
  onDebug?: (frame: ImageBitmap | HTMLCanvasElement | null) => void;
  recognitionEnabled?: boolean;
  vision?: VisionOptions;
  /** Development-only local fixture capture; never supplied by the story player. */
  onFixtureFrame?: (frame: FixtureFrame) => void;
  wasmRoot?: string;
  modelUrl?: string;
};
export type PoseWorkerReply =
  | { type: 'ready' }
  | { type: 'idle' }
  | { type: 'error'; reason?: string }
  | {
      type: 'pose';
      event: BodyGestureEvent | null;
      events?: BodyGestureEvent[];
      tracking: BodyTracking;
      debugFrame?: ImageBitmap | HTMLCanvasElement;
      shadowFrame?: ImageBitmap | HTMLCanvasElement;
      fixtureFrame?: FixtureFrame;
    };

/** One worker + one in-flight bitmap per camera. start() must follow an explicit click. */
export function createPoseCamera(
  video: HTMLVideoElement,
  options: PoseCameraOptions,
) {
  let generation = 0;
  let active = false;
  let stream: MediaStream | null = null;
  type WorkerEndpoint = Pick<
    Worker,
    'postMessage' | 'terminate' | 'onmessage' | 'onerror'
  >;
  let worker: WorkerEndpoint | null = null;
  let frame = 0;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  let debugEnabled = false;
  let recognitionEnabled = options.recognitionEnabled ?? true;
  let recordingEnabled = false;
  let modelReady = false;
  let visionOptions = options.vision;
  let lastStatus: TrackingStatus = 'idle';
  const status = (next: TrackingStatus) => {
    if (next !== lastStatus) {
      lastStatus = next;
      options.onStatus(next);
    }
  };
  const stop = () => {
    generation++;
    active = false;
    modelReady = false;
    recordingEnabled = false;
    cancelAnimationFrame(frame);
    clearTimeout(watchdog);
    stream?.getTracks().forEach((track) => {
      track.onended = null;
      track.onmute = null;
      track.stop();
    });
    stream = null;
    video.srcObject = null;
    // terminate also releases the worker's WASM heap/canvas/model, including a hung load/inference.
    worker?.terminate();
    worker = null;
    options.onDebug?.(null);
    options.onShadow?.(null);
    status('idle');
  };
  const setDebug = (enabled: boolean) => {
    debugEnabled = enabled;
    worker?.postMessage({ type: 'debug', enabled });
    if (!enabled) options.onDebug?.(null);
  };
  const setRecognitionEnabled = (enabled: boolean) => {
    recognitionEnabled = enabled;
    worker?.postMessage({ type: 'recognition', enabled });
    if (modelReady && !enabled) clearTimeout(watchdog);
  };
  const setVisionOptions = (value: VisionOptions) => {
    visionOptions = value;
    worker?.postMessage({ type: 'options', options: value });
  };
  const setRecordingEnabled = (enabled: boolean) => {
    if (!import.meta.env.DEV || !options.onFixtureFrame) return;
    recordingEnabled = enabled;
    worker?.postMessage({ type: 'recording', enabled });
  };
  const fail = (next: TrackingStatus = 'error') => {
    stop();
    status(next);
  };
  const armWatchdog = (ms: number) => {
    clearTimeout(watchdog);
    watchdog = setTimeout(() => fail(), ms);
  };
  const start = async () => {
    if (active) return;
    active = true;
    const run = ++generation;
    status('requesting');
    // Permission may be left unanswered. Late-granted streams are still stopped below.
    armWatchdog(GESTURE_CONFIG.inference.loadTimeoutMs);
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new DOMException('Camera unavailable', 'NotFoundError');
      const acquired = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      if (run !== generation) {
        acquired.getTracks().forEach((track) => track.stop());
        return;
      }
      stream = acquired;
      stream.getTracks().forEach((track) => {
        track.onended = () => fail();
        track.onmute = () => {
          worker?.postMessage({ type: 'resetPending' });
          status('missing');
        };
      });
      video.srcObject = stream;
      await video.play();
      if (run !== generation) return;
      status('loading');
      armWatchdog(GESTURE_CONFIG.inference.loadTimeoutMs);
      let detector: WorkerEndpoint;
      try {
        if (
          typeof Worker === 'undefined' ||
          typeof OffscreenCanvas === 'undefined'
        )
          throw new Error('Worker canvas unsupported');
        detector = new Worker(new URL('./pose.worker.ts', import.meta.url), {
          type: 'module',
        });
      } catch {
        const { createMainThreadPoseWorker } = await import('./mainThreadPose');
        detector = createMainThreadPoseWorker();
      }
      if (run !== generation) {
        detector.terminate();
        return;
      }
      worker = detector;
      let ready = false;
      let busy = false;
      let lastInference = -Infinity;
      let lastVideoTime = -1;
      detector.onerror = (error) => {
        if (run === generation) {
          if (import.meta.env.DEV)
            console.warn('Pose worker could not start:', error.message);
          fail();
        }
      };
      detector.onmessage = ({ data }: MessageEvent<PoseWorkerReply>) => {
        if (run !== generation) {
          if (data.type === 'pose') {
            if (data.debugFrame && 'close' in data.debugFrame)
              data.debugFrame.close();
            if (data.shadowFrame && 'close' in data.shadowFrame)
              data.shadowFrame.close();
          }
          return;
        }
        if (data.type === 'error') {
          if (import.meta.env.DEV)
            console.warn('Pose model unavailable:', data.reason);
          fail();
          return;
        }
        clearTimeout(watchdog);
        if (data.type === 'ready') {
          ready = true;
          modelReady = true;
          status('missing');
          return;
        }
        busy = false;
        if (data.type === 'idle') return;
        status(data.tracking.upperBody ? 'tracking' : 'missing');
        try {
          if (recognitionEnabled && data.shadowFrame)
            options.onShadow?.(data.shadowFrame);
          if (debugEnabled && data.debugFrame)
            options.onDebug?.(data.debugFrame);
        } finally {
          if (data.debugFrame && 'close' in data.debugFrame)
            data.debugFrame.close();
          if (data.shadowFrame && 'close' in data.shadowFrame)
            data.shadowFrame.close();
        }
        if (import.meta.env.DEV && recordingEnabled && data.fixtureFrame)
          options.onFixtureFrame?.(data.fixtureFrame);
        options.onTracking?.(data.tracking);
        if (recognitionEnabled)
          for (const event of data.events ?? (data.event ? [data.event] : [])) {
            options.onGesture?.(event);
            if (event.type === 'HAND_RAISE')
              options.onAction({
                type: 'MAGIC_ACTIVATE',
                ...(event.player ? { player: event.player } : {}),
                ...(event.hand ? { hand: event.hand } : {}),
              });
          }
      };
      detector.postMessage({
        type: 'init',
        wasmRoot: options.wasmRoot ?? WASM_ROOT,
        modelUrl: options.modelUrl ?? MODEL_URL,
        fallbackModelUrl: options.modelUrl ? undefined : FALLBACK_MODEL_URL,
      });
      if (visionOptions)
        detector.postMessage({ type: 'options', options: visionOptions });
      if (!recognitionEnabled)
        detector.postMessage({ type: 'recognition', enabled: false });
      if (import.meta.env.DEV && recordingEnabled)
        detector.postMessage({ type: 'recording', enabled: true });
      if (options.onShadow)
        detector.postMessage({ type: 'shadow', enabled: true });
      if (debugEnabled) detector.postMessage({ type: 'debug', enabled: true });
      const tick = (now: number) => {
        if (run !== generation) return;
        if (
          ready &&
          recognitionEnabled &&
          !busy &&
          video.readyState >= 2 &&
          video.currentTime !== lastVideoTime &&
          now - lastInference >= 1000 / GESTURE_CONFIG.inference.fps
        ) {
          busy = true;
          armWatchdog(GESTURE_CONFIG.inference.frameTimeoutMs);
          lastInference = now;
          lastVideoTime = video.currentTime;
          // Transfer locally to the worker; never queue frames or send to a server.
          const capture = () => {
            if (typeof createImageBitmap === 'function')
              return createImageBitmap(video);
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            canvas.getContext('2d')?.drawImage(video, 0, 0);
            return Promise.resolve(canvas);
          };
          void capture()
            .then((bitmap) => {
              if (run !== generation || !recognitionEnabled) {
                busy = false;
                if ('close' in bitmap) bitmap.close();
                return;
              }
              try {
                detector.postMessage(
                  { type: 'frame', bitmap, at: now },
                  'close' in bitmap ? [bitmap] : [],
                );
              } catch {
                if ('close' in bitmap) bitmap.close();
                fail();
              }
            })
            .catch(() => {
              if (run === generation) fail();
            });
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    } catch (error) {
      if (run !== generation) return;
      fail(
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'denied'
          : error instanceof DOMException && error.name === 'NotFoundError'
            ? 'unavailable'
            : 'error',
      );
    }
  };
  return {
    start,
    stop,
    setDebug,
    setRecognitionEnabled,
    setRecordingEnabled,
    setVisionOptions,
  };
}
