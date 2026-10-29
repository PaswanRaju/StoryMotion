import { defineDetector } from '../detector';
import { GESTURE_CONFIG } from '../config';
export const crouch = defineDetector(
  'CROUCH',
  ({ metrics: m, legsVisible, standingHeight, seated = false }) => {
    const c = GESTURE_CONFIG.crouch;
    const available =
      !seated &&
      legsVisible &&
      standingHeight !== null &&
      m.knee !== null &&
      m.hipHeight !== null;
    return {
      available,
      matches:
        available &&
        m.knee! < c.knee &&
        (m.knee! < c.deepKnee ||
          m.hipHeight! < standingHeight! * c.heightRatio),
      neutral:
        available &&
        m.knee! >= c.standingKnee &&
        m.hipHeight! > standingHeight! * c.neutralRatio,
    };
  },
);
