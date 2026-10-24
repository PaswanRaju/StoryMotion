import type { Movement, StoryId } from '../../engine/types';
import type { Choice } from '../../components/player/ChoicePanel';

/**
 * Temporary sample content for the Phase 02 Player shell demo. This is NOT
 * the authored story script — Phase 03 introduces the real StoryBeat graph
 * (engine/types.ts) and Phase 06 authors the full per-story narration for
 * all three stories. Only the first challenge of each story (per CLAUDE.md
 * §7) is represented here, enough to demonstrate the UI end-to-end.
 */
export type DemoChallenge = {
  movement: Movement;
  target: number;
  instruction: string;
};

export type DemoChoice = {
  prompt: string;
  choices: Choice[];
  reactions: Record<string, string>;
};

export const demoChallengeByStory: Record<StoryId, DemoChallenge> = {
  hare: {
    movement: 'march',
    target: 12,
    instruction: 'March in place to start the race!',
  },
  beanstalk: {
    movement: 'squat',
    target: 5,
    instruction: 'Squat down low to plant the magic beans!',
  },
  pigs: {
    movement: 'squat',
    target: 6,
    instruction: 'Squat down to gather building supplies!',
  },
};

export const demoChoiceByStory: Record<StoryId, DemoChoice> = {
  hare: {
    prompt: 'Should we take the safe forest path, or ask a woodland friend for guidance?',
    choices: [
      { id: 'safe-path', label: 'Take the safe path' },
      { id: 'ask-friend', label: 'Ask a friend for guidance' },
    ],
    reactions: {
      'safe-path': "Good thinking — a careful path keeps everyone steady.",
      'ask-friend': 'What a friendly idea! Two heads are better than one.',
    },
  },
  beanstalk: {
    prompt: 'Which cloud route should we take up to the castle?',
    choices: [
      { id: 'sunny', label: 'The sunny cloud route' },
      { id: 'quiet', label: 'The quiet cloud route' },
    ],
    reactions: {
      sunny: 'The sun warms your wings as you climb higher and higher!',
      quiet: 'It is peaceful up here — you can hear every rustling leaf.',
    },
  },
  pigs: {
    prompt: 'What should the house be built with?',
    choices: [
      { id: 'straw', label: 'Straw' },
      { id: 'wood', label: 'Wood' },
      { id: 'brick', label: 'Brick' },
    ],
    reactions: {
      straw: 'Straw is quick to gather — light and speedy work!',
      wood: 'Wood is sturdy and smells like the forest.',
      brick: 'Brick takes patience, but it will stand strong against any wind.',
    },
  },
};
