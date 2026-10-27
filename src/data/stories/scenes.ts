import type { BodyGesture } from '../../vision/bodyGestures';
import type { StoryId } from '../../engine/types';
import { stories } from '../../stories';
import { toBodyGesture } from '../../engine/gestures';

export type MomentId =
  | 'shield'
  | 'path'
  | 'boost'
  | 'grow'
  | 'dodge'
  | 'glide'
  | 'protect'
  | 'lastBrick'
  | 'brace'
  | 'wakeAndCheer'
  | 'climbTogether'
  | 'gentlePuff';

export type SceneMoment = {
  id: MomentId;
  /** When the invitation opens, relative to the start of its scene. */
  atMs: number;
  windowMs: number;
  accepts: readonly BodyGesture[];
};

export type CastId =
  | 'tortoise'
  | 'hare'
  | 'forest-friends'
  | 'jack'
  | 'mother'
  | 'cow'
  | 'trader'
  | 'giant'
  | 'hen'
  | 'pig-one'
  | 'pig-two'
  | 'pig-three'
  | 'mama-pig'
  | 'wolf';

export type StoryScene = {
  id: string;
  /** Chapter label in the player toolbar. */
  title: string;
  durationMs: number;
  /** Authored narration (also the always-visible caption). */
  narration: string;
  cast: readonly CastId[];
  events: readonly string[];
  moments?: readonly SceneMoment[];
};

export const HARE_INTRO_HOLD_MS = 13000;
const HARE_HOLD_AT_MS = 2500;
/** Story time → forest-renderer time. */
export function forestTime(storyMs: number) {
  return storyMs < HARE_HOLD_AT_MS + HARE_INTRO_HOLD_MS
    ? Math.min(storyMs, HARE_HOLD_AT_MS)
    : storyMs - HARE_INTRO_HOLD_MS;
}

export const BEANSTALK_LEGACY_SCENES = [
  'jack-grow',
  'jack-climb',
  'jack-clouds',
] as const;
export function beanstalkLegacyTime(sceneId: string, localMs: number) {
  if (sceneId === 'jack-grow') return 11950 + Math.max(0, localMs - 8450);
  if (sceneId === 'jack-climb') return 18000 + localMs;
  // Hold on the cloud-kingdom reveal (before the legacy castle cut at 33 s).
  return Math.min(32400, 26500 + localMs);
}

// Compatibility view for cinematic renderers; authored data lives in stories/.
const projectScenes = (storyId: StoryId): readonly StoryScene[] =>
  stories[storyId].scenes.map((scene) => ({
    id: scene.id,
    title: scene.title,
    durationMs: scene.durationMs,
    narration: scene.narration.map((line) => line.text).join(' '),
    cast: scene.characters.map((character) => character.id as CastId),
    events: scene.events,
    moments: scene.interactions.map((node) => ({
      id: node.id as MomentId,
      atMs: node.atMs,
      windowMs: node.windowMs,
      accepts: [
        node.gesture,
        ...node.alternatives.map((alt) => alt.gesture),
      ].map(toBodyGesture),
    })),
  }));
export const STORY_SCENES: Record<StoryId, readonly StoryScene[]> = {
  hare: projectScenes('hare'),
  beanstalk: projectScenes('beanstalk'),
  pigs: projectScenes('pigs'),
};

/** Story time (ms) at which each scene begins. */
export function sceneStarts(storyId: StoryId): number[] {
  let at = 0;
  return STORY_SCENES[storyId].map((scene) => {
    const start = at;
    at += scene.durationMs;
    return start;
  });
}
const STARTS: Record<StoryId, number[]> = {
  hare: sceneStarts('hare'),
  beanstalk: sceneStarts('beanstalk'),
  pigs: sceneStarts('pigs'),
};
export const storyDuration = (storyId: StoryId) =>
  STORY_SCENES[storyId].reduce((total, scene) => total + scene.durationMs, 0);

export function sceneIndexAt(storyId: StoryId, elapsed: number) {
  const starts = STARTS[storyId];
  let index = 0;
  while (index + 1 < starts.length && elapsed >= starts[index + 1]) index++;
  return index;
}

/** The active scene and the time inside it. */
export function sceneAt(storyId: StoryId, elapsed: number) {
  const index = sceneIndexAt(storyId, elapsed);
  const start = STARTS[storyId][index];
  return {
    index,
    scene: STORY_SCENES[storyId][index],
    start,
    local: Math.max(0, elapsed - start),
  };
}

/** Every optional moment, with its absolute story-time start. */
export function storyMoments(storyId: StoryId) {
  const starts = STARTS[storyId];
  return STORY_SCENES[storyId].flatMap((scene, index) =>
    (scene.moments ?? []).map((moment) => ({
      id: moment.id,
      startMs: starts[index] + moment.atMs,
      windowMs: moment.windowMs,
      accepts: moment.accepts,
      sceneId: scene.id,
    })),
  );
}

/** Plot points in the order a child must see them (used by completeness tests). */
export const REQUIRED_EVENTS: Record<StoryId, readonly string[]> = {
  hare: [
    'intro',
    'tortoise-introduced',
    'hare-introduced',
    'race-challenge',
    'race-begins',
    'hare-overconfident',
    'hare-sleeps',
    'tortoise-passes',
    'hare-wakes',
    'tortoise-wins',
    'hare-reacts',
    'conclusion',
    'moral',
  ],
  beanstalk: [
    'intro',
    'jack-introduced',
    'mother-introduced',
    'family-needs-food',
    'mother-gives-cow',
    'trader-offers-beans',
    'cow-traded',
    'jack-receives-beans',
    'mother-upset',
    'beans-in-ground',
    'beanstalk-grows',
    'jack-climbs',
    'castle-introduced',
    'giant-introduced',
    'hen-introduced',
    'jack-takes-hen',
    'giant-notices-missing-hen',
    'chase-begins',
    'jack-escapes',
    'beanstalk-cut',
    'pursuit-ends',
    'resolution',
    'conclusion',
    'moral',
  ],
  pigs: [
    'intro',
    'three-pigs-introduced',
    'wheat-house-built',
    'wolf-introduced',
    'wolf-blows-wheat-house',
    'wheat-house-collapses',
    'stone-house-built',
    'stone-house-threatened',
    'pigs-flee-to-brick',
    'brick-house-built',
    'pigs-reunite',
    'wolf-attacks-brick-house',
    'brick-house-stands',
    'wolf-retreats',
    'pigs-celebrate',
    'conclusion',
    'moral',
  ],
};
