import { defineDetector } from '../detector';
import { alternating } from './alternating';
export const runInPlace = defineDetector('RUN_IN_PLACE', (frame, state) =>
  alternating(frame, state, true),
);
