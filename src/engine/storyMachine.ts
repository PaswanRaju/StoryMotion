import { assign, fromCallback, raise, setup } from 'xstate';
import type {
  Story,
  Scene,
  InteractionNode,
  Gesture,
  Outcome,
  CharacterAction,
} from './schema';
import type { BodyGesture } from '../vision/bodyGestures';
import { toBodyGesture } from './gestures';

export type StoryEvent =
  | { type: 'TICK'; ms: number }
  | { type: 'GESTURE' | 'BUTTON'; gesture: Gesture; player?: 1 | 2 }
  | { type: 'TIMEOUT' }
  | { type: 'PAUSE'; paused: boolean }
  | { type: 'CAMERA_BUSY'; busy: boolean }
  | { type: 'RESTART' | 'SKIP_SCENE' | 'REPLAY_SCENE' };
export type PlayerContext = {
  story: Story;
  clockEnabled: boolean;
  sceneId: string;
  localMs: number;
  elapsed: number;
  paused: boolean;
  cameraBusy: boolean;
  finished: boolean;
  interaction: 'waiting' | 'open' | 'done';
  remaining: number;
  moment: number;
  responses: (BodyGesture | null)[];
  auto: boolean[];
  magic: boolean;
  gesture: BodyGesture | null;
  pendingIds: string[];
  resolved: string[];
  outcome: Outcome | null;
  outcomeGesture: Gesture | null;
  characterActions: CharacterAction[];
  sceneChanged: boolean;
};
export const currentScene = (context: PlayerContext): Scene =>
  context.story.scenes.find((scene) => scene.id === context.sceneId)!;
export const allInteractions = (story: Story) =>
  story.scenes.flatMap((scene) => scene.interactions);
export const currentInteraction = (
  context: PlayerContext,
): InteractionNode | undefined =>
  context.pendingIds
    .map((id) => allInteractions(context.story).find((node) => node.id === id)!)
    .find((node) => !context.resolved.includes(node.id));
