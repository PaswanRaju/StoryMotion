import type { Story } from '../engine/schema';

export const pigs = {
  id: 'pigs',
  title: 'The Three Little Pigs',
  description:
    'Three little pigs build houses of wheat, stone and brick — and outsmart a huffing, puffing wolf together.',
  coverAsset: 'pigs-cover',
  ageRange: [4, 8],
  startSceneId: 'pigs-intro',
  scenes: [
    {
      id: 'pigs-intro',
      title: 'Three Little Pigs',
      durationMs: 16500,
      background: 'pigs-intro',
      characters: [
        {
          id: 'pig-one',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-two',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-three',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'mama-pig',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'Once upon a time, three little pigs hugged their mother goodbye. They were off to build homes of their own. "Build them strong," said Mama Pig, "and watch out for the wolf!"',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 5000,
          assetId: 'pop',
        },
        {
          atMs: 6000,
          assetId: 'pop',
        },
        {
          atMs: 7000,
          assetId: 'pop',
        },
        {
          atMs: 12600,
          assetId: 'patter',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'pigs-wheat',
      },
      events: [
        'intro',
        'three-pigs-introduced',
        'pigs-leave-home',
        'wolf-warning',
      ],
    },
    {
      id: 'pigs-wheat',
      title: 'A House of Wheat',
      durationMs: 15500,
      background: 'pigs-wheat',
      characters: [
        {
          id: 'pig-one',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-two',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-three',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'The first little pig wanted to play, so he built his house quickly from bundles of wheat. "All done!" he cheered. His sister and brother waved and walked on.',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 3200,
          assetId: 'pop',
        },
        {
          atMs: 5000,
          assetId: 'rustle',
        },
        {
          atMs: 5640,
          assetId: 'rustle',
        },
        {
          atMs: 6280,
          assetId: 'rustle',
        },
        {
          atMs: 6920,
          assetId: 'rustle',
        },
        {
          atMs: 7560,
          assetId: 'rustle',
        },
        {
          atMs: 8200,
          assetId: 'rustle',
        },
        {
          atMs: 8840,
          assetId: 'rustle',
        },
        {
          atMs: 9480,
          assetId: 'rustle',
        },
        {
          atMs: 10120,
          assetId: 'rustle',
        },
        {
          atMs: 11200,
          assetId: 'cheer',
        },
        {
          atMs: 13200,
          assetId: 'patter',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'pigs-wolf',
      },
      events: ['wheat-house-built'],
    },
    {
      id: 'pigs-wolf',
      title: 'Here Comes the Wolf',
      durationMs: 15500,
      background: 'pigs-wolf',
      characters: [
        {
          id: 'pig-one',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'wolf',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'Out of the woods crept a hungry wolf. He sniffed at the wheat house. "Little pig, little pig, let me come in!" "Not by the hair on my chinny chin chin!"',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 800,
          assetId: 'step',
        },
        {
          atMs: 2600,
          assetId: 'step',
        },
        {
          atMs: 4400,
          assetId: 'step',
        },
        {
          atMs: 6300,
          assetId: 'sniff',
        },
        {
          atMs: 8200,
          assetId: 'boom',
        },
        {
          atMs: 11800,
          assetId: 'pop',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'pigs-wheat-blow',
      },
      events: ['wolf-introduced', 'wolf-at-wheat-house'],
    },
    {
      id: 'pigs-wheat-blow',
      title: 'Huff and Puff',
      durationMs: 16000,
      background: 'pigs-wheat-blow',
      characters: [
        {
          id: 'pig-one',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'wolf',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: "\"Then I'll huff, and I'll puff, and I'll blow your house in!\" The wolf blew and blew. Whoosh! The wheat house flew apart, and the little pig ran away fast!",
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 4000,
          assetId: 'inhale',
        },
        {
          atMs: 6000,
          assetId: 'blow',
        },
        {
          atMs: 7600,
          assetId: 'inhale',
        },
        {
          atMs: 8800,
          assetId: 'blow',
        },
        {
          atMs: 9100,
          assetId: 'crash',
        },
        {
          atMs: 11600,
          assetId: 'patter',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [
        {
          id: 'gentlePuff',
          atMs: 13000,
          prompt: {
            title: 'A little story magic!',
            body: 'Blow a gentle breeze to help the little pig reach a safe place, or tap the button!',
          },
          gesture: 'blow',
          windowMs: 8000,
          buttonLabel: 'Give a gentle puff',
          buttonText: 'Give a gentle puff',
          buttonHint: 'You can tap, too.',
          onSuccess: {
            actions: [],
            nextSceneId: null,
            caption: 'The little pig hurried to safety.',
            spoken: 'The little pig hurried to safety.',
          },
          onTimeout: {
            actions: [],
            nextSceneId: null,
            caption: 'The little pig found his own way to safety.',
            spoken: 'The little pig found his own way to safety.',
          },
          alternatives: [],
        },
      ],
      next: {
        type: 'scene',
        sceneId: 'pigs-stone',
      },
      events: [
        'wolf-blows-wheat-house',
        'wheat-house-collapses',
        'first-pig-escapes',
      ],
    },
    {
      id: 'pigs-stone',
      title: 'A House of Stone',
      durationMs: 18000,
      background: 'pigs-stone',
      characters: [
        {
          id: 'pig-one',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-two',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'The second little pig was building with heavy stones. She stacked them high, but she ran out before making a door, so she topped it with a roof of leaves. Then her brother came running in!',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 700,
          assetId: 'stone',
        },
        {
          atMs: 1460,
          assetId: 'stone',
        },
        {
          atMs: 2220,
          assetId: 'stone',
        },
        {
          atMs: 2980,
          assetId: 'stone',
        },
        {
          atMs: 3740,
          assetId: 'stone',
        },
        {
          atMs: 4500,
          assetId: 'stone',
        },
        {
          atMs: 5260,
          assetId: 'stone',
        },
        {
          atMs: 6020,
          assetId: 'stone',
        },
        {
          atMs: 6780,
          assetId: 'stone',
        },
        {
          atMs: 7540,
          assetId: 'stone',
        },
        {
          atMs: 9400,
          assetId: 'sad',
        },
        {
          atMs: 10200,
          assetId: 'rustle',
        },
        {
          atMs: 11600,
          assetId: 'patter',
        },
        {
          atMs: 14200,
          assetId: 'gasp',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'pigs-stone-attack',
      },
      events: [
        'stone-house-built',
        'stone-house-weakness',
        'first-pig-reaches-second',
      ],
    },
    {
      id: 'pigs-stone-attack',
      title: 'The Leafy Roof',
      durationMs: 19000,
      background: 'pigs-stone-attack',
      characters: [
        {
          id: 'pig-one',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-two',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'wolf',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: "The wolf followed them. He couldn't blow down the stone walls, so he huffed right through the open doorway. Whoosh! The leafy roof flew away! The two pigs slipped out the back and ran to their brother's house.",
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 600,
          assetId: 'step',
        },
        {
          atMs: 2400,
          assetId: 'step',
        },
        {
          atMs: 4500,
          assetId: 'inhale',
        },
        {
          atMs: 6500,
          assetId: 'blow',
        },
        {
          atMs: 8200,
          assetId: 'stomp',
        },
        {
          atMs: 9600,
          assetId: 'inhale',
        },
        {
          atMs: 11000,
          assetId: 'blow',
        },
        {
          atMs: 11500,
          assetId: 'whoosh',
        },
        {
          atMs: 13800,
          assetId: 'patter',
        },
        {
          atMs: 17200,
          assetId: 'stomp',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'pigs-brick',
      },
      events: ['wolf-follows', 'stone-house-threatened', 'pigs-flee-to-brick'],
    },
    {
      id: 'pigs-brick',
      title: 'A House of Brick',
      durationMs: 13500,
      background: 'pigs-brick',
      characters: [
        {
          id: 'pig-three',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'The third little pig took his time. Brick by brick, he built strong walls, a sturdy roof, and a tall chimney.',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 700,
          assetId: 'brick',
        },
        {
          atMs: 1220,
          assetId: 'brick',
        },
        {
          atMs: 1740,
          assetId: 'brick',
        },
        {
          atMs: 2260,
          assetId: 'brick',
        },
        {
          atMs: 2780,
          assetId: 'brick',
        },
        {
          atMs: 3300,
          assetId: 'brick',
        },
        {
          atMs: 3820,
          assetId: 'brick',
        },
        {
          atMs: 4340,
          assetId: 'brick',
        },
        {
          atMs: 4860,
          assetId: 'brick',
        },
        {
          atMs: 5380,
          assetId: 'brick',
        },
        {
          atMs: 5900,
          assetId: 'brick',
        },
        {
          atMs: 6420,
          assetId: 'brick',
        },
        {
          atMs: 6940,
          assetId: 'brick',
        },
        {
          atMs: 7460,
          assetId: 'brick',
        },
        {
          atMs: 7980,
          assetId: 'brick',
        },
        {
          atMs: 8500,
          assetId: 'brick',
        },
        {
          atMs: 9020,
          assetId: 'brick',
        },
        {
          atMs: 10900,
          assetId: 'brick',
        },
        {
          atMs: 11300,
          assetId: 'cheer',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [
        {
          id: 'lastBrick',
          atMs: 10000,
          prompt: {
            title: 'Help place the last brick!',
            body: 'Raise a hand to lift it up into the top of the wall!',
            narrate: false,
          },
          windowMs: 7000,
          gesture: 'raiseHand',
          buttonLabel: 'Place the Last Brick',
          buttonText: '🧱 Place the Last Brick',
          buttonHint: 'or raise a hand',
          onSuccess: {
            actions: [],
            nextSceneId: null,
            caption: 'You lifted the last brick! The brick house is finished.',
            spoken: 'Up it goes! The brick house is finished!',
          },
          onTimeout: {
            actions: [],
            nextSceneId: null,
            caption: 'The third little pig set the last brick on top. Done!',
            spoken: 'The last brick is in place!',
          },
          alternatives: [],
        },
      ],
      next: {
        type: 'scene',
        sceneId: 'pigs-reunite',
      },
      events: ['brick-house-built'],
    },
    {
      id: 'pigs-reunite',
      title: 'Together Again',
      durationMs: 14000,
      background: 'pigs-reunite',
      characters: [
        {
          id: 'pig-one',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-two',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-three',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'Just then, his sister and brother came running. "The wolf is coming!" In they hurried, and slam! The strong door shut tight. All three pigs were together.',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 400,
          assetId: 'patter',
        },
        {
          atMs: 3800,
          assetId: 'gasp',
        },
        {
          atMs: 10100,
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
        sceneId: 'pigs-brick-attack',
      },
      events: ['pigs-reunite'],
    },
    {
      id: 'pigs-brick-attack',
      title: 'The Strong Brick House',
      durationMs: 20000,
      background: 'pigs-brick-attack',
      characters: [
        {
          id: 'pig-one',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-two',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-three',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'wolf',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'The wolf huffed, and he puffed, and he blew with all his might! But the brick house did not move, not even one brick. He tried again and again. The house stood strong!',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 600,
          assetId: 'step',
        },
        {
          atMs: 2200,
          assetId: 'step',
        },
        {
          atMs: 3500,
          assetId: 'inhale',
        },
        {
          atMs: 5000,
          assetId: 'blow',
        },
        {
          atMs: 7500,
          assetId: 'inhale',
        },
        {
          atMs: 9000,
          assetId: 'blow',
        },
        {
          atMs: 11200,
          assetId: 'stomp',
        },
        {
          atMs: 12500,
          assetId: 'inhale',
        },
        {
          atMs: 15600,
          assetId: 'blow',
        },
        {
          atMs: 18300,
          assetId: 'stomp',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [
        {
          id: 'brace',
          atMs: 15500,
          prompt: {
            title: 'One more giant puff is coming!',
            body: 'Spread your arms wide to help the brick house stand strong!',
            narrate: false,
          },
          windowMs: 8000,
          gesture: 'spreadArms',
          buttonLabel: 'Make the House Strong',
          buttonText: '🏠 Make it Strong',
          buttonHint: 'or spread your arms',
          onSuccess: {
            actions: [],
            nextSceneId: null,
            caption: 'Your strong arms helped the brick house stand firm!',
            spoken: 'Strong arms, strong house! It did not move!',
          },
          onTimeout: {
            actions: [],
            nextSceneId: null,
            caption: 'The bricks held tight all on their own. Strong building!',
            spoken: 'The bricks held tight!',
          },
          alternatives: [],
        },
      ],
      next: {
        type: 'scene',
        sceneId: 'pigs-chimney',
      },
      events: [
        'wolf-attacks-brick-house',
        'brick-house-stands',
        'wolf-frustrated',
      ],
    },
    {
      id: 'pigs-chimney',
      title: "The Wolf's Last Trick",
      durationMs: 21000,
      background: 'pigs-chimney',
      characters: [
        {
          id: 'pig-one',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-two',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-three',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'wolf',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'The wolf had one last trick. He climbed onto the roof to sneak down the chimney! But the clever third pig popped a lid on top. The wolf slipped, slid down the roof, and splash! He landed in the rain barrel.',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 600,
          assetId: 'idea',
        },
        {
          atMs: 3000,
          assetId: 'step',
        },
        {
          atMs: 4000,
          assetId: 'step',
        },
        {
          atMs: 8300,
          assetId: 'clank',
        },
        {
          atMs: 9200,
          assetId: 'bonk',
        },
        {
          atMs: 10200,
          assetId: 'slide',
        },
        {
          atMs: 12000,
          assetId: 'splash',
        },
      ],
      transitions: {
        enterMs: 0,
        exitMs: 0,
      },
      interactions: [],
      next: {
        type: 'scene',
        sceneId: 'pigs-retreat',
      },
      events: ['wolf-last-plan', 'wolf-outsmarted'],
    },
    {
      id: 'pigs-retreat',
      title: 'Goodbye, Wolf!',
      durationMs: 9000,
      background: 'pigs-retreat',
      characters: [
        {
          id: 'pig-one',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-two',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-three',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'wolf',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'Dripping wet and grumbling, the wolf ran off into the woods and never came back.',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 1600,
          assetId: 'retreat',
        },
        {
          atMs: 5800,
          assetId: 'door',
        },
        {
          atMs: 7000,
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
        sceneId: 'pigs-ending',
      },
      events: ['wolf-retreats'],
    },
    {
      id: 'pigs-ending',
      title: 'Safe and Sound',
      durationMs: 16000,
      background: 'pigs-ending',
      characters: [
        {
          id: 'pig-one',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-two',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
        {
          id: 'pig-three',
          x: 0,
          y: 0,
          animation: 'cinematic',
        },
      ],
      narration: [
        {
          atMs: 0,
          text: 'The three little pigs cheered and danced together in their strong brick house. Building carefully takes time, but hard work and planning keep everyone safe.',
        },
      ],
      actions: [],
      soundEffects: [
        {
          atMs: 9000,
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
      events: ['pigs-celebrate', 'conclusion', 'moral'],
    },
  ],
} satisfies Story;
