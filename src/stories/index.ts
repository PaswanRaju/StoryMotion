import { hare } from './hare';
import { beanstalk } from './beanstalk';
import { pigs } from './pigs';
import type { Story } from '../engine/schema';
import type { StoryId } from '../engine/types';

export const stories: Record<StoryId, Story> = { hare, beanstalk, pigs };