function interactionStart(
  context: PlayerContext,
  node: InteractionNode,
): number {
  let start = 0;
  for (const scene of context.story.scenes) {
    if (scene.interactions.some((candidate) => candidate.id === node.id))
      return start + node.atMs;
    start += scene.durationMs;
  }
  return start;
}
export function initialPlayerContext(story: Story): PlayerContext {
  return {
    story,
    clockEnabled: true,
    sceneId: story.startSceneId,
    localMs: 0,
    elapsed: story.scenes
      .slice(
        0,
        story.scenes.findIndex((scene) => scene.id === story.startSceneId),
      )
      .reduce((sum, scene) => sum + scene.durationMs, 0),
    paused: false,
    cameraBusy: false,
    finished: false,
    interaction: 'waiting',
    remaining: 0,
    moment: 0,
    responses: allInteractions(story).map(() => null),
    auto: allInteractions(story).map(() => false),
    pendingIds: story.scenes
      .find((scene) => scene.id === story.startSceneId)!
      .interactions.map((node) => node.id),
    magic: false,
    gesture: null,
    resolved: [],
    outcome: null,
    outcomeGesture: null,
    characterActions: [],
    sceneChanged: false,
  };
}
function jump(
  context: PlayerContext,
  sceneId: string,
  branch = false,
): PlayerContext {
  const index = context.story.scenes.findIndex((scene) => scene.id === sceneId);
  const pendingIds = [
    ...(branch
      ? []
      : context.pendingIds.filter((id) => !context.resolved.includes(id))),
    ...context.story.scenes[index].interactions.map((node) => node.id),
  ];
  return {
    ...context,
    pendingIds,
    sceneId,
    localMs: 0,
    sceneChanged: true,
    characterActions: [],
    elapsed: context.story.scenes
      .slice(0, index)
      .reduce((sum, scene) => sum + scene.durationMs, 0),
  };
}
function resolve(
  context: PlayerContext,
  gesture: Gesture | null,
): PlayerContext {
  const node = currentInteraction(context);
  if (!node) return context;
  const index = allInteractions(context.story).findIndex(
    (candidate) => candidate.id === node.id,
  );
  const responses = [...context.responses];
  const auto = [...context.auto];
  const body = gesture ? toBodyGesture(gesture) : null;
  responses[index] = body;
  auto[index] = !gesture;
  const outcome =
    gesture === null
      ? node.onTimeout
      : gesture === node.gesture
        ? node.onSuccess
        : node.alternatives.find((alt) => alt.gesture === gesture)!.onSuccess;
  const resolved = [...context.resolved, node.id];
  return {
    ...context,
    responses,
    auto,
    resolved,
    outcome,
    outcomeGesture: gesture,
    magic: context.magic || body === 'HAND_RAISE',
    gesture: body ?? context.gesture,
    moment: index + 1,
    remaining: 0,
    interaction:
      resolved.length === allInteractions(context.story).length
        ? 'done'
        : 'waiting',
    characterActions: [...context.characterActions, ...outcome.actions],
  };
}
function advance(context: PlayerContext, ms: number): PlayerContext {
  if (context.paused || context.finished || !Number.isFinite(ms) || ms <= 0)
    return context;
  if (context.interaction === 'open') {
    const remaining = Math.max(0, context.remaining - ms);
    return remaining ? { ...context, remaining } : resolve(context, null);
  }
  let next = {
    ...context,
    sceneChanged: false,
    elapsed: context.elapsed + ms,
    localMs: context.localMs + ms,
  };
  const node = currentInteraction(next);
  if (node) {
    const start = interactionStart(next, node);
    if (next.elapsed >= start + node.windowMs) next = resolve(next, null);
    else if (!next.cameraBusy && next.elapsed >= start) {
      const elapsed = context.elapsed < start ? start : next.elapsed;
      const localMs = next.localMs - (next.elapsed - elapsed);
      next = {
        ...next,
        localMs,
        elapsed,
        interaction: 'open',
        remaining: node.windowMs,
        moment: allInteractions(next.story).findIndex(
          (candidate) => candidate.id === node.id,
        ),
      };
    }
  }
  if (
    !next.outcome &&
    next.interaction !== 'open' &&
    next.localMs >= currentScene(next).durationMs
  ) {
    const step = currentScene(next).next;
    if (step.type === 'ending') next = { ...next, finished: true };
    else {
      const overflow = next.localMs - currentScene(next).durationMs;
      const entered = jump(next, step.sceneId);
      next = {
        ...entered,
        localMs: overflow,
        elapsed: entered.elapsed + overflow,
      };
    }
  }
  return next;
}
const canAnswer = (
  context: PlayerContext,
  gesture: Gesture,
  player: 1 | 2 = 1,
) => {
  const node = currentInteraction(context);
  return (
    !context.paused &&
    !context.cameraBusy &&
    context.interaction === 'open' &&
    !!node &&
    (node.player === undefined || node.player === player) &&
    [node.gesture, ...node.alternatives.map((alt) => alt.gesture)].includes(
      gesture,
    )
  );
};

