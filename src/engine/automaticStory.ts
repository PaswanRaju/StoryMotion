import type { BodyGesture, BodyGestureEvent } from '../vision/bodyGestures';
import type { MagicAction } from '../vision/magicGesture';
import type { StoryId } from './types';

import { storyDuration, storyMoments } from '../data/stories/scenes';
import type { MomentId } from '../data/stories/scenes';

export type { MomentId };
export type Moment = {
  id: MomentId;
  startMs: number;
  windowMs: number;
  accepts: readonly BodyGesture[];
};
/**
 * Optional invitations. Each opens at startMs (or as soon as camera setup finishes)
 * and lasts windowMs. While one is open, story time holds — the character waits at
 * the obstacle — so the child's response window never runs out behind their back.
 * A moment that camera setup outlasts by more than its window resolves on its own.
 * Moments and durations come from the scene list in data/stories/scenes.ts.
 */
export type StoryScript = { durationMs: number; moments: readonly Moment[] };
/** Each story's length (story time) and its optional invitations. */
export const SCRIPTS: Record<StoryId, StoryScript> = {
  hare: { durationMs: storyDuration('hare'), moments: storyMoments('hare') },
  beanstalk: {
    durationMs: storyDuration('beanstalk'),
    moments: storyMoments('beanstalk'),
  },
  pigs: { durationMs: storyDuration('pigs'), moments: storyMoments('pigs') },
};
/** The Tortoise and the Hare: shield, path choice, final boost. */
export const MOMENTS = SCRIPTS.hare.moments;
export const STORY_DURATION_MS = SCRIPTS.hare.durationMs;
export const momentIndex = (id: MomentId, storyId: StoryId = 'hare') =>
  SCRIPTS[storyId].moments.findIndex((moment) => moment.id === id);
export const MAGIC_START_MS = MOMENTS[0].startMs;
export const MAGIC_WINDOW_MS = MOMENTS[0].windowMs;

export type AutomaticStoryState = {
  storyId: StoryId;
  elapsed: number;
  paused: boolean;
  cameraBusy: boolean;
  /** Index of the current or next moment; MOMENTS.length once all are over. */
  moment: number;
  interaction: 'waiting' | 'open' | 'done';
  remaining: number;
  /** One response (or null if skipped/ignored) per moment. */
  responses: (BodyGesture | null)[];
  /** True where a moment resolved itself because nobody answered. */
  auto: boolean[];
  /** True once any moment was answered with magic (HAND_RAISE). */
  magic: boolean;
  /** Most recent response. */
  gesture: BodyGesture | null;
  finished: boolean;
};
export const initialAutomaticStory = (
  storyId: StoryId = 'hare',
): AutomaticStoryState => ({
  storyId,
  elapsed: 0,
  paused: false,
  cameraBusy: false,
  moment: 0,
  interaction: 'waiting',
  remaining: SCRIPTS[storyId].moments[0].windowMs,
  responses: SCRIPTS[storyId].moments.map(() => null),
  auto: SCRIPTS[storyId].moments.map(() => false),
  magic: false,
  gesture: null,
  finished: false,
});
export type StoryAction =
  | MagicAction
  | BodyGestureEvent
  | { type: 'TICK'; ms: number }
  | { type: 'PAUSE'; paused: boolean }
  | { type: 'CAMERA_BUSY'; busy: boolean }
  | { type: 'RESTART' };

function closeMoment(
  state: AutomaticStoryState,
  automatic = false,
): AutomaticStoryState {
  const moments = SCRIPTS[state.storyId].moments;
  const auto = [...state.auto];
  if (automatic) auto[state.moment] = true;
  const moment = state.moment + 1;
  return {
    ...state,
    auto,
    moment,
    interaction: moment < moments.length ? 'waiting' : 'done',
    remaining: moments[moment]?.windowMs ?? 0,
  };
}

/** Story time never depends on camera/model/landmarks. Only the optional windows do. */
export function automaticStoryReducer(
  state: AutomaticStoryState,
  action: StoryAction,
): AutomaticStoryState {
  const { moments, durationMs } = SCRIPTS[state.storyId];
  switch (action.type) {
    case 'RESTART':
      return {
        ...initialAutomaticStory(state.storyId),
        cameraBusy: state.cameraBusy,
      };
    case 'PAUSE':
      return { ...state, paused: action.paused };
    case 'CAMERA_BUSY': {
      const reset = action.busy && state.interaction === 'open';
      return {
        ...state,
        cameraBusy: action.busy,
        // Starting the camera during an invitation gives a fresh window after setup.
        interaction: reset ? 'waiting' : state.interaction,
        remaining: reset ? moments[state.moment].windowMs : state.remaining,
      };
    }
    case 'BLOW':
    case 'CLIMB':
    case 'CLAP':
    case 'RUN_IN_PLACE':
    case 'HAND_RAISE':
    case 'LEAN_LEFT':
    case 'LEAN_RIGHT':
    case 'ARMS_WIDE':
    case 'CROUCH':
    case 'MAGIC_ACTIVATE': {
      const gesture: BodyGesture =
        action.type === 'MAGIC_ACTIVATE' ? 'HAND_RAISE' : action.type;
      if (
        state.finished ||
        state.paused ||
        state.cameraBusy ||
        state.interaction !== 'open' ||
        !moments[state.moment].accepts.includes(gesture)
      )
        return state;
      const responses = [...state.responses];
      responses[state.moment] = gesture;
      // One gesture answers the moment: the window closes and the story moves on.
      return closeMoment({
        ...state,
        responses,
        magic: state.magic || gesture === 'HAND_RAISE',
        gesture,
      });
    }
    case 'TICK': {
      if (
        state.paused ||
        state.finished ||
        !Number.isFinite(action.ms) ||
        action.ms <= 0
      )
        return state;
      if (state.interaction === 'open') {
        // Story time holds; only the optional window counts down.
        const remaining = Math.max(0, state.remaining - action.ms);
        return remaining
          ? { ...state, remaining }
          : closeMoment({ ...state, remaining }, true);
      }
      let next: AutomaticStoryState = {
        ...state,
        elapsed: state.elapsed + action.ms,
      };
      if (next.interaction === 'waiting') {
        const moment = moments[next.moment];
        if (next.elapsed >= moment.startMs + moment.windowMs)
          next = closeMoment(next, true); // missed while the camera was being set up
        else if (!next.cameraBusy && next.elapsed >= moment.startMs)
          next = {
            ...next,
            // Stop exactly at the obstacle, unless camera setup already carried us past it.
            elapsed:
              state.elapsed < moment.startMs ? moment.startMs : next.elapsed,
            interaction: 'open',
            remaining: moment.windowMs,
          };
      }
      next.finished = next.elapsed >= durationMs && next.interaction !== 'open';
      return next;
    }
  }
}
