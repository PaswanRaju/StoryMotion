import { describe, expect, it, vi } from 'vitest';
import {
  GenerationRequestSchema,
  generationCatalog,
} from '../generation/contract';
import type { GenerationRequest } from '../generation/contract';
import { compileDraft, generateStory } from '../generation/service';
import { registryCatalog } from '../engine/registry';
const recipe: GenerationRequest = {
  hero: 'jack',
  setting: 'meadow',
  lesson: 'kindness',
  age: '4–5',
  length: 'short',
  quiz: false,
  seed: 123,
  language: 'en',
};
const draft = () => ({
  title: 'A kind day',
  description: 'Friends help one another.',
  scenes: ['intro', 'plot', 'climax', 'conclusion'].map((stage, index) => ({
    id: `scene-${index}`,
    title: stage,
    stage,
    narration: 'Jack and his friends helped one another in the sunny meadow.',
    interaction:
      index < 3
        ? {
            id: `help-${index}`,
            gesture: 'raiseHand',
            prompt: 'Raise a hand to help.',
            buttonLabel: 'Help',
            success: 'Thank you!',
            timeout: 'Jack found a way!',
          }
        : null,
  })),
  quiz: [],
});
const provider = () => ({
  generate: vi.fn().mockResolvedValue(draft()),
  isSafe: vi.fn().mockResolvedValue(true),
});
describe('parent-facing generation service', () => {
  it('produces schema-valid, moderated, locally playable stories', async () => {
    const model = provider();
    const story = await generateStory(recipe, model);
    expect(story.scenes).toHaveLength(4);
    expect(model.generate).toHaveBeenCalledOnce();
    expect(model.isSafe).toHaveBeenCalledOnce();
    expect(story.scenes.at(-1)?.events).toContain('moral');
    expect(
      [...generationCatalog.assets].every((id) =>
        registryCatalog.assets.has(id),
      ),
    ).toBe(true);
    for (const [id, states] of Object.entries(generationCatalog.characters))
      expect(
        states.every((state) => registryCatalog.characters[id].includes(state)),
      ).toBe(true);
  });
  it('retries broken structured output with validation errors, at most twice', async () => {
    const model = provider();
    model.generate
      .mockResolvedValueOnce({ bad: true })
      .mockResolvedValueOnce(draft());
    await generateStory(recipe, model);
    expect(model.generate).toHaveBeenCalledTimes(2);
    expect(model.generate.mock.calls[1][2]).toContain('title');
    expect(model.isSafe).toHaveBeenCalledOnce();
  });
  it('rejects flagged content and generates a fresh moderated story', async () => {
    const model = provider();
    model.isSafe.mockResolvedValueOnce(false).mockResolvedValue(true);
    await generateStory(recipe, model);
    expect(model.generate).toHaveBeenCalledTimes(2);
    expect(model.generate.mock.calls[1][2]).toContain('flagged');
  });
  it('fails closed after repeated validation or moderation rejections', async () => {
    for (const invalid of [true, false]) {
      const model = provider();
      if (invalid) model.generate.mockResolvedValue({});
      else model.isSafe.mockResolvedValue(false);
      await expect(generateStory(recipe, model)).rejects.toThrow('story stars');
      expect(model.generate).toHaveBeenCalledTimes(3);
    }
  });
  it('does not accept free text, names, camera data or unsupported selections', async () => {
    for (const extra of [
      { name: 'secret' },
      { landmarks: [] },
      { audio: 'secret' },
      { hero: 'not-registered' },
    ]) {
      const model = provider();
      await expect(
        generateStory({ ...recipe, ...extra }, model),
      ).rejects.toThrow();
      expect(model.generate).not.toHaveBeenCalled();
    }
    expect(
      GenerationRequestSchema.safeParse({ ...recipe, age: '12–13' }).success,
    ).toBe(false);
  });
  it('requires a complete plot, 3–5 interactions and the requested number of quiz questions', () => {
    const incomplete = draft();
    incomplete.scenes[0].stage = 'climax';
    expect(() => compileDraft(incomplete, recipe)).toThrow(/intro/);
    const few = draft();
    few.scenes[0].interaction = null;
    expect(() => compileDraft(few, recipe)).toThrow(/3–5/);
    expect(() => compileDraft(draft(), { ...recipe, quiz: true })).toThrow(
      /2–3/,
    );
  });
  it('keeps regeneration selections and seed fixed while changing reading age', async () => {
    const model = provider();
    const older = { ...recipe, age: '8–9' as const };
    const story = await generateStory(older, model);
    expect(story.ageRange).toEqual([8, 9]);
    expect(model.generate.mock.calls[0][1]).toEqual(older);
  });
});