export const storyMachine = setup({
  types: {
    context: {} as PlayerContext,
    input: {} as { story: Story; clock?: boolean },
    events: {} as StoryEvent,
  },
  actors: {
    clock: fromCallback<StoryEvent, { enabled: boolean }>(
      ({ sendBack, input }) => {
        if (!input.enabled) return;
        let last = performance.now();
        const timer = setInterval(() => {
          const now = performance.now();
          sendBack({ type: 'TICK', ms: now - last });
          last = now;
        }, 200);
        return () => clearInterval(timer);
      },
    ),
  },
}).createMachine({
  id: 'story',
  initial: 'scene',
  context: ({ input }) => ({
    ...initialPlayerContext(input.story),
    clockEnabled: input.clock !== false,
  }),
  invoke: {
    src: 'clock',
    input: ({ context }) => ({ enabled: context.clockEnabled }),
  },
  on: {
    SKIP_SCENE: {
      target: '.scene',
      actions: assign(({ context }) => {
        const pending = context.pendingIds.filter(
          (id) => !context.resolved.includes(id),
        );
        const auto = [...context.auto];
        for (const id of pending)
          auto[
            allInteractions(context.story).findIndex((node) => node.id === id)
          ] = true;
        const next = {
          ...context,
          auto,
          resolved: [...context.resolved, ...pending],
          interaction: 'waiting' as const,
          remaining: 0,
          outcome: null,
        };
        const step = currentScene(context).next;
        return step.type === 'ending'
          ? { ...next, finished: true }
          : jump(next, step.sceneId, true);
      }),
    },
    REPLAY_SCENE: {
      target: '.scene',
      actions: assign(({ context }) => {
        const ids = currentScene(context).interactions.map((node) => node.id);
        const responses = [...context.responses],
          auto = [...context.auto];
        for (const id of ids) {
          const index = allInteractions(context.story).findIndex(
            (node) => node.id === id,
          );
          responses[index] = null;
          auto[index] = false;
        }
        return {
          ...jump(context, context.sceneId, true),
          responses,
          auto,
          finished: false,
          paused: false,
          interaction: 'waiting' as const,
          outcome: null,
          resolved: context.resolved.filter((id) => !ids.includes(id)),
        };
      }),
    },
    RESTART: {
      target: '.scene',
      actions: assign(({ context }) => ({
        ...initialPlayerContext(context.story),
        cameraBusy: context.cameraBusy,
        clockEnabled: context.clockEnabled,
      })),
    },
    PAUSE: { actions: assign(({ event }) => ({ paused: event.paused })) },
    CAMERA_BUSY: {
      target: '.scene',
      actions: assign(({ context, event }) => ({
        cameraBusy: event.busy,
        ...(event.busy && context.interaction === 'open'
          ? {
              interaction: 'waiting' as const,
              remaining: currentInteraction(context)?.windowMs ?? 0,
            }
          : {}),
      })),
    },
  },
  states: {
    scene: {
      always: [
        { guard: ({ context }) => context.finished, target: 'ending' },
        { guard: ({ context }) => !!context.outcome, target: 'reaction' },
        { guard: ({ context }) => context.sceneChanged, target: 'nextScene' },
        {
          guard: ({ context }) => context.interaction === 'open',
          target: 'interaction',
        },
        { target: 'narrating' },
      ],
    },
    narrating: {
      on: {
        TICK: {
          target: 'scene',
          actions: assign(({ context, event }) => advance(context, event.ms)),
        },
      },
    },
    interaction: {
      on: {
        TICK: [
          {
            guard: ({ context, event }) =>
              !context.paused &&
              !context.cameraBusy &&
              Number.isFinite(event.ms) &&
              event.ms >= context.remaining,
            actions: raise({ type: 'TIMEOUT' }),
          },
          {
            target: 'scene',
            actions: assign(({ context, event }) => advance(context, event.ms)),
          },
        ],
        GESTURE: {
          guard: ({ context, event }) =>
            canAnswer(context, event.gesture, event.player),
          target: 'reaction',
          actions: assign(({ context, event }) =>
            resolve(context, event.gesture),
          ),
        },
        BUTTON: {
          guard: ({ context, event }) =>
            canAnswer(context, event.gesture, event.player),
          target: 'reaction',
          actions: assign(({ context, event }) =>
            resolve(context, event.gesture),
          ),
        },
        TIMEOUT: {
          guard: ({ context }) => !context.paused && !context.cameraBusy,
          target: 'reaction',
          actions: assign(({ context }) => resolve(context, null)),
        },
      },
    },
    reaction: {
      entry: assign(({ context }) => {
        const destination = context.outcome?.nextSceneId;
        return {
          ...(destination ? jump(context, destination, true) : context),
          outcome: null,
        };
      }),
      always: 'scene',
    },
    nextScene: { entry: assign({ sceneChanged: false }), always: 'scene' },
    // Kept restartable; completion navigation unmounts the actor and its clock.
    ending: {},
  },
});
