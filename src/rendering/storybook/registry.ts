import type { StoryId } from '../../engine/types';
import { BEANSTALK_SCENES } from './beanstalkScenes';
import type { SceneDef } from './beanstalkScenes';
import { PIGS_SCENES } from './pigsScenes';

/** Renderer for every storybook scene id (legacy beanstalk climb scenes excluded). */
export const STORYBOOK_SCENES: Record<string, SceneDef> = {
  ...BEANSTALK_SCENES,
  ...PIGS_SCENES,
};

/** When (scene-local ms) the closing card appears in each story's last scene. */
export const ENDCARD_AT: Partial<Record<StoryId, number>> = {
  beanstalk: 12500,
  pigs: 9000,
};
