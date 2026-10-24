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
      'Plant a magic bean, climb into the clouds, and make it home safe and sound.',
    coverBackground:
      'linear-gradient(160deg, var(--color-sky) 0%, var(--color-cream) 100%)',
    moral: 'A little courage and a kind heart can take you far.',
    characters: [
      {
        id: 'jack',
        name: 'Jack',
        persona: 'Curious and brave, always ready for an adventure.',
      },
      {
        id: 'adventurer',
        name: 'Adventurer',
        persona: 'Bold explorer with a kind heart.',
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
      "Gather supplies, build strong, and keep your house safe from a mischievous wolf's wind.",
    coverBackground:
      'linear-gradient(160deg, var(--color-honey) 0%, var(--color-cream) 100%)',
    moral: 'A little planning helps you build something that lasts.',
    characters: [
      {
        id: 'pig-one',
        name: 'Pig One',
        persona: 'Loves to build fast and have fun.',
      },
      {
        id: 'pig-two',
        name: 'Pig Two',
        persona: 'Likes things sturdy and dependable.',
      },
      {
        id: 'pig-three',
        name: 'Pig Three',
        persona: 'A careful planner who thinks ahead.',
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
