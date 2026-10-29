import { defineDetector } from '../detector';
import { sampleLean } from './lean';
export const leanRight = defineDetector('LEAN_RIGHT', (frame, state) =>
  sampleLean('right', frame, state),
);
