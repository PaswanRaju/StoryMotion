import { z } from 'zod';

const id = z.string().min(1);
const ms = z.number().finite().nonnegative();
export const GestureSchema = z.enum([
  'raiseHand',
  'spreadArms',
  'leanLeft',
  'leanRight',
  'crouch',
  'blow',
  'climb',
  'clap',
  'runInPlace',
]);
export const CharacterActionSchema = z.object({
  characterId: id,
  animation: id,
  x: z.number().finite().optional(),
  y: z.number().finite().optional(),
});
const OutcomeSchema = z.object({
  actions: z.array(CharacterActionSchema),
  /** null resumes the current scene after its invitation. */
  nextSceneId: id.nullable(),
  caption: z.string(),
  spoken: z.string(),
});
export const InteractionNodeSchema = z.object({
  id,
  atMs: ms,
  prompt: z.object({
    title: z.string(),
    body: z.string(),
    narrate: z.boolean().optional(),
  }),
  gesture: GestureSchema,
  player: z.union([z.literal(1), z.literal(2)]).optional(),
  windowMs: z.number().finite().positive(),
  buttonLabel: id,
  buttonText: id,
  buttonHint: z.string(),
  onSuccess: OutcomeSchema,
  onTimeout: OutcomeSchema,
  /** Alternatives share one response window (e.g. left/right). */
  alternatives: z.array(
    z.object({
      gesture: GestureSchema,
      buttonLabel: id,
      buttonText: id,
      buttonHint: z.string(),
      onSuccess: OutcomeSchema,
    }),
  ),
});
export const SceneSchema = z.object({
  id,
  title: id,
  durationMs: z.number().finite().positive(),
  background: id,
  layers: z
    .array(
      z.object({
        assetId: id,
        speed: z.number().min(0).max(3),
        x: z.number().optional(),
        y: z.number().optional(),
      }),
    )
    .optional(),
  cameraActions: z
    .array(
      z.discriminatedUnion('type', [
        z.object({
          type: z.literal('pan'),
          atMs: ms,
          durationMs: ms,
          x: z.number().finite(),
          y: z.number().finite(),
        }),
        z.object({
          type: z.literal('zoom'),
          atMs: ms,
          durationMs: ms,
          value: z.number().min(0.5).max(3),
        }),
        z.object({
          type: z.literal('shake'),
          atMs: ms,
          durationMs: ms,
          intensity: z.number().min(0).max(20),
        }),
      ]),
    )
    .optional(),
  characters: z.array(
    z.object({
      id,
      x: z.number().finite(),
      y: z.number().finite(),
      animation: id,
    }),
  ),
  narration: z
    .array(
      z.object({
        atMs: ms,
        text: z.string().min(1),
        audioAsset: id.optional(),
        wordTimings: z
          .array(
            z.object({ atMs: ms, charIndex: z.number().int().nonnegative() }),
          )
          .optional(),
        translations: z
          .record(
            z.string(),
            z.object({ text: z.string().min(1), audioAsset: id.optional() }),
          )
          .optional(),
      }),
    )
    .min(1),
  actions: z.array(CharacterActionSchema.extend({ atMs: ms })),
  soundEffects: z.array(z.object({ atMs: ms, assetId: id })),
  transitions: z.object({ enterMs: ms, exitMs: ms }),
  interactions: z.array(InteractionNodeSchema),
  next: z.discriminatedUnion('type', [
    z.object({ type: z.literal('scene'), sceneId: id }),
    z.object({ type: z.literal('ending') }),
  ]),
  events: z.array(z.string()),
});
export const StorySchema = z.object({
  id,
  title: id,
  language: z.enum(['en', 'es']).optional(),
  description: z.string(),
  coverAsset: id,
  ageRange: z
    .tuple([z.number().int().nonnegative(), z.number().int().positive()])
    .refine(([min, max]) => min <= max, 'Invalid age range'),
  quiz: z
    .array(
      z.object({
        question: z.string().min(1),
        choices: z.array(z.string().min(1)).length(2),
        answer: z.union([z.literal(0), z.literal(1)]),
      }),
    )
    .max(3)
    .optional(),
  startSceneId: id,
  scenes: z.array(SceneSchema).min(1),
});
export type Story = z.infer<typeof StorySchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type InteractionNode = z.infer<typeof InteractionNodeSchema>;
export type Gesture = z.infer<typeof GestureSchema>;
export type CharacterAction = z.infer<typeof CharacterActionSchema>;
export type Outcome = z.infer<typeof OutcomeSchema>;
export type RegistryCatalog = {
  assets: ReadonlySet<string>;
  characters: Readonly<Record<string, readonly string[]>>;
  sounds: ReadonlySet<string>;
  audio?: ReadonlySet<string>;
  layerAssets?: ReadonlySet<string>;
};

