import type { StoryId } from '../../engine/types';

/** Short authored demo arcs; no dependency on exercise counts or absent media files. */
export const animatedBeats: Record<StoryId, readonly string[]> = {
  hare: [
    'On a sunny morning, Hare laughed and challenged Tortoise to a race. Ready, set, go!',
    'Hare zoomed ahead. Tortoise kept going, step by step, until a wild gust of wind came whooshing down the trail!',
    'Hare was so sure he would win that he lay down for a nap. Tortoise passed him and came to a fork in the trail.',
    'Hare woke with a jump! But Tortoise was already crossing the finish line!',
    'Hare cheered for his friend. They learned that slow and steady wins the race.',
  ],
  beanstalk: [
    'In a little cottage at the edge of the hills lived a curious boy named Jack.',
    'One morning, Jack found three tiny beans that sparkled like stars.',
    'Jack planted the beans in the garden. The ground began to rumble and glow!',
    'A giant beanstalk shot up into the sky! Jack took a deep breath and started to climb.',
    'Up, up, up, past the birds and into the clouds, Jack found a whole new world.',
    'A giant castle! Everything inside was enormous. A sleepy giant snored by the fire, and a golden harp sang softly.',
    'The giant began to stir! Time to head home, quick and quiet.',
    'Jack landed safely at home with a song in his heart. A little courage can take you far!',
  ],
  pigs: [
    'Three little pigs wanted a cozy home. Together they gathered everything they needed.',
    'They made a plan and carefully laid the bricks. Helping each other made the work feel light.',
    'Soon the walls were tall and the roof was ready. Their little house was taking shape!',
    'A mischievous wolf blew a gust of wind. The strong brick house stayed safe and sound.',
    'The pigs celebrated together. A little planning and teamwork help you build something that lasts.',
  ],
};
/** Story time (ms) at which each narration line begins. */
export const beatStarts: Record<StoryId, readonly number[]> = {
  hare: [0, 8000, 18000, 28000, 35000],
  beanstalk: [0, 7000, 12000, 18000, 28000, 33000, 40000, 46000],
  pigs: [0, 8000, 18000, 28000, 35000],
};
export function storyBeatIndex(elapsed: number, storyId: StoryId = 'hare') {
  const starts = beatStarts[storyId];
  let index = 0;
  while (index + 1 < starts.length && elapsed >= starts[index + 1]) index++;
  return index;
}
