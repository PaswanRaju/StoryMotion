import type { BodyGesture, BodyGestureEvent } from '../vision/bodyGestures';
import type { MagicAction } from '../vision/magicGesture';
import type { StoryId } from './types';

/** Story time (not wall time): it holds while an invitation is open. */
export const STORY_DURATION_MS = 42000;
/**
 * Optional invitations. Each opens at startMs (or as soon as camera setup finishes)
 * and lasts windowMs. While one is open, story time holds — the character waits at
 * the obstacle — so the child's response window never runs out behind their back.
 * A moment that camera setup outlasts by more than its window resolves on its own.
 */
type MomentSpec = {
  id: string;
  startMs: number;
  windowMs: number;
  accepts: readonly BodyGesture[];
};
/** The Tortoise and the Hare: shield, path choice, final boost. */
export const MOMENTS = [
  { id: 'shield', startMs: 11000, windowMs: 8000, accepts: ['ARMS_WIDE'] },
  {
    id: 'path',
    startMs: 21500,
    windowMs: 7000,
    accepts: ['LEAN_LEFT', 'LEAN_RIGHT'],
  },
  { id: 'boost', startMs: 26000, windowMs: 7000, accepts: ['HAND_RAISE'] },
] as const satisfies readonly MomentSpec[];
/** Jack and the Beanstalk: grow the beanstalk, dodge on the climb, glide home. */
export const BEANSTALK_MOMENTS = [
  { id: 'grow', startMs: 12000, windowMs: 8000, accepts: ['HAND_RAISE'] },
  {
    id: 'dodge',
    startMs: 24000,
    windowMs: 7000,
    accepts: ['LEAN_LEFT', 'LEAN_RIGHT'],
  },
  { id: 'glide', startMs: 40000, windowMs: 8000, accepts: ['ARMS_WIDE'] },
] as const satisfies readonly MomentSpec[];
export type MomentId =
  | (typeof MOMENTS)[number]['id']
  | (typeof BEANSTALK_MOMENTS)[number]['id'];
export type Moment = {
  id: MomentId;
  startMs: number;
  windowMs: number;
  accepts: readonly BodyGesture[];
};
export type StoryScript = { durationMs: number; moments: readonly Moment[] };
/** Each story's length (story time) and its optional invitations. */
export const SCRIPTS: Record<StoryId, StoryScript> = {
  hare: { durationMs: STORY_DURATION_MS, moments: MOMENTS },
  beanstalk: { durationMs: 56000, moments: BEANSTALK_MOMENTS },
  pigs: { durationMs: STORY_DURATION_MS, moments: MOMENTS },
};
export const momentIndex = (id: MomentId, storyId: StoryId = 'hare') =>
  SCRIPTS[storyId].moments.findIndex((moment) => moment.id === id);
export const MAGIC_START_MS = MOMENTS[0].startMs as number;
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
      next.finished =
        next.elapsed >= durationMs && next.interaction !== 'open';
      return next;
    }
  }
}
