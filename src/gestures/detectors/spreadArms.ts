import { defineDetector } from '../detector';
import { GESTURE_CONFIG } from '../config';

export const spreadArms = defineDetector(
  'ARMS_WIDE',
  ({ metrics: m, lastHands, sensitivity = 1 }) => {
    const c = GESTURE_CONFIG.spread;
    const down = (
      hand: number | null,
      elbow: number | null,
      last: number | null,
    ) =>
      hand !== null
        ? hand < GESTURE_CONFIG.hand.lowered
        : elbow !== null
          ? elbow > GESTURE_CONFIG.hand.elbowBelow
          : last !== null && last < GESTURE_CONFIG.hand.lowered;
    const neutral =
      down(m.leftHand, m.leftElbowDrop, lastHands[0]) &&
      down(m.rightHand, m.rightElbowDrop, lastHands[1]);
    const available = [
      m.leftExtension,
      m.rightExtension,
      m.leftElbow,
      m.rightElbow,
      m.leftHand,
      m.rightHand,
    ].every((value) => value !== null);
    return {
      available: available || neutral,
      neutral,
      matches:
        available &&
        m.leftExtension! > c.extension * sensitivity &&
        m.rightExtension! > c.extension * sensitivity &&
        m.leftElbow! > c.elbowAngle &&
        m.rightElbow! > c.elbowAngle &&
        m.leftHand! > c.minHeight &&
        m.rightHand! > c.minHeight &&
        m.leftHand! < c.maxHeight &&
        m.rightHand! < c.maxHeight,
    };
  },
);
