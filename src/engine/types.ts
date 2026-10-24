/**
 * Core shared type vocabulary, introduced early (Phase 02) because routing
 * and the story data registry both need it. The full Section 8 data
 * contract (StoryBeat, Story, MovementEvent, Zod schema) lands in Phase 03 —
 * this file will grow into that, not be replaced by it.
 */
export type StoryId = 'hare' | 'beanstalk' | 'pigs';
export type Mode = 'solo' | 'family';
export type Movement = 'march' | 'jump' | 'squat' | 'reach' | 'balance';

export const STORY_IDS: StoryId[] = ['hare', 'beanstalk', 'pigs'];

export function isStoryId(value: string): value is StoryId {
  return STORY_IDS.includes(value as StoryId);
}
