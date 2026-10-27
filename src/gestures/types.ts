export const BODY_GESTURES = [
  'HAND_RAISE',
  'LEAN_LEFT',
  'LEAN_RIGHT',
  'ARMS_WIDE',
  'CROUCH',
  'BLOW',
  'CLIMB',
  'CLAP',
  'RUN_IN_PLACE',
] as const;
export type BodyGesture = (typeof BODY_GESTURES)[number];
export type BodyGestureEvent = {
  type: BodyGesture;
  player?: 1 | 2;
  hand?: 'left' | 'right' | 'both';
};
export type BodyTracking = {
  diagnostic?: string;
  unavailable?: readonly BodyGesture[];
  framing?: 'stepBack' | 'showHands' | 'ready' | 'moveIntoView';
  landmarkCount: number;
  upperBody: boolean;
  calibrated: boolean;
  legsVisible: boolean;
  crouchAvailable: boolean;
  headDirection: 'left' | 'right' | 'forward' | 'unknown';
  /** Gesture currently being recognized (for "Almost there…" feedback). */
  pending?: BodyGesture | null;
  /** 0–1 progress through the short stability window of `pending`. */
  progress?: number;
  /** Mean visibility of shoulders, elbows and wrists, 0–1 (developer view only). */
  confidence?: number;
};
export type Metrics = {
  slope: number | null;
  lean: number | null;
  leftHand: number | null;
  rightHand: number | null;
  leftExtension: number | null;
  rightExtension: number | null;
  leftElbow: number | null;
  rightElbow: number | null;
  /** Elbow height below its shoulder, in shoulder widths (positive = lower). */
  leftElbowDrop: number | null;
  rightElbowDrop: number | null;
  knee: number | null;
  hipHeight: number | null;
};
export type Baseline = { slope: number; lean: number | null };
