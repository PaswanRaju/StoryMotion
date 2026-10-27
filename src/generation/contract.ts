import { z } from 'zod';
import type { RegistryCatalog } from '../engine/schema';
export const HEROES = [
  'jack',
  'mother',
  'tortoise',
  'hare',
  'pig-one',
  'pig-two',
  'pig-three',
  'hen',
] as const;
export const SETTINGS = ['meadow', 'woodland', 'space'] as const;
export const LESSONS = ['sharing', 'bravery', 'honesty', 'kindness'] as const;
export const GenerationRequestSchema = z.strictObject({
  hero: z.enum(HEROES),
  setting: z.enum(SETTINGS),
  lesson: z.enum(LESSONS),
  age: z.enum(['4–5', '6–7', '8–9']),
  length: z.enum(['short', 'medium']),
  quiz: z.boolean(),
  seed: z.number().int().min(0).max(1000000000),
  language: z.enum(['en', 'es']),
});
export const GenerationEnvelopeSchema = GenerationRequestSchema.extend({
  sourceToken: z.string().max(96000).optional(),
});
export type GenerationRequest = z.infer<typeof GenerationRequestSchema>;
export const generationCatalog: RegistryCatalog = {
  assets: new Set(SETTINGS),
  sounds: new Set(['sparkle', 'cheer', 'whoosh']),
  characters: Object.fromEntries(
    HEROES.map((id) => [
      id,
      ['idle', 'happy', 'scared', 'casting', 'reacting'],
    ]),
  ),
};
export const QuizQuestionSchema = z.object({
  question: z.string().min(1).max(240),
  choices: z.array(z.string().min(1).max(160)).length(2),
  answer: z.union([z.literal(0), z.literal(1)]),
});
export const DraftSchema = z.strictObject({
  title: z.string().min(1).max(100),
  description: z.string().max(300),
  scenes: z
    .array(
      z.strictObject({
        id: z.string().min(1).max(80),
        title: z.string().min(1).max(100),
        stage: z.enum(['intro', 'plot', 'climax', 'conclusion']),
        narration: z.string().min(10).max(1600),
        interaction: z
          .strictObject({
            id: z.string().min(1).max(80),
            gesture: z.enum([
              'raiseHand',
              'spreadArms',
              'leanLeft',
              'leanRight',
              'crouch',
              'blow',
              'climb',
              'clap',
              'runInPlace',
            ]),
            prompt: z.string().min(1).max(240),
            buttonLabel: z.string().min(1).max(80),
            success: z.string().min(1).max(240),
            timeout: z.string().min(1).max(240),
          })
          .nullable(),
      }),
    )
    .min(4)
    .max(8),
  quiz: z.array(QuizQuestionSchema).max(3),
});
