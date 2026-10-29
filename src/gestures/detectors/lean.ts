import { GESTURE_CONFIG } from '../config';
import type { DetectorFrame, DetectorState, GestureSample } from '../detector';

export function sampleLean(
  direction: 'left' | 'right',
  frame: DetectorFrame,
  state: DetectorState,
): GestureSample {
  const { metrics: m, baseline } = frame;
  const torso =
    m.lean !== null && baseline.lean !== null ? m.lean - baseline.lean : null;
  const tilt = m.slope !== null ? m.slope - baseline.slope : null;
  const lean = torso ?? tilt;
  const threshold =
    torso !== null ? GESTURE_CONFIG.lean.torso : GESTURE_CONFIG.lean.shoulder;
  const sign = (direction === 'left' ? -1 : 1) * (frame.mirrored ? -1 : 1);
  return {
    available: lean !== null,
    matches:
      lean !== null && lean * sign > threshold * (frame.sensitivity ?? 1),
    neutral:
      (!state.usedHips || torso !== null) &&
      lean !== null &&
      tilt !== null &&
      Math.abs(lean) < GESTURE_CONFIG.lean.neutral &&
      Math.abs(tilt) < GESTURE_CONFIG.lean.neutral,
    usedHips: torso !== null,
  };
}
