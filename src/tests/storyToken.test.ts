import { expect, it, vi } from 'vitest';
import { signStory, verifyStory } from '../../api/storyToken';
import { compileDraft, generateStory } from '../generation/service';
import type { GenerationRequest } from '../generation/contract';
const recipe: GenerationRequest = {
  hero: 'jack',
  setting: 'meadow',
  lesson: 'kindness',
  age: '4–5',
  length: 'short',
  quiz: false,
  seed: 12,
  language: 'en',
};
const draft = () => ({
  title: 'Kind friends',
  description: 'A gentle day.',
  scenes: ['intro', 'plot', 'climax', 'conclusion'].map((stage, index) => ({
    id: `scene-${index}`,
    title: stage,
    stage,
    narration: 'Jack and his friends shared their work and helped one another.',
    interaction:
      index < 3
        ? {
            id: `help-${index}`,
            gesture: 'raiseHand',
            prompt: 'Help Jack.',
            buttonLabel: 'Help',
            success: 'Thank you!',
            timeout: 'Jack found a way.',
          }
        : null,
  })),
  quiz: [],
});
it('signs approved story sources and rejects altered recipes or text', () => {
  const story = compileDraft(draft(), recipe);
  const token = signStory(story, recipe, 'test-secret');
  expect(verifyStory(token, 'test-secret')).toEqual({ story, recipe });
  const [payload, signature] = token.split('.');
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
  decoded.story.title = 'Changed';
  expect(() =>
    verifyStory(
      `${Buffer.from(JSON.stringify(decoded)).toString('base64url')}.${signature}`,
      'test-secret',
    ),
  ).toThrow();
  expect(() => verifyStory(token, 'wrong-secret')).toThrow();
});
it('preserves source structure when adapting age and retries rewritten plots that change ids', async () => {
  const story = compileDraft(draft(), recipe);
  const changed = draft();
  changed.scenes[1].id = 'different-plot';
  const provider = {
    generate: vi.fn().mockResolvedValueOnce(changed).mockResolvedValue(draft()),
    isSafe: vi.fn().mockResolvedValue(true),
  };
  const adapted = await generateStory(
    { ...recipe, age: '8–9' },
    provider,
    story,
  );
  expect(adapted.scenes.map((scene) => scene.id)).toEqual(
    story.scenes.map((scene) => scene.id),
  );
  expect(provider.generate).toHaveBeenCalledTimes(2);
  expect(provider.generate.mock.calls[0][0]).toContain('approved source story');
});
