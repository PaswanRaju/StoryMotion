import { z } from 'zod';
import { GESTURE_CONFIG } from './config';
import { BODY_GESTURES } from './types';
import { initialBodyGestureState, stepBodyGestures } from './index';
import type { BodyGestureEvent } from './types';

export const FixtureFrameSchema = z.object({
  atMs: z.number().finite().nonnegative(),
  aspectRatio: z.number().finite().positive(),
  face: z.record(z.string(), z.number().min(0).max(1)).optional(),
  handDistance: z.number().nonnegative().optional(),
  landmarks: z
    .array(
      z.object({
        x: z.number().finite(),
        y: z.number().finite(),
        visibility: z.number().min(0).max(1).optional(),
      }),
    )
    .max(33),
});
export type FixtureFrame = z.infer<typeof FixtureFrameSchema>;
export const PoseFixtureSchema = z
  .object({
    version: z.literal(1),
    label: z.enum([...BODY_GESTURES, 'neutral']),
    mirrored: z.boolean(),
    frames: z
      .array(FixtureFrameSchema)
      .min(1)
      .max(GESTURE_CONFIG.recorder.maxFrames),
  })
  .superRefine((fixture, context) => {
    fixture.frames.forEach((frame, index) => {
      if (index > 0 && frame.atMs <= fixture.frames[index - 1].atMs)
        context.addIssue({
          code: 'custom',
          message: 'Fixture timestamps must increase',
          path: ['frames', index, 'atMs'],
        });
    });
    if (
      fixture.frames.at(-1)!.atMs - fixture.frames[0].atMs >
      GESTURE_CONFIG.recorder.maxDurationMs
    )
      context.addIssue({
        code: 'custom',
        message: 'Fixture exceeds recording duration',
      });
  });
export type PoseFixture = z.infer<typeof PoseFixtureSchema>;

/** Replays local fixture data through exactly the same pure pipeline as the worker. */
export function replayFixture(
  input: unknown,
): { atMs: number; event: BodyGestureEvent }[] {
  const fixture = PoseFixtureSchema.parse(input);
  let state = initialBodyGestureState();
  const events: { atMs: number; event: BodyGestureEvent }[] = [];
  for (const frame of fixture.frames) {
    const next = stepBodyGestures(state, frame.landmarks, frame.atMs, {
      mirrored: fixture.mirrored,
      aspectRatio: frame.aspectRatio,
      face: frame.face,
      handDistance: frame.handDistance,
    });
    state = next.state;
    if (next.event) events.push({ atMs: frame.atMs, event: next.event });
  }
  return events;
}
