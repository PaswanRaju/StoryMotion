import type { Story } from '../engine/schema';

export const beanstalk = {
  id: 'beanstalk',
  title: 'Jack and the Beanstalk',
  description:
    'Trade a cow for magic beans, climb into the clouds, meet a Giant and his golden hen, and race home.',
  coverAsset: 'beanstalk-cover',
  ageRange: [4, 8],
  startSceneId: 'jack-home',
  scenes: [
    {
      id: 'jack-home',
      title: 'Jack and His Mother',
      durationMs: 13500,
      background: 'jack-home',
      characters: [
        {
          id: 'jack',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'mother',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'cow',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'Once upon a time, a boy named Jack lived with his mother and their cow, Milky-White. They were very poor, and their cupboard was almost empty.',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 2400,
          assetId: 'moo',
        },
        {
          atMs: 7600,
          assetId: 'sad',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'jack-errand',
      },
      events: [
        'intro',
        'jack-introduced',
        'mother-introduced',
        'cow-introduced',
        'family-needs-food',
      ],
    },
    {
      id: 'jack-errand',
      title: 'Off to Market',
      durationMs: 14500,
      background: 'jack-errand',
      characters: [
        {
          id: 'jack',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'mother',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'cow',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: '"Jack," said his mother, "please take Milky-White to the market and trade her for vegetables, so we have food to eat." Jack took the rope and set off.',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 10200,
          assetId: 'moo',
        },
        {
          atMs: 11000,
          assetId: 'step',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'jack-trade',
      },
      events: ['mother-gives-cow', 'jack-leaves-for-market'],
    },
    {
      id: 'jack-trade',
      title: 'The Mysterious Trader',
      durationMs: 17500,
      background: 'jack-trade',
      characters: [
        {
          id: 'jack',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'cow',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'trader',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'On the road, Jack met a mysterious old trader. "I will give you five magic beans for your cow," he whispered. The beans sparkled. Jack said yes, handed over Milky-White, and took the beans.',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 2800,
          assetId: 'step',
        },
        {
          atMs: 5600,
          assetId: 'sparkle',
        },
        {
          atMs: 11200,
          assetId: 'moo',
        },
        {
          atMs: 12100,
          assetId: 'magic',
        },
        {
          atMs: 14600,
          assetId: 'step',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'jack-return',
      },
      events: [
        'trader-introduced',
        'trader-offers-beans',
        'cow-traded',
        'jack-receives-beans',
      ],
    },
    {
      id: 'jack-return',
      title: 'Beans Instead of Food',
      durationMs: 16000,
      background: 'jack-return',
      characters: [
        {
          id: 'jack',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'mother',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'When Jack got home, his mother was upset. "Beans? We needed food!" She tossed the beans out into the garden, and Jack went to bed sad and hungry.',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 1500,
          assetId: 'door',
        },
        {
          atMs: 5200,
          assetId: 'sad',
        },
        {
          atMs: 10000,
          assetId: 'whoosh',
        },
        {
          atMs: 11200,
          assetId: 'sparkle',
        },
        {
          atMs: 15200,
          assetId: 'door',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'jack-grow',
      },
      events: ['mother-upset', 'beans-in-ground', 'night-falls'],
    },
    {
      id: 'jack-grow',
      title: 'The Magic Beanstalk',
      durationMs: 14500,
      background: 'jack-grow',
      characters: [
        {
          id: 'jack',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'The next morning, Jack found a tiny green sprout where the beans had landed. It was glowing with magic!',
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
          id: 'grow',
          atMs: 8500,
          prompt: {
            title: 'Help the magic beanstalk grow!',
            body: 'Raise your hand to wake up the magic sprout!',
            narrate: false,
          },
          windowMs: 8000,
          gesture: 'raiseHand',
          buttonLabel: 'Grow the Beanstalk',
          buttonText: '🌱 Grow the Beanstalk',
          buttonHint: 'or raise a hand',
          onSuccess: {
            actions: [],
            nextSceneId: null,
            caption: 'Your magic made the beanstalk grow! Look at it go!',
            spoken: 'Whoosh! Your magic made the beanstalk grow!',
          },
          onTimeout: {
            actions: [],
            nextSceneId: null,
            caption: 'The magic beans woke up all by themselves!',
            spoken: 'The beans woke up all by themselves!',
          },
          alternatives: [],
        },
      ],
      next: {
        type: 'scene',
        sceneId: 'jack-climb',
      },
      events: ['sprout-appears', 'beanstalk-grows'],
    },
    {
      id: 'jack-climb',
      title: 'Jack Climbs',
      durationMs: 8500,
      background: 'jack-climb',
      characters: [
        {
          id: 'jack',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'Jack grabbed the leafy vines and began to climb, higher and higher!',
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
          id: 'dodge',
          atMs: 6000,
          prompt: {
            title: 'Help Jack choose a safe side!',
            body: 'A tumbling cloud is coming down. Lean left or right!',
            narrate: false,
          },
          windowMs: 7000,
          gesture: 'leanLeft',
          buttonLabel: 'Move Left',
          buttonText: '← Move Left',
          buttonHint: 'or lean left',
          onSuccess: {
            actions: [],
            nextSceneId: null,
            caption: 'Great move! Jack swings left and the cloud tumbles past.',
            spoken: 'Great move! The cloud tumbled right past!',
          },
          onTimeout: {
            actions: [],
            nextSceneId: null,
            caption: 'Jack found a safe side all by himself!',
            spoken: 'Jack found a safe side.',
          },
          alternatives: [
            {
              gesture: 'leanRight',
              buttonLabel: 'Move Right',
              buttonText: 'Move Right →',
              buttonHint: 'or lean right',
              onSuccess: {
                actions: [],
                nextSceneId: null,
                caption:
                  'Great move! Jack swings right and the cloud tumbles past.',
                spoken: 'Great move! The cloud tumbled right past!',
              },
            },
          ],
        },
      ],
      next: {
        type: 'scene',
        sceneId: 'jack-clouds',
      },
      events: ['jack-climbs'],
    },
    {
      id: 'jack-clouds',
      title: 'Above the Clouds',
      durationMs: 11500,
      background: 'jack-clouds',
      characters: [
        {
          id: 'jack',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'Up through the clouds he went, until his house looked tiny far below. At the very top, Jack found a whole new land!',
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
          id: 'climbTogether',
          atMs: 10000,
          prompt: {
            title: 'A little story magic!',
            body: 'Reach one arm up, then the other, to climb with Jack!',
          },
          gesture: 'climb',
          windowMs: 8000,
          buttonLabel: 'Help Jack climb',
          buttonText: 'Help Jack climb',
          buttonHint: 'You can tap, too.',
          onSuccess: {
            actions: [],
            nextSceneId: null,
            caption: 'Jack took one brave step at a time.',
            spoken: 'Jack took one brave step at a time.',
          },
          onTimeout: {
            actions: [],
            nextSceneId: null,
            caption: 'Jack reached the clouds, steady and safe.',
            spoken: 'Jack reached the clouds, steady and safe.',
          },
          alternatives: [],
        },
      ],
      next: {
        type: 'scene',
        sceneId: 'jack-castle',
      },
      events: ['jack-reaches-clouds'],
    },
    {
      id: 'jack-castle',
      title: "The Giant's Castle",
      durationMs: 14500,
      background: 'jack-castle',
      characters: [
        {
          id: 'jack',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'giant',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'There stood an enormous castle. Everything inside was gigantic! Thump, thump, thump! A Giant stomped into the hall, and Jack hid behind a huge cup.',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 6400,
          assetId: 'thump',
        },
        {
          atMs: 7700,
          assetId: 'thump',
        },
        {
          atMs: 9000,
          assetId: 'thump',
        },
        {
          atMs: 10300,
          assetId: 'thump',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'jack-hen',
      },
      events: ['castle-introduced', 'giant-introduced'],
    },
    {
      id: 'jack-hen',
      title: 'The Golden Hen',
      durationMs: 15500,
      background: 'jack-hen',
      characters: [
        {
          id: 'jack',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'giant',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'hen',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'The Giant set his hen on a stool. "Lay!" he boomed, and she laid an egg of shining gold! Just one golden egg could buy food for a whole year.',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 1600,
          assetId: 'flap',
        },
        {
          atMs: 3500,
          assetId: 'boom',
        },
        {
          atMs: 6000,
          assetId: 'ding',
        },
        {
          atMs: 9800,
          assetId: 'cluck',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'jack-take',
      },
      events: ['hen-introduced', 'golden-egg', 'hen-belongs-to-giant'],
    },
    {
      id: 'jack-take',
      title: 'Jack Takes the Hen',
      durationMs: 13000,
      background: 'jack-take',
      characters: [
        {
          id: 'jack',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'giant',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'hen',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'Soon the Giant was snoring. Jack thought of his hungry mother. Quietly, he scooped up the golden hen and tiptoed toward the door.',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 600,
          assetId: 'yawn',
        },
        {
          atMs: 3200,
          assetId: 'snore',
        },
        {
          atMs: 7200,
          assetId: 'snore',
        },
        {
          atMs: 7600,
          assetId: 'flap',
        },
        {
          atMs: 11200,
          assetId: 'snore',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'jack-chase',
      },
      events: ['jack-motivation', 'jack-takes-hen'],
    },
    {
      id: 'jack-chase',
      title: 'The Giant Wakes Up',
      durationMs: 13000,
      background: 'jack-chase',
      characters: [
        {
          id: 'jack',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'giant',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'hen',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: '"Cluck, cluck!" squawked the hen. The Giant woke up and saw that his hen was gone. "Hey! Come back!" he roared, and Jack ran for the beanstalk!',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 1500,
          assetId: 'cluck',
        },
        {
          atMs: 2200,
          assetId: 'gasp',
        },
        {
          atMs: 4000,
          assetId: 'boom',
        },
        {
          atMs: 7400,
          assetId: 'roar',
        },
        {
          atMs: 9400,
          assetId: 'thump',
        },
        {
          atMs: 10800,
          assetId: 'thump',
        },
        {
          atMs: 12200,
          assetId: 'thump',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'jack-escape',
      },
      events: ['giant-wakes', 'giant-notices-missing-hen', 'chase-begins'],
    },
    {
      id: 'jack-escape',
      title: 'Down the Beanstalk',
      durationMs: 14000,
      background: 'jack-escape',
      characters: [
        {
          id: 'jack',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'giant',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'hen',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'Jack hurried down the beanstalk, holding the hen tight. The Giant climbed after him, and the whole beanstalk swayed and shook!',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 400,
          assetId: 'whoosh',
        },
        {
          atMs: 3000,
          assetId: 'creak',
        },
        {
          atMs: 4600,
          assetId: 'thump',
        },
        {
          atMs: 7000,
          assetId: 'thump',
        },
        {
          atMs: 9200,
          assetId: 'slide',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [
        {
          id: 'protect',
          atMs: 9000,
          prompt: {
            title: 'Help protect Jack!',
            body: 'Spread your arms wide to wrap him in magic leaves!',
            narrate: false,
          },
          windowMs: 8000,
          gesture: 'spreadArms',
          buttonLabel: 'Protect Jack',
          buttonText: '🍃 Protect Jack',
          buttonHint: 'or spread your arms',
          onSuccess: {
            actions: [],
            nextSceneId: null,
            caption:
              'Magic leaves wrap around Jack and the hen, and they slide down safely!',
            spoken: 'Magic leaves! Jack slides down safely!',
          },
          onTimeout: {
            actions: [],
            nextSceneId: null,
            caption: 'Jack slid down fast, holding the hen tight!',
            spoken: 'Jack slid down fast!',
          },
          alternatives: [],
        },
      ],
      next: {
        type: 'scene',
        sceneId: 'jack-chop',
      },
      events: ['jack-escapes', 'giant-pursues'],
    },
    {
      id: 'jack-chop',
      title: 'Down Comes the Beanstalk',
      durationMs: 17000,
      background: 'jack-chop',
      characters: [
        {
          id: 'jack',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'mother',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'giant',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'hen',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: '"Mother, the axe!" Jack called. Chop, chop, chop! The Giant hurried back up to his castle in the clouds, and the beanstalk came tumbling down.',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 1900,
          assetId: 'thump',
        },
        {
          atMs: 2600,
          assetId: 'door',
        },
        {
          atMs: 5600,
          assetId: 'chop',
        },
        {
          atMs: 6500,
          assetId: 'chop',
        },
        {
          atMs: 7400,
          assetId: 'chop',
        },
        {
          atMs: 8300,
          assetId: 'chop',
        },
        {
          atMs: 9200,
          assetId: 'chop',
        },
        {
          atMs: 10200,
          assetId: 'creak',
        },
        {
          atMs: 11600,
          assetId: 'whoosh',
        },
        {
          atMs: 13300,
          assetId: 'crash',
        },
        {
          atMs: 14200,
          assetId: 'cheer',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'jack-ending',
      },
      events: ['jack-home-safe', 'beanstalk-cut', 'pursuit-ends'],
    },
    {
      id: 'jack-ending',
      title: 'Happily Ever After',
      durationMs: 19000,
      background: 'jack-ending',
      characters: [
        {
          id: 'jack',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'mother',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'hen',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'From then on, the hen laid a golden egg each day, and Jack and his mother were never hungry again. They shared with their neighbors, and Jack promised to think carefully before every big choice.',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 2600,
          assetId: 'ding',
        },
        {
          atMs: 12500,
          assetId: 'celebrate',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'ending',
      },
      events: ['resolution', 'conclusion', 'moral'],
    },
  ],
} satisfies Story;
