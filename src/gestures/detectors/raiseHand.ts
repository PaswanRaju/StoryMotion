import { defineDetector } from '../detector';
import { GESTURE_CONFIG } from '../config';

export const raiseHand = defineDetector(
  'HAND_RAISE',
  ({ metrics: m, lastHands, sensitivity = 1 }, state) => {
    const config = GESTURE_CONFIG.hand;
    const hands =
      (m.leftHand !== null && m.leftHand > config.raised * sensitivity
        ? 1
        : 0) |
      (m.rightHand !== null && m.rightHand > config.raised * sensitivity
        ? 2
        : 0);
    const relaxed = (
      hand: number | null,
      elbow: number | null,
      last: number | null,
    ) =>
      hand !== null
        ? hand < config.lowered
        : elbow !== null
          ? elbow > config.elbowBelow
          : last !== null && last < config.lowered;
    const down =
      (relaxed(m.leftHand, m.leftElbowDrop, lastHands[0]) ? 1 : 0) |
      (relaxed(m.rightHand, m.rightElbowDrop, lastHands[1]) ? 2 : 0);
    return {
      available: m.leftHand !== null || m.rightHand !== null || down !== 0,
      matches: hands !== 0,
      neutral: hands === 0 && (down & state.hands) === state.hands,
      hands,
    };
  },
);
