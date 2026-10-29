import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createActor } from 'xstate';
import { render, screen, cleanup } from '@testing-library/react';
import { stories } from '../stories';
import { StorySchema, validateStory } from '../engine/schema';
import type { Story } from '../engine/schema';
import { registryCatalog } from '../engine/registry';
import {
  currentInteraction,
  currentScene,
  storyMachine,
} from '../engine/storyMachine';
import { SceneRenderer } from '../engine/SceneRenderer';

const fixture = (): Story => ({
  id: 'new-story',
  title: 'A new adventure',
  description: '',
  coverAsset: 'hare-cover',
  ageRange: [4, 8],
  startSceneId: 'intro',
  scenes: [
    {
      id: 'intro',
      title: 'Hello',
      durationMs: 1000,
      background: 'meadow',
      characters: [{ id: 'jack', x: 100, y: 200, animation: 'idle' }],
      narration: [{ atMs: 0, text: 'Hello Jack!' }],
      actions: [],
      soundEffects: [],
      transitions: { enterMs: 0, exitMs: 0 },
      events: ['intro'],
      interactions: [
        {
          id: 'help',
          atMs: 400,
          prompt: { title: 'Help Jack', body: 'Raise a hand!' },
          gesture: 'raiseHand',
          windowMs: 800,
          buttonLabel: 'Help',
          buttonText: 'Help',
          buttonHint: '',
          onSuccess: {
            actions: [{ characterId: 'jack', animation: 'celebrate' }],
            nextSceneId: null,
            caption: 'Thanks!',
            spoken: 'Thanks!',
          },
          onTimeout: {
            actions: [],
            nextSceneId: null,
            caption: 'On we go!',
            spoken: 'On we go!',
          },
          alternatives: [],
        },
      ],
      next: { type: 'scene', sceneId: 'conclusion' },
    },
    {
      id: 'conclusion',
      title: 'The End',
      durationMs: 400,
      background: 'meadow',
      characters: [],
      narration: [{ atMs: 0, text: 'The end.' }],
      actions: [],
      soundEffects: [],
      transitions: { enterMs: 0, exitMs: 0 },
      interactions: [],
      events: ['conclusion'],
      next: { type: 'ending' },
    },
  ],
});

describe('story schemas and graph validation', () => {
  it.each(Object.values(stories))(
    'validates the migrated $id data',
    (story) => {
      expect(
        validateStory(JSON.parse(JSON.stringify(story)), registryCatalog),
      ).toEqual(story);
    },
  );
  it('rejects malformed gestures, missing timeout/button fallback and invalid timings', () => {
    const story = fixture();
    const node = story.scenes[0].interactions[0];
    for (const broken of [
      { ...node, gesture: 'jump' },
      { ...node, windowMs: -1 },
      { ...node, onTimeout: undefined },
      { ...node, buttonLabel: '' },
    ]) {
      expect(
        StorySchema.safeParse({
          ...story,
          scenes: [{ ...story.scenes[0], interactions: [broken] }],
        }).success,
      ).toBe(false);
    }
  });
  it.each([
    'scene',
    'asset',
    'character',
    'animation',
    'sound',
    'start',
    'duplicate',
    'time',
    'action',
  ])('rejects broken %s references', (kind) => {
    const story = fixture();
    const scene = story.scenes[0];
    if (kind === 'scene')
      scene.interactions[0].onTimeout.nextSceneId = 'missing';
    if (kind === 'asset') scene.background = 'missing';
    if (kind === 'character') scene.characters[0].id = 'missing';
    if (kind === 'animation') scene.characters[0].animation = 'missing';
    if (kind === 'sound')
      scene.soundEffects.push({ atMs: 0, assetId: 'missing' });
    if (kind === 'start') story.startSceneId = 'missing';
    if (kind === 'duplicate') story.scenes.push(structuredClone(scene));
    if (kind === 'time') scene.narration[0].atMs = scene.durationMs;
    if (kind === 'action')
      scene.interactions[0].onSuccess.actions[0].characterId = 'mother';
    expect(() => validateStory(story, registryCatalog)).toThrow();
  });
  it('accepts converging branches and rejects a possible infinite path even with an exit', () => {
    const story = fixture();
    const branch = structuredClone(story.scenes[1]);
    branch.id = 'detour';
    branch.next = { type: 'scene', sceneId: 'conclusion' };
    story.scenes.push(branch);
    story.scenes[0].interactions[0].onSuccess.nextSceneId = 'detour';
    expect(() => validateStory(story, registryCatalog)).not.toThrow();
    branch.next.sceneId = 'intro';
    expect(() => validateStory(story, registryCatalog)).toThrow(/cycle/);
  });
  it('rejects an unreachable ending and a broken alternative route', () => {
    const story = fixture();
    story.scenes.push({
      ...structuredClone(story.scenes[1]),
      id: 'unreachable',
    });
    expect(() => validateStory(story, registryCatalog)).toThrow(/Unreachable/);
    story.scenes.pop();
    const node = story.scenes[0].interactions[0];
    node.alternatives.push({
      ...node,
      gesture: 'leanLeft',
      onSuccess: { ...node.onSuccess, nextSceneId: 'missing' },
    });
    expect(() => validateStory(story, registryCatalog)).toThrow(
      /Unknown scene/,
    );
  });
});

