import { defineDetector } from '../detector';
import { GESTURE_CONFIG } from '../config';
export const clap = defineDetector(
  'CLAP',
  ({ handDistance, sensitivity = 1 }, state) => {
    const c = GESTURE_CONFIG.extended;
    const wasOpen =
      state.wasOpen ||
      (handDistance !== undefined && handDistance > c.clapOpen);
    return {
      available: handDistance !== undefined,
      matches: wasOpen && handDistance! < c.clapClose / sensitivity,
      neutral: handDistance !== undefined && handDistance > c.clapOpen,
      memory: { wasOpen },
    };
  },
);
