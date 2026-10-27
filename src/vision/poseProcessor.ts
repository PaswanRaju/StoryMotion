import {
  FilesetResolver,
  PoseLandmarker,
  FaceLandmarker,
  HandLandmarker,
} from '@mediapipe/tasks-vision';
import {
  initialBodyGestureState,
  resetRecognitionState,
  stepBodyGestures,
} from '../gestures';
import { GESTURE_CONFIG } from '../gestures/config';
import type { BodyGesture, BodyGestureEvent } from '../gestures';
import { assignPlayerSlots } from './playerSlots';
import type { Centers } from './playerSlots';
import { drawPoseDebug } from './poseDebug';
export type VisionOptions = {
  allowed?: readonly BodyGesture[];
  seated?: boolean;
  sensitivity?: number;
  players?: 1 | 2;
  activePlayer?: 1 | 2;
};
export type PoseRequest =
  | {
      type: 'init';
      wasmRoot: string;
      modelUrl: string;
      fallbackModelUrl?: string;
    }
  | { type: 'options'; options: VisionOptions }
  | { type: 'dispose' }
  | { type: 'frame'; bitmap: ImageBitmap | HTMLCanvasElement; at: number }
  | { type: 'resetPending' }
  | { type: 'recognition'; enabled: boolean }
  | { type: 'recording'; enabled: boolean }
  | { type: 'shadow'; enabled: boolean }
  | { type: 'debug'; enabled: boolean };
const makeCanvas = (
  width: number,
  height: number,
): OffscreenCanvas | HTMLCanvasElement => {
  if (typeof OffscreenCanvas !== 'undefined')
    return new OffscreenCanvas(width, height);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};
