import type { StoryId } from '../../engine/types';
import { STORY_SCENES, sceneIndexAt, sceneStarts } from './scenes';

/**
 * Narration lines in scene order. Derived from scenes.ts (the single plot source)
 * so captions, speech and scene renderers can never disagree about the active event.
 */
export const animatedBeats: Record<StoryId, readonly string[]> = {
  hare: STORY_SCENES.hare.map((scene) => scene.narration),
  beanstalk: STORY_SCENES.beanstalk.map((scene) => scene.narration),
  pigs: STORY_SCENES.pigs.map((scene) => scene.narration),
};
/** Story time (ms) at which each narration line (scene) begins. */
export const beatStarts: Record<StoryId, readonly number[]> = {
  hare: sceneStarts('hare'),
  beanstalk: sceneStarts('beanstalk'),
  pigs: sceneStarts('pigs'),
};
export function storyBeatIndex(elapsed: number, storyId: StoryId = 'hare') {
  return sceneIndexAt(storyId, elapsed);
}
