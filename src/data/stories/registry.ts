import type { StoryId } from '../../engine/types';

export type CharacterSummary = {
  id: string;
  name: string;
  persona: string;
};

export type StorySummary = {
  id: StoryId;
  title: string;
  theme: string;
  teaser: string;
  coverBackground: string; // CSS gradient placeholder until ART-01 lands
  moral: string;
  /** Who appears in the story (for the story card). */
  starring: string;
  /**
   * Characters the child can choose to cheer for. A story with one entry is a
   * single continuous story (no character picker).
   */
  characters: CharacterSummary[];
  badge: { title: string; description: string };
};

export const storyRegistry: StorySummary[] = [
  {
    id: 'hare',
    title: 'The Tortoise and the Hare',
    theme: 'Patience & Perseverance',
    teaser:
      'A friendly race teaches a boastful hare and a steady tortoise what really wins the day.',
    coverBackground:
      'linear-gradient(160deg, var(--color-sage) 0%, var(--color-cream) 100%)',
    moral: 'Slow and steady, with heart, wins the day.',
    starring: 'Tortoise & Hare',
    characters: [
      {
        id: 'tortoise',
        name: 'Tortoise',
        persona: 'Slow and steady, kind and wise.',
      },
      {
        id: 'hare',
        name: 'Hare',
        persona: 'Quick, confident, and loves to show off.',
      },
    ],
    badge: {
      title: 'Steady Champion',
      description: 'Finished the race with patience and heart.',
    },
  },
  {
    id: 'beanstalk',
    title: 'Jack and the Beanstalk',
    theme: 'Curiosity & Courage',
    teaser:
      'Trade a cow for magic beans, climb into the clouds, meet a Giant and his golden hen, and race home.',
    coverBackground:
      'linear-gradient(160deg, var(--color-sky) 0%, var(--color-cream) 100%)',
    moral: 'Be brave, think before you choose, and share what you have.',
    starring: 'Jack, his Mother, Milky-White, the Trader, the Giant & the Golden Hen',
    characters: [
      {
        id: 'jack',
        name: 'Jack',
        persona: 'Curious and brave, always ready for an adventure.',
      },
    ],
    badge: {
      title: 'Cloud Climber',
      description: 'Climbed all the way to the clouds and back.',
    },
  },
  {
    id: 'pigs',
    title: 'The Three Little Pigs',
    theme: 'Planning & Teamwork',
    teaser:
      'Three little pigs build houses of wheat, stone and brick — and outsmart a huffing, puffing wolf together.',
    coverBackground:
      'linear-gradient(160deg, var(--color-honey) 0%, var(--color-cream) 100%)',
    moral: 'Hard work and careful planning keep everyone safe.',
    starring: 'The Three Little Pigs & the Big Bad Wolf',
    characters: [
      {
        id: 'three-pigs',
        name: 'The Three Little Pigs',
        persona: 'Three siblings, three houses, one big adventure.',
      },
    ],
    badge: {
      title: 'Builder Badge',
      description: 'Built a home that stood strong.',
    },
  },
];

export function getStoryById(id: string): StorySummary | undefined {
  return storyRegistry.find((story) => story.id === id);
}
