import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { initialBodyGestureState, stepBodyGestures } from './bodyGestures';
import { drawPoseDebug } from './poseDebug';
let debugEnabled = false;
let debugCanvas: OffscreenCanvas | null = null;
let state = initialBodyGestureState();

let model: PoseLandmarker | null = null;
type Request =
  | {
      type: 'init';
      wasmRoot: string;
      modelUrl: string;
      fallbackModelUrl?: string;
    }
  | { type: 'frame'; bitmap: ImageBitmap; at: number }
  | { type: 'resetPending' }
  | { type: 'debug'; enabled: boolean };
self.onmessage = async ({ data }: MessageEvent<Request>) => {
  try {
    if (data.type === 'debug') {
      debugEnabled = data.enabled;
      if (!debugEnabled) debugCanvas = null;
      return;
    }
    if (data.type === 'resetPending') {
      state = {
        ...state,
        smooth: null,
        candidate: null,
        candidateSince: null,
        neutralSince: null,
      };
      return;
    }
    if (data.type === 'init') {
      // 1.1.1's default classic loader defines a module-local factory when dynamically
      // imported by a module worker. The ES6 variant explicitly registers ModuleFactory.
      const files = await FilesetResolver.forVisionTasks(data.wasmRoot, true);
      const create = (modelAssetPath: string) =>
        PoseLandmarker.createFromOptions(files, {
          baseOptions: { modelAssetPath, delegate: 'CPU' },
          canvas: new OffscreenCanvas(640, 480),
          runningMode: 'VIDEO',
          numPoses: 1,
          outputSegmentationMasks: false,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      try {
        model = await create(data.modelUrl);
      } catch (error) {
        if (!data.fallbackModelUrl) throw error;
        model = await create(data.fallbackModelUrl);
      }
      self.postMessage({ type: 'ready' });
    } else {
      try {
        if (!model) throw new Error('Model not ready');
        // Landmark arrays stay in this worker; optional debug pixels are transient.
        const result = model.detectForVideo(data.bitmap, data.at);
        const next = stepBodyGestures(
          state,
          result.landmarks[0] ?? [],
          data.at,
          {
            mirrored: true,
            aspectRatio: data.bitmap.width / data.bitmap.height,
          },
        );
        state = next.state;
        let debugFrame: ImageBitmap | undefined;
        if (debugEnabled) {
          try {
            if (
              !debugCanvas ||
              debugCanvas.width !== data.bitmap.width ||
              debugCanvas.height !== data.bitmap.height
            )
              debugCanvas = new OffscreenCanvas(
                data.bitmap.width,
                data.bitmap.height,
              );
            debugFrame = drawPoseDebug(debugCanvas, result.landmarks[0] ?? []);
          } catch {
            /* Optional diagnostics must not stop tracking or the story. */
          }
        }
        self.postMessage(
          {
            type: 'pose',
            event: next.event,
            tracking: next.tracking,
            ...(debugFrame ? { debugFrame } : {}),
          },
          { transfer: debugFrame ? [debugFrame] : [] },
        );
      } finally {
        data.bitmap.close();
      }
    }
  } catch (error) {
    model?.close();
    model = null;
    self.postMessage({
      type: 'error',
      reason: error instanceof Error ? error.message : 'Pose worker failed',
    });
  }
};
