import { defineDetector } from '../detector';
import { sampleLean } from './lean';
export const leanLeft = defineDetector('LEAN_LEFT', (frame, state) =>
  sampleLean('left', frame, state),
);