describe('XState story playback with real clock events and fake timers', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });
  const player = (story = fixture()) =>
    createActor(storyMachine, {
      input: { story: validateStory(story, registryCatalog) },
    }).start();
  it.each(['GESTURE', 'BUTTON', 'TIMEOUT'] as const)(
    'plays the %s path through the ending',
    (type) => {
      const actor = player();
      expect(actor.getSnapshot().matches('narrating')).toBe(true);
      actor.send({ type: 'GESTURE', gesture: 'raiseHand' });
      expect(actor.getSnapshot().context.responses).toEqual([null]);
      vi.advanceTimersByTime(400);
      expect(actor.getSnapshot().matches('interaction')).toBe(true);
      actor.send({ type: 'GESTURE', gesture: 'crouch' });
      expect(actor.getSnapshot().matches('interaction')).toBe(true);
      if (type === 'TIMEOUT') vi.advanceTimersByTime(800);
      else actor.send({ type, gesture: 'raiseHand' });
      expect(actor.getSnapshot().matches('narrating')).toBe(true);
      expect(actor.getSnapshot().context.responses).toEqual([
        type === 'TIMEOUT' ? null : 'HAND_RAISE',
      ]);
      expect(actor.getSnapshot().context.auto).toEqual([type === 'TIMEOUT']);
      expect(actor.getSnapshot().context.characterActions).toHaveLength(
        type === 'TIMEOUT' ? 0 : 1,
      );
      vi.advanceTimersByTime(1000);
      expect(actor.getSnapshot().matches('ending')).toBe(true);
      actor.stop();
    },
  );
  it('holds the story clock, pauses the window, ignores input and restarts cleanly', () => {
    const actor = player();
    vi.advanceTimersByTime(400);
    actor.send({ type: 'PAUSE', paused: true });
    vi.advanceTimersByTime(2000);
    actor.send({ type: 'BUTTON', gesture: 'raiseHand' });
    expect(actor.getSnapshot().context.remaining).toBe(800);
    expect(actor.getSnapshot().context.elapsed).toBe(400);
    actor.send({ type: 'PAUSE', paused: false });
    vi.advanceTimersByTime(200);
    expect(actor.getSnapshot().context.remaining).toBe(600);
    actor.send({ type: 'RESTART' });
    expect(actor.getSnapshot().context.elapsed).toBe(0);
    expect(actor.getSnapshot().context.responses).toEqual([null]);
    actor.stop();
  });
  it.each(['success', 'timeout', 'alternative'] as const)(
    'follows a different %s destination',
    (path) => {
      const story = fixture();
      const detour = {
        ...structuredClone(story.scenes[1]),
        id: 'detour',
        durationMs: 600,
      };
      story.scenes.push(detour);
      const node = story.scenes[0].interactions[0];
      node.onSuccess.nextSceneId = 'detour';
      node.onTimeout.nextSceneId = 'conclusion';
      node.alternatives.push({
        ...node,
        gesture: 'leanRight',
        onSuccess: { ...node.onSuccess, nextSceneId: 'conclusion' },
      });
      const actor = player(story);
      vi.advanceTimersByTime(400);
      if (path === 'timeout') vi.advanceTimersByTime(800);
      else
        actor.send({
          type: 'BUTTON',
          gesture: path === 'alternative' ? 'leanRight' : 'raiseHand',
        });
      expect(currentScene(actor.getSnapshot().context).id).toBe(
        path === 'success' ? 'detour' : 'conclusion',
      );
      vi.advanceTimersByTime(600);
      expect(actor.getSnapshot().matches('ending')).toBe(true);
      actor.stop();
    },
  );
  it.each(Object.values(stories))(
    'finishes $id with gesture, button and no-input paths',
    (story) => {
      for (const mode of ['GESTURE', 'BUTTON', 'none'] as const) {
        const actor = player(story);
        let ticks = 0;
        while (!actor.getSnapshot().context.finished && ticks++ < 2000) {
          vi.advanceTimersByTime(200);
          if (mode !== 'none' && actor.getSnapshot().matches('interaction')) {
            const node = currentInteraction(actor.getSnapshot().context)!;
            actor.send({ type: mode, gesture: node.gesture });
          }
        }
        expect(actor.getSnapshot().matches('ending')).toBe(true);
        expect(
          actor
            .getSnapshot()
            .context.auto.every((value) => value === (mode === 'none')),
        ).toBe(true);
        actor.stop();
      }
    },
  );
  it('renders an unrelated scene using registry characters, placements and timed poses', () => {
    const scene = fixture().scenes[0];
    scene.actions.push({
      atMs: 200,
      characterId: 'jack',
      animation: 'walk',
      x: 300,
    });
    render(
      <SceneRenderer
        scene={scene}
        localMs={300}
        actions={[]}
        elapsed={300}
        paused={false}
        magic={false}
        gesture={null}
        outcomes={[]}
        openMoment={null}
        onFinishLine={() => {}}
      />,
    );
    expect(screen.getByTestId('sb-jack')).toHaveAttribute('data-pose', 'walk');
    expect(
      screen.getByTestId('sb-jack').closest('[data-anticipation]'),
    ).toHaveAttribute('transform', 'translate(300 200)');
  });
});
