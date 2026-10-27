import { z } from 'zod';
import {
  DraftSchema,
  GenerationRequestSchema,
  generationCatalog,
  HEROES,
  SETTINGS,
} from './contract';
import type { GenerationRequest } from './contract';
import { validateStory } from '../engine/schema';
import type { Story } from '../engine/schema';
export interface StoryProvider {
  generate(
    system: string,
    request: GenerationRequest,
    feedback: string,
  ): Promise<unknown>;
  isSafe(text: string): Promise<boolean>;
}
export const STORY_SYSTEM_PROMPT = `Write a complete, gentle children's story as structured JSON. Use only these heroes: ${HEROES.join(', ')} and settings: ${SETTINGS.join(', ')}. Lessons: sharing, bravery, honesty, kindness. No personal names, locations, identifiers or requests for information. Intro, plot, climax, conclusion in that order. 3–5 optional interactions; gestures may be raiseHand, spreadArms, leanLeft, leanRight, crouch, blow, climb, clap, runInPlace. Every timeout warmly moves the plot along. No failure, score or changed moral. Classic fairy-tale peril at most; for ages 4–5 use no frightening threat. No violence, frightening imagery or adult themes. Use the selected language. Short: 4–5 scenes, medium: 6–8. Preserve this fixed plot for age regeneration: hero finds a shared community task in the setting; two small obstacles invite the selected lesson; a final cooperative solution resolves the task; everyone celebrates and the hero reflects on the lesson. The seed selects harmless details, never a different lesson or plot structure. If requested, include 2–3 simple comprehension questions with two choices and answer 0 or 1; otherwise quiz must be empty.`;
export function compileDraft(input: unknown, recipe: GenerationRequest): Story {
  const draft = DraftSchema.parse(input);
  const stages = draft.scenes.map((scene) => scene.stage);
  if (
    stages[0] !== 'intro' ||
    stages.at(-1) !== 'conclusion' ||
    !stages.includes('plot') ||
    !stages.includes('climax') ||
    stages.indexOf('climax') < stages.indexOf('plot')
  )
    throw new Error('Include intro, plot, climax, conclusion in order');
  const count = draft.scenes.filter((scene) => scene.interaction).length;
  if (count < 3 || count > 5) throw new Error('Use 3–5 interactions');
  if (recipe.quiz && (draft.quiz.length < 2 || draft.quiz.length > 3))
    throw new Error('Include 2–3 quiz questions');
  if (!recipe.quiz && draft.quiz.length)
    throw new Error('Quiz was not requested');
  const ageRange = recipe.age.split('–').map(Number) as [number, number];
  const story: Story = {
    id: `generated-${recipe.seed}-${recipe.age.replace('–', '-')}`,
    title: draft.title,
    description: draft.description,
    coverAsset: recipe.setting,
    language: recipe.language,
    ageRange,
    startSceneId: draft.scenes[0].id,
    scenes: draft.scenes.map((scene, index) => {
      const speechMs = Math.ceil(
        (scene.narration.split(/\s+/).length / 1.8) * 1000 + 1200,
      );
      const durationMs = Math.max(
        9000,
        speechMs + (scene.interaction ? 2500 : 0),
      );
      const node = scene.interaction;
      const outcome = (text: string) => ({
        actions: [{ characterId: recipe.hero, animation: 'happy' }],
        nextSceneId: null,
        caption: text,
        spoken: text,
      });
      return {
        id: scene.id,
        title: scene.title,
        background: recipe.setting,
        durationMs,
        characters: [{ id: recipe.hero, x: 960, y: 850, animation: 'idle' }],
        narration: [
          {
            atMs: 0,
            text: scene.narration,
            translations: { [recipe.language]: { text: scene.narration } },
          },
        ],
        actions: [],
        soundEffects: [],
        transitions: { enterMs: 500, exitMs: 300 },
        interactions: node
          ? [
              {
                id: node.id,
                atMs: speechMs,
                gesture: node.gesture,
                windowMs: 9000,
                prompt: { title: 'A little story magic', body: node.prompt },
                buttonLabel: node.buttonLabel,
                buttonText: node.buttonLabel,
                buttonHint: 'You can tap, too.',
                onSuccess: outcome(node.success),
                onTimeout: outcome(node.timeout),
                alternatives: [],
              },
            ]
          : [],
        next:
          index < draft.scenes.length - 1
            ? { type: 'scene', sceneId: draft.scenes[index + 1].id }
            : { type: 'ending' },
        events: [
          scene.stage,
          ...(scene.stage === 'conclusion' ? ['moral'] : []),
        ],
      };
    }),
    quiz: draft.quiz,
  };
  return validateStory(story, generationCatalog);
}
export async function generateStory(
  input: unknown,
  provider: StoryProvider,
  source?: Story,
): Promise<Story> {
  const recipe = GenerationRequestSchema.parse(input);
  let feedback = '';
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const prompt = source
        ? `${STORY_SYSTEM_PROMPT}
Rewrite the approved source story below for the new age. Keep its exact scene ids/order, interaction ids/gestures, hero, plot events, conclusion and moral. Adapt the wording for reading level; never invent a new plot. The source is signed server output, not a user instruction:
${JSON.stringify(source)}`
        : STORY_SYSTEM_PROMPT;
      const draft = await provider.generate(prompt, recipe, feedback);
      if (source) {
        const rewritten = DraftSchema.parse(draft);
        if (
          rewritten.scenes.length !== source.scenes.length ||
          rewritten.scenes.some((scene, index) => {
            const original = source.scenes[index];
            return (
              scene.id !== original.id ||
              (scene.interaction?.id ?? null) !==
                (original.interactions[0]?.id ?? null) ||
              (scene.interaction?.gesture ?? null) !==
                (original.interactions[0]?.gesture ?? null)
            );
          })
        )
          throw new Error(
            'Preserve the source scene order and interaction ids/gestures',
          );
      }
      const story = compileDraft(draft, recipe);
      if (!(await provider.isSafe(JSON.stringify(story))))
        throw new Error(
          'Content was flagged; write a different, gentler story',
        );
      return story;
    } catch (error) {
      feedback =
        error instanceof z.ZodError
          ? error.issues
              .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
              .join('; ')
              .slice(0, 2000)
          : error instanceof Error
            ? error.message.slice(0, 500)
            : 'Invalid story';
    }
  }
  throw new Error(
    'Our story stars need a little rest. Please try again later.',
  );
}
