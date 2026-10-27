import type { Gesture } from './schema';
import type { BodyGesture } from '../vision/bodyGestures';

const BODY: Record<Gesture, BodyGesture> = {
  blow: 'BLOW',
  climb: 'CLIMB',
  clap: 'CLAP',
  runInPlace: 'RUN_IN_PLACE',
  raiseHand: 'HAND_RAISE',
  spreadArms: 'ARMS_WIDE',
  leanLeft: 'LEAN_LEFT',
  leanRight: 'LEAN_RIGHT',
  crouch: 'CROUCH',
};
export const toBodyGesture = (gesture: Gesture): BodyGesture => BODY[gesture];
export const fromBodyGesture = (gesture: BodyGesture): Gesture =>
  (Object.keys(BODY) as Gesture[]).find((key) => BODY[key] === gesture)!;
