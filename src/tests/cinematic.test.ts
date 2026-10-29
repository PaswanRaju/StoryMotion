import { expect, it } from 'vitest';
import { cameraAt } from '../engine/camera';
import { stories } from '../stories';
import { validateStory } from '../engine/schema';
import { registryCatalog } from '../engine/registry';
import { createActor } from 'xstate';
import { storyMachine } from '../engine/storyMachine';
it('interpolates camera pans/zoom and disables all camera motion when reduced', () => {
  const scene = {
    ...stories.hare.scenes[0],
    cameraActions: [
      { type: 'pan' as const, atMs: 0, durationMs: 1000, x: 200, y: 100 },
      { type: 'zoom' as const, atMs: 0, durationMs: 1000, value: 2 },
      { type: 'shake' as const, atMs: 0, durationMs: 1000, intensity: 10 },
    ],
  };
  expect(cameraAt(scene, 500).x).toBe(100);
  expect(cameraAt(scene, 500).zoom).toBe(1.5);
  expect(cameraAt(scene, 500, true)).toEqual({
    x: 0,
    y: 0,
    zoom: 1,
    shakeX: 0,
    shakeY: 0,
  });
});
it('validates parallax asset references', () => {
  const story = structuredClone(stories.hare);
  story.scenes[0].layers = [{ assetId: 'missing', speed: 0.5 }];
  expect(() => validateStory(story, registryCatalog)).toThrow(/layer/);
});
it('routes co-op input only from the assigned child and keeps button/timeout alternatives', () => {
  const story = structuredClone(stories.hare);
  const scene = story.scenes[0];
  scene.interactions = [
    {
      ...structuredClone(story.scenes[2].interactions[0]),
      id: 'coop-help',
      atMs: 200,
      player: 2,
    },
  ];
  const actor = createActor(storyMachine, {
    input: { story, clock: false },
  }).start();
  actor.send({ type: 'TICK', ms: 200 });
  expect(actor.getSnapshot().matches('interaction')).toBe(true);
  actor.send({ type: 'GESTURE', gesture: 'spreadArms', player: 1 });
  expect(actor.getSnapshot().matches('interaction')).toBe(true);
  actor.send({ type: 'BUTTON', gesture: 'spreadArms', player: 2 });
  expect(actor.getSnapshot().context.responses[0]).toBe('ARMS_WIDE');
  actor.stop();
});
it('teacher controls skip and replay scenes without trapping the story', () => {
  const actor = createActor(storyMachine, {
    input: { story: stories.hare, clock: false },
  }).start();
  actor.send({ type: 'SKIP_SCENE' });
  expect(actor.getSnapshot().context.sceneId).toBe('hare-challenge');
  actor.send({ type: 'TICK', ms: 1000 });
  actor.send({ type: 'REPLAY_SCENE' });
  expect(actor.getSnapshot().context.localMs).toBe(0);
  for (let i = 0; i < stories.hare.scenes.length; i++)
    actor.send({ type: 'SKIP_SCENE' });
  expect(actor.getSnapshot().matches('ending')).toBe(true);
  actor.stop();
});
