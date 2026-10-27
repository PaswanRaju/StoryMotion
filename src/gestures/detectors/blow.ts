import { defineDetector } from '../detector';
import { GESTURE_CONFIG } from '../config';
export const blow = defineDetector('BLOW', ({ face, sensitivity = 1 }) => {
  const score = Math.max(face?.cheekPuff ?? 0, face?.mouthPucker ?? 0);
  return {
    available: !!face,
    matches: score >= GESTURE_CONFIG.extended.blow * sensitivity,
    neutral: score < GESTURE_CONFIG.extended.blow / 2,
  };
});
