import type { Story } from '../engine/schema';

export const hare = {
  id: 'hare',
  title: 'The Tortoise and the Hare',
  description:
    'A friendly race teaches a boastful hare and a steady tortoise what really wins the day.',
  coverAsset: 'hare-cover',
  ageRange: [4, 8],
  startSceneId: 'hare-intro',
  scenes: [
    {
      id: 'hare-intro',
      title: 'Meet Tortoise and Hare',
      durationMs: 9000,
      background: 'hare-intro',
      characters: [
        {
          id: 'tortoise',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'hare',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'forest-friends',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'Once upon a time, in a sunny forest, lived a speedy Hare and a slow, steady Tortoise.',
        },
      ],
      actions: [],
      soundEffects: [],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'hare-challenge',
      },
      events: ['intro', 'tortoise-introduced', 'hare-introduced'],
    },
    {
      id: 'hare-challenge',
      title: 'The Challenge',
      durationMs: 12000,
      background: 'hare-challenge',
      characters: [
        {
          id: 'tortoise',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'hare',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'forest-friends',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: '"Nobody can beat me!" Hare bragged. "Then let\'s have a race," said Tortoise kindly. Ready, set, go!',
        },
      ],
      actions: [],
      soundEffects: [],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'hare-wind',
      },
      events: ['race-challenge', 'race-begins'],
    },
    {
      id: 'hare-wind',
      title: 'Step by Step',
      durationMs: 10000,
      background: 'hare-wind',
      characters: [
        {
          id: 'tortoise',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'hare',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'Hare zoomed ahead. Tortoise kept going, step by step, until a wild gust of wind came whooshing down the trail!',
        },
      ],
      actions: [],
      soundEffects: [],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [
        {
          id: 'shield',
          atMs: 3000,
          prompt: {
            title: '{name} needs your help!',
            body: 'Spread your arms wide to make a magic shield!',
            narrate: false,
          },
          windowMs: 8000,
          gesture: 'spreadArms',
          buttonLabel: 'Use Magic',
          buttonText: '🫧 Use Magic',
          buttonHint: 'or spread your arms',
          onSuccess: {
            actions: [],
            nextSceneId: null,
            caption:
              'Magic shield! The leaves bounce right off the bubble around {name}.',
            spoken: 'Wow! A magic shield! The leaves bounce right off!',
          },
          onTimeout: {
            actions: [],
            nextSceneId: null,
            caption:
              '{name} found another way — tucked in safe while the leaves blew past!',
            spoken:
              '{name} tucked in safe, and the leaves whooshed right past.',
          },
          alternatives: [],
        },
      ],
      next: {
        type: 'scene',
        sceneId: 'hare-nap',
      },
      events: ['hare-ahead', 'tortoise-steady'],
    },
    {
      id: 'hare-nap',
      title: 'Hare Takes a Nap',
      durationMs: 10000,
      background: 'hare-nap',
      characters: [
        {
          id: 'tortoise',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'hare',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'Sure he would win, Hare took a nap! Tortoise passed him and reached a fork in the trail.',
        },
      ],
      actions: [],
      soundEffects: [],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [
        {
          id: 'path',
          atMs: 3500,
          prompt: {
            title: 'Which way should {name} go?',
            body: 'Lean left for the shady woods, or right for the sunny meadow!',
            narrate: false,
          },
          windowMs: 7000,
          gesture: 'leanLeft',
          buttonLabel: 'Choose Left',
          buttonText: '← 🌲 Choose Left',
          buttonHint: 'or lean left',
          onSuccess: {
            actions: [],
            nextSceneId: null,
            caption: 'Left path chosen! {name} takes the cool, shady woods.',
            spoken: 'The shady woods it is! Cool and green.',
          },
          onTimeout: {
            actions: [],
            nextSceneId: null,
            caption: '{name} picked the sunny meadow. Off we go!',
            spoken: '{name} picked the sunny meadow.',
          },
          alternatives: [
            {
              gesture: 'leanRight',
              buttonLabel: 'Choose Right',
              buttonText: 'Choose Right ☀️ →',
              buttonHint: 'or lean right',
              onSuccess: {
                actions: [],
                nextSceneId: null,
                caption:
                  'Right path chosen! {name} takes the warm, sunny meadow.',
                spoken: 'The sunny meadow it is! Warm and bright.',
              },
            },
          ],
        },
        {
          id: 'boost',
          atMs: 8000,
          prompt: {
            title: 'Give {name} one last boost!',
            body: 'Raise a hand up high!',
            narrate: false,
          },
          windowMs: 7000,
          gesture: 'raiseHand',
          buttonLabel: 'Give Boost',
          buttonText: '✨ Give Boost',
          buttonHint: 'or raise a hand',
          onSuccess: {
            actions: [],
            nextSceneId: null,
            caption: 'A sparkly boost! {name} zooms toward the finish.',
            spoken: 'Zoom! {name} feels full of energy!',
          },
          onTimeout: {
            actions: [],
            nextSceneId: null,
            caption: '{name} keeps going, steady and strong!',
            spoken: 'Steady and strong, {name} keeps going!',
          },
          alternatives: [],
        },
        {
          id: 'wakeAndCheer',
          atMs: 9500,
          prompt: {
            title: 'A little story magic!',
            body: 'Clap to wake Hare, or cheer for Tortoise!',
          },
          gesture: 'clap',
          windowMs: 8000,
          buttonLabel: 'Clap for our friends',
          buttonText: 'Clap for our friends',
          buttonHint: 'You can tap, too.',
          onSuccess: {
            actions: [],
            nextSceneId: null,
            caption: 'Hare opened his eyes, and Tortoise kept going!',
            spoken: 'Hare opened his eyes, and Tortoise kept going!',
          },
          onTimeout: {
            actions: [],
            nextSceneId: null,
            caption: 'Hare woke up all by himself.',
            spoken: 'Hare woke up all by himself.',
          },
          alternatives: [
            {
              gesture: 'runInPlace',
              buttonLabel: 'Cheer for Tortoise',
              buttonText: 'Cheer for Tortoise',
              buttonHint: 'or move your arms while seated',
              onSuccess: {
                actions: [],
                nextSceneId: null,
                caption: 'Your cheers helped Tortoise keep going!',
                spoken: 'Your cheers helped Tortoise keep going!',
              },
            },
          ],
        },
      ],
      next: {
        type: 'scene',
        sceneId: 'hare-finish',
      },
      events: ['hare-overconfident', 'hare-sleeps', 'tortoise-passes'],
    },
    {
      id: 'hare-finish',
      title: 'The Finish Line',
      durationMs: 7000,
      background: 'hare-finish',
      characters: [
        {
          id: 'tortoise',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'hare',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'forest-friends',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'Hare woke with a jump! But Tortoise was already crossing the finish line!',
        },
      ],
      actions: [],
      soundEffects: [],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'hare-ending',
      },
      events: ['hare-wakes', 'tortoise-wins'],
    },
    {
      id: 'hare-ending',
      title: 'Slow and Steady',
      durationMs: 7000,
      background: 'hare-ending',
      characters: [
        {
          id: 'tortoise',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'hare',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'forest-friends',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'Hare cheered for his friend. "Well done, Tortoise!" Slow and steady wins the race.',
        },
      ],
      actions: [],
      soundEffects: [],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'ending',
      },
      events: ['hare-reacts', 'conclusion', 'moral'],
    },
  ],
} satisfies Story;
