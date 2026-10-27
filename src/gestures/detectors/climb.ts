import { defineDetector } from '../detector';
import { alternating } from './alternating';
export const climb = defineDetector('CLIMB', (frame, state) =>
  alternating(frame, state),
);