/** Parse data and reject every possible non-terminating route, including cycles with exits. */
export function validateStory(input: unknown, catalog: RegistryCatalog): Story {
  const story = StorySchema.parse(input);
  const errors: string[] = [];
  const scenes = new Map(story.scenes.map((scene) => [scene.id, scene]));
  const check = (valid: boolean, message: string) => {
    if (!valid) errors.push(message);
  };
  check(scenes.size === story.scenes.length, 'Duplicate scene id');
  check(
    scenes.has(story.startSceneId),
    `Unknown start scene: ${story.startSceneId}`,
  );
  check(
    catalog.assets.has(story.coverAsset),
    `Unknown cover asset: ${story.coverAsset}`,
  );
  const interactionIds = new Set<string>();
  const edges = new Map<string, string[]>();
  for (const scene of story.scenes) {
    const destinations: string[] = [];
    if (scene.next.type === 'scene') destinations.push(scene.next.sceneId);
    check(
      catalog.assets.has(scene.background),
      `Unknown background asset: ${scene.background}`,
    );
    for (const layer of scene.layers ?? [])
      check(
        (catalog.layerAssets ?? catalog.assets).has(layer.assetId),
        `Unknown layer asset: ${layer.assetId}`,
      );
    for (const camera of scene.cameraActions ?? [])
      check(
        camera.atMs < scene.durationMs,
        `Camera action outside scene: ${scene.id}`,
      );
    const cast = new Set(scene.characters.map((character) => character.id));
    check(
      cast.size === scene.characters.length,
      `Duplicate character in ${scene.id}`,
    );
    const action = (value: CharacterAction) => {
      check(
        cast.has(value.characterId),
        `Unknown scene character: ${value.characterId}`,
      );
      check(
        catalog.characters[value.characterId]?.includes(value.animation) ??
          false,
        `Unknown character/animation: ${value.characterId}/${value.animation}`,
      );
    };
    scene.characters.forEach((character) =>
      action({ characterId: character.id, animation: character.animation }),
    );
    const time = (at: number) =>
      check(at < scene.durationMs, `Event outside scene: ${scene.id}`);
    let previousLineAt = -1;
    scene.narration.forEach((line) => {
      time(line.atMs);
      for (const asset of [
        line.audioAsset,
        ...Object.values(line.translations ?? {}).map(
          (value) => value.audioAsset,
        ),
      ])
        if (asset)
          check(
            catalog.audio?.has(asset) ?? false,
            `Unknown narration audio: ${asset}`,
          );
      let previousWordAt = -1;
      for (const word of line.wordTimings ?? []) {
        check(
          word.charIndex < line.text.length && word.atMs >= previousWordAt,
          `Invalid word timings in ${scene.id}`,
        );
        previousWordAt = word.atMs;
      }
      check(line.atMs > previousLineAt, `Unordered narration in ${scene.id}`);
      previousLineAt = line.atMs;
    });
    scene.actions.forEach((value) => {
      time(value.atMs);
      action(value);
    });
    scene.soundEffects.forEach((cue) => {
      time(cue.atMs);
      check(
        catalog.sounds.has(cue.assetId),
        `Unknown sound asset: ${cue.assetId}`,
      );
    });
    let previousAt = -1;
    for (const node of scene.interactions) {
      time(node.atMs);
      check(node.atMs > previousAt, `Unordered interactions in ${scene.id}`);
      previousAt = node.atMs;
      check(
        !interactionIds.has(node.id),
        `Duplicate interaction id: ${node.id}`,
      );
      interactionIds.add(node.id);
      const gestures = [
        node.gesture,
        ...node.alternatives.map((alt) => alt.gesture),
      ];
      check(
        new Set(gestures).size === gestures.length,
        `Duplicate gesture in ${node.id}`,
      );
      for (const outcome of [
        node.onSuccess,
        node.onTimeout,
        ...node.alternatives.map((alt) => alt.onSuccess),
      ]) {
        outcome.actions.forEach(action);
        if (outcome.nextSceneId !== null)
          destinations.push(outcome.nextSceneId);
      }
    }
    destinations.forEach((destination) =>
      check(scenes.has(destination), `Unknown scene: ${destination}`),
    );
    edges.set(scene.id, destinations);
  }
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (sceneId: string) => {
    if (visiting.has(sceneId)) {
      errors.push(`Non-ending cycle at ${sceneId}`);
      return;
    }
    if (visited.has(sceneId) || !scenes.has(sceneId)) return;
    visiting.add(sceneId);
    for (const next of edges.get(sceneId) ?? []) visit(next);
    visiting.delete(sceneId);
    visited.add(sceneId);
  };
  visit(story.startSceneId);
  for (const scene of story.scenes)
    check(visited.has(scene.id), `Unreachable scene: ${scene.id}`);
  if (errors.length)
    throw new Error(`Invalid story ${story.id}: ${errors.join('; ')}`);
  return story;
}