export function createPoseProcessor(
  emit: (message: unknown, transfer?: { transfer: Transferable[] }) => void,
  workerMode = true,
) {
  let debugEnabled = false;
  let shadowEnabled = false;
  let shadowCanvas: OffscreenCanvas | HTMLCanvasElement | null = null;
  let recognitionEnabled = true;
  let recordingEnabled = false;
  let debugCanvas: OffscreenCanvas | HTMLCanvasElement | null = null;
  let state = initialBodyGestureState();
  let secondState = initialBodyGestureState();
  let options: VisionOptions = {};
  let playerCenters: Centers = [null, null];
  let files: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>> | null =
    null;
  let face: FaceLandmarker | null = null,
    hands: HandLandmarker | null = null;
  let faceAttempted = false,
    handsAttempted = false;
  let disposed = false;
  let lastExtraAt = -Infinity;
  let extraDiagnostic = '';
  let runtimeInstance = 0;
  // The pinned SDK consumes ModuleFactory; each lazy task needs a fresh loader module URL.
  const freshFiles = () => ({
    ...files!,
    wasmLoaderPath: `${files!.wasmLoaderPath}?instance=${++runtimeInstance}`,
  });
  let faceScores: Record<string, number>[] = [];
  let handDistances: (number | undefined)[] = [];

  let model: PoseLandmarker | null = null;
  return async ({ data }: MessageEvent<PoseRequest>) => {
    try {
      if (data.type === 'dispose') {
        disposed = true;
        model?.close();
        face?.close();
        hands?.close();
        model = null;
        return;
      }
      if (data.type === 'options') {
        const changed = options.players !== data.options.players;
        options = data.options;
        state = resetRecognitionState(state);
        secondState = resetRecognitionState(secondState);
        if (changed && model)
          await model.setOptions({ numPoses: options.players ?? 1 });
        return;
      }
      if (data.type === 'shadow') {
        shadowEnabled = data.enabled;
        if (!shadowEnabled) shadowCanvas = null;
        return;
      }
      if (data.type === 'recording') {
        recordingEnabled = import.meta.env.DEV && data.enabled;
        return;
      }
      if (data.type === 'recognition') {
        recognitionEnabled = data.enabled;
        state = resetRecognitionState(state);
        secondState = resetRecognitionState(secondState);
        return;
      }
      if (data.type === 'debug') {
        debugEnabled = data.enabled;
        if (!debugEnabled) debugCanvas = null;
        return;
      }
      if (data.type === 'resetPending') {
        state = resetRecognitionState(state);
        secondState = resetRecognitionState(secondState);
        return;
      }
      if (data.type === 'init') {
        // 1.1.1's default classic loader defines a module-local factory when dynamically
        // imported by a module worker. The ES6 variant explicitly registers ModuleFactory.
        files = await FilesetResolver.forVisionTasks(data.wasmRoot, workerMode);
        const create = (modelAssetPath: string) =>
          PoseLandmarker.createFromOptions(freshFiles(), {
            baseOptions: { modelAssetPath, delegate: 'CPU' },
            canvas: makeCanvas(640, 480),
            runningMode: 'VIDEO',
            numPoses: options.players ?? 1,
            outputSegmentationMasks: false,
            minPoseDetectionConfidence: GESTURE_CONFIG.model.detection,
            minPosePresenceConfidence: GESTURE_CONFIG.model.presence,
            minTrackingConfidence: GESTURE_CONFIG.model.tracking,
          });
        try {
          model = await create(data.modelUrl);
        } catch (error) {
          if (!data.fallbackModelUrl) throw error;
          model = await create(data.fallbackModelUrl);
        }
        if (disposed) {
          model.close();
          model = null;
          return;
        }
        emit({ type: 'ready' });
      } else {
        try {
          if (!model) throw new Error('Model not ready');
          if (!recognitionEnabled) {
            emit({ type: 'idle' });
            return;
          }
          // Landmark arrays stay in this worker; optional debug pixels are transient.
          const result = model.detectForVideo(data.bitmap, data.at);
          // Stable screen-side assignment: player 1 is left in the mirrored view.
          const assigned = assignPlayerSlots(result.landmarks, playerCenters);
          if (options.players === 2) playerCenters = assigned.centers;
          const poses =
            options.players === 2
              ? assigned.poses
              : [result.landmarks[0] ?? []];
          const allowed = options.allowed;
          const needsFace = allowed?.includes('BLOW') ?? false;
          const needsHands = allowed?.includes('CLAP') ?? false;
          const load = async <T>(
            name: string,
            create: (path: string) => Promise<T>,
          ): Promise<T> => {
            try {
              return await create(`/models/${name}.task`);
            } catch {
              return create(
                `https://storage.googleapis.com/mediapipe-models/${name}/${name}/float16/1/${name}.task`,
              );
            }
          };
          if (needsFace && !faceAttempted && files) {
            faceAttempted = true;
            try {
              face = await load('face_landmarker', (modelAssetPath) =>
                FaceLandmarker.createFromOptions(freshFiles(), {
                  baseOptions: { modelAssetPath, delegate: 'CPU' },
                  canvas: makeCanvas(640, 480),
                  runningMode: 'VIDEO',
                  numFaces: options.players ?? 1,
                  outputFaceBlendshapes: true,
                }),
              );
            } catch (error) {
              extraDiagnostic =
                error instanceof Error ? error.message : String(error);
            }
          }
          if (needsHands && !handsAttempted && files) {
            handsAttempted = true;
            try {
              hands = await load('hand_landmarker', (modelAssetPath) =>
                HandLandmarker.createFromOptions(freshFiles(), {
                  baseOptions: { modelAssetPath, delegate: 'CPU' },
                  canvas: makeCanvas(640, 480),
                  runningMode: 'VIDEO',
                  numHands: (options.players ?? 1) * 2,
                }),
              );
            } catch (error) {
              extraDiagnostic =
                error instanceof Error ? error.message : String(error);
            }
          }
          if (disposed) {
            face?.close();
            hands?.close();
            return;
          }
          if (!recognitionEnabled) {
            emit({ type: 'idle' });
            return;
          }
          if (
            data.at - lastExtraAt >=
            1000 / GESTURE_CONFIG.inference.extraFps
          ) {
            lastExtraAt = data.at;
            faceScores = [];
            handDistances = [];
            const nearest = (x: number) =>
              poses.reduce((best, pose, index) => {
                const center = ((pose[11]?.x ?? 0) + (pose[12]?.x ?? 0)) / 2;
                const prior =
                  ((poses[best]?.[11]?.x ?? 0) + (poses[best]?.[12]?.x ?? 0)) /
                  2;
                return Math.abs(center - x) < Math.abs(prior - x)
                  ? index
                  : best;
              }, 0);
            if (needsFace && face) {
              const faces = face.detectForVideo(data.bitmap, data.at);
              faces.faceBlendshapes.forEach((shape, index) => {
                const owner = nearest(
                  faces.faceLandmarks[index]?.[1]?.x ?? 0.5,
                );
                faceScores[owner] = Object.fromEntries(
                  shape.categories.map((category) => [
                    category.categoryName,
                    category.score,
                  ]),
                );
              });
            }
            if (needsHands && hands) {
              const detected = hands.detectForVideo(data.bitmap, data.at);
              for (let index = 0; index < poses.length; index++) {
                const palms = detected.landmarks
                  .map((hand) => hand[9])
                  .filter((point) => nearest(point.x) === index);
                const pose = poses[index];
                if (!pose[11] || !pose[12]) continue;
                const aspect = data.bitmap.width / data.bitmap.height;
                const width = Math.hypot(
                  (pose[11].x - pose[12].x) * aspect,
                  pose[11].y - pose[12].y,
                );
                if (palms.length >= 2 && width > 0)
                  handDistances[index] =
                    Math.hypot(
                      (palms[0].x - palms[1].x) * aspect,
                      palms[0].y - palms[1].y,
                    ) / width;
              }
            }
          }
          const tracked = [state, secondState]
            .slice(0, options.players ?? 1)
            .map((previous, index) =>
              stepBodyGestures(previous, poses[index] ?? [], data.at, {
                enabled: recognitionEnabled,
                mirrored: true,
                aspectRatio: data.bitmap.width / data.bitmap.height,
                allowed,
                seated: options.seated,
                sensitivity: options.sensitivity,
                face: faceScores[index],
                handDistance: handDistances[index],
              }),
            );
          state = tracked[0].state;
          if (tracked[1]) secondState = tracked[1].state;
          const activeIndex = (options.activePlayer ?? 1) - 1;
          const next = tracked[activeIndex] ?? tracked[0];
          const events: BodyGestureEvent[] = tracked.flatMap((item, index) =>
            item.event
              ? [
                  {
                    ...item.event,
                    ...(options.players === 2
                      ? { player: (index + 1) as 1 | 2 }
                      : {}),
                    ...(item.event.type === 'HAND_RAISE'
                      ? {
                          hand:
                            item.state.detectors.HAND_RAISE.hands === 1
                              ? ('left' as const)
                              : item.state.detectors.HAND_RAISE.hands === 2
                                ? ('right' as const)
                                : ('both' as const),
                        }
                      : {}),
                  },
                ]
              : [],
          );
          let debugFrame: ImageBitmap | HTMLCanvasElement | undefined;
          if (debugEnabled) {
            try {
              if (
                !debugCanvas ||
                debugCanvas.width !== data.bitmap.width ||
                debugCanvas.height !== data.bitmap.height
              )
                debugCanvas = makeCanvas(data.bitmap.width, data.bitmap.height);
              debugFrame = drawPoseDebug(
                debugCanvas,
                result.landmarks[0] ?? [],
              );
            } catch {
              /* Optional diagnostics must not stop tracking or the story. */
            }
          }
          let shadowFrame: ImageBitmap | HTMLCanvasElement | undefined;
          if (shadowEnabled) {
            shadowCanvas ??= makeCanvas(320, 240);
            shadowFrame = drawPoseDebug(
              shadowCanvas,
              poses[activeIndex] ?? [],
              true,
            );
          }
          emit(
            {
              type: 'pose',
              event: events[0] ?? null,
              events,
              tracking: {
                ...next.tracking,
                ...(debugEnabled && extraDiagnostic
                  ? { diagnostic: extraDiagnostic }
                  : {}),
                unavailable: [
                  ...(needsFace && !face ? ['BLOW'] : []),
                  ...(needsHands && !hands ? ['CLAP'] : []),
                ],
              },
              ...(debugFrame ? { debugFrame } : {}),
              ...(shadowFrame ? { shadowFrame } : {}),
              ...(import.meta.env.DEV && recordingEnabled
                ? {
                    fixtureFrame: {
                      atMs: data.at,
                      face: faceScores[activeIndex],
                      handDistance: handDistances[activeIndex],
                      aspectRatio: data.bitmap.width / data.bitmap.height,
                      landmarks: (result.landmarks[0] ?? []).map(
                        ({ x, y, visibility }) => ({ x, y, visibility }),
                      ),
                    },
                  }
                : {}),
            },
            {
              transfer: [debugFrame, shadowFrame].filter(
                (frame): frame is ImageBitmap => !!frame && 'close' in frame,
              ),
            },
          );
        } finally {
          if ('close' in data.bitmap) data.bitmap.close();
        }
      }
    } catch (error) {
      model?.close();
      model = null;
      emit({
        type: 'error',
        reason: error instanceof Error ? error.message : 'Pose worker failed',
      });
    }
  };
}
