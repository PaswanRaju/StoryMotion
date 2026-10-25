import type { BodyGesture } from '../../vision/bodyGestures';
import type { StoryId } from '../../engine/types';

/**
 * The single source of truth for every story's plot. Each story is an ordered list
 * of explicit scenes; the player, the narrator, the captions, the optional gesture
 * moments and the scene renderers all look up the SAME active scene by id from
 * story time, so what is said, shown and asked always refer to one story event.
 *
 * `events` name the plot points a scene shows on screen; `cast` names who is
 * visible. Tests use both to assert that each story is complete and in order.
 */

/**
 * Optional interaction moments. 'glide' is not scheduled by any story any more; it
 * is kept because the legacy beanstalk climb renderer still knows how to draw it.
 */
export type MomentId =
  | 'shield'
  | 'path'
  | 'boost'
  | 'grow'
  | 'dodge'
  | 'glide'
  | 'protect'
  | 'lastBrick'
  | 'brace';

export type SceneMoment = {
  id: MomentId;
  /** When the invitation opens, relative to the start of its scene. */
  atMs: number;
  windowMs: number;
  accepts: readonly BodyGesture[];
};

export type CastId =
  | 'tortoise'
  | 'hare'
  | 'forest-friends'
  | 'jack'
  | 'mother'
  | 'cow'
  | 'trader'
  | 'giant'
  | 'hen'
  | 'pig-one'
  | 'pig-two'
  | 'pig-three'
  | 'mama-pig'
  | 'wolf';

export type StoryScene = {
  id: string;
  /** Chapter label in the player toolbar. */
  title: string;
  durationMs: number;
  /** Authored narration (also the always-visible caption). */
  narration: string;
  cast: readonly CastId[];
  events: readonly string[];
  moments?: readonly SceneMoment[];
};

/**
 * Tortoise and Hare keeps its existing cinematic forest renderer. The forest
 * choreography starts its race at forest-time 3 s; the two introduction scenes
 * hold the forest picture at the starting line for HARE_INTRO_HOLD_MS so the
 * characters and the challenge are introduced before the race begins.
 */
export const HARE_INTRO_HOLD_MS = 13000;
const HARE_HOLD_AT_MS = 2500;
/** Story time → forest-renderer time. */
export function forestTime(storyMs: number) {
  return storyMs < HARE_HOLD_AT_MS + HARE_INTRO_HOLD_MS
    ? Math.min(storyMs, HARE_HOLD_AT_MS)
    : storyMs - HARE_INTRO_HOLD_MS;
}

const HARE: readonly StoryScene[] = [
  {
    id: 'hare-intro',
    title: 'Meet Tortoise and Hare',
    durationMs: 9000,
    narration:
      'Once upon a time, in a sunny forest, lived a speedy Hare and a slow, steady Tortoise.',
    cast: ['tortoise', 'hare', 'forest-friends'],
    events: ['intro', 'tortoise-introduced', 'hare-introduced'],
  },
  {
    id: 'hare-challenge',
    title: 'The Challenge',
    durationMs: 12000,
    narration:
      '"Nobody can beat me!" Hare bragged. "Then let\'s have a race," said Tortoise kindly. Ready, set, go!',
    cast: ['tortoise', 'hare', 'forest-friends'],
    events: ['race-challenge', 'race-begins'],
  },
  {
    id: 'hare-wind',
    title: 'Step by Step',
    durationMs: 10000,
    narration:
      'Hare zoomed ahead. Tortoise kept going, step by step, until a wild gust of wind came whooshing down the trail!',
    cast: ['tortoise', 'hare'],
    events: ['hare-ahead', 'tortoise-steady'],
    moments: [
      { id: 'shield', atMs: 3000, windowMs: 8000, accepts: ['ARMS_WIDE'] },
    ],
  },
  {
    id: 'hare-nap',
    title: 'Hare Takes a Nap',
    durationMs: 10000,
    narration:
      'Sure he would win, Hare took a nap! Tortoise passed him and reached a fork in the trail.',
    cast: ['tortoise', 'hare'],
    events: ['hare-overconfident', 'hare-sleeps', 'tortoise-passes'],
    moments: [
      {
        id: 'path',
        atMs: 3500,
        windowMs: 7000,
        accepts: ['LEAN_LEFT', 'LEAN_RIGHT'],
      },
      { id: 'boost', atMs: 8000, windowMs: 7000, accepts: ['HAND_RAISE'] },
    ],
  },
  {
    id: 'hare-finish',
    title: 'The Finish Line',
    durationMs: 7000,
    narration:
      'Hare woke with a jump! But Tortoise was already crossing the finish line!',
    cast: ['tortoise', 'hare', 'forest-friends'],
    events: ['hare-wakes', 'tortoise-wins'],
  },
  {
    id: 'hare-ending',
    title: 'Slow and Steady',
    durationMs: 7000,
    narration:
      'Hare cheered for his friend. "Well done, Tortoise!" Slow and steady wins the race.',
    cast: ['tortoise', 'hare', 'forest-friends'],
    events: ['hare-reacts', 'conclusion', 'moral'],
  },
];

/**
 * Jack's climb reuses the legacy tall-world beanstalk renderer for three scenes.
 * These map story-scene time to that renderer's original timeline.
 */
export const BEANSTALK_LEGACY_SCENES = ['jack-grow', 'jack-climb', 'jack-clouds'] as const;
export function beanstalkLegacyTime(sceneId: string, localMs: number) {
  if (sceneId === 'jack-grow') return 11950 + Math.max(0, localMs - 8450);
  if (sceneId === 'jack-climb') return 18000 + localMs;
  // Hold on the cloud-kingdom reveal (before the legacy castle cut at 33 s).
  return Math.min(32400, 26500 + localMs);
}

const BEANSTALK: readonly StoryScene[] = [
  {
    id: 'jack-home',
    title: 'Jack and His Mother',
    durationMs: 13500,
    narration:
      'Once upon a time, a boy named Jack lived with his mother and their cow, Milky-White. They were very poor, and their cupboard was almost empty.',
    cast: ['jack', 'mother', 'cow'],
    events: ['intro', 'jack-introduced', 'mother-introduced', 'cow-introduced', 'family-needs-food'],
  },
  {
    id: 'jack-errand',
    title: 'Off to Market',
    durationMs: 14500,
    narration:
      '"Jack," said his mother, "please take Milky-White to the market and trade her for vegetables, so we have food to eat." Jack took the rope and set off.',
    cast: ['jack', 'mother', 'cow'],
    events: ['mother-gives-cow', 'jack-leaves-for-market'],
  },
  {
    id: 'jack-trade',
    title: 'The Mysterious Trader',
    durationMs: 17500,
    narration:
      'On the road, Jack met a mysterious old trader. "I will give you five magic beans for your cow," he whispered. The beans sparkled. Jack said yes, handed over Milky-White, and took the beans.',
    cast: ['jack', 'cow', 'trader'],
    events: ['trader-introduced', 'trader-offers-beans', 'cow-traded', 'jack-receives-beans'],
  },
  {
    id: 'jack-return',
    title: 'Beans Instead of Food',
    durationMs: 16000,
    narration:
      'When Jack got home, his mother was upset. "Beans? We needed food!" She tossed the beans out into the garden, and Jack went to bed sad and hungry.',
    cast: ['jack', 'mother'],
    events: ['mother-upset', 'beans-in-ground', 'night-falls'],
  },
  {
    id: 'jack-grow',
    title: 'The Magic Beanstalk',
    durationMs: 14500,
    narration:
      'The next morning, Jack found a tiny green sprout where the beans had landed. It was glowing with magic!',
    cast: ['jack'],
    events: ['sprout-appears', 'beanstalk-grows'],
    moments: [
      { id: 'grow', atMs: 8500, windowMs: 8000, accepts: ['HAND_RAISE'] },
    ],
  },
  {
    id: 'jack-climb',
    title: 'Jack Climbs',
    durationMs: 8500,
    narration:
      'Jack grabbed the leafy vines and began to climb, higher and higher!',
    cast: ['jack'],
    events: ['jack-climbs'],
    moments: [
      {
        id: 'dodge',
        atMs: 6000,
        windowMs: 7000,
        accepts: ['LEAN_LEFT', 'LEAN_RIGHT'],
      },
    ],
  },
  {
    id: 'jack-clouds',
    title: 'Above the Clouds',
    durationMs: 11500,
    narration:
      'Up through the clouds he went, until his house looked tiny far below. At the very top, Jack found a whole new land!',
    cast: ['jack'],
    events: ['jack-reaches-clouds'],
  },
  {
    id: 'jack-castle',
    title: "The Giant's Castle",
    durationMs: 14500,
    narration:
      'There stood an enormous castle. Everything inside was gigantic! Thump, thump, thump! A Giant stomped into the hall, and Jack hid behind a huge cup.',
    cast: ['jack', 'giant'],
    events: ['castle-introduced', 'giant-introduced'],
  },
  {
    id: 'jack-hen',
    title: 'The Golden Hen',
    durationMs: 15500,
    narration:
      'The Giant set his hen on a stool. "Lay!" he boomed, and she laid an egg of shining gold! Just one golden egg could buy food for a whole year.',
    cast: ['jack', 'giant', 'hen'],
    events: ['hen-introduced', 'golden-egg', 'hen-belongs-to-giant'],
  },
  {
    id: 'jack-take',
    title: 'Jack Takes the Hen',
    durationMs: 13000,
    narration:
      'Soon the Giant was snoring. Jack thought of his hungry mother. Quietly, he scooped up the golden hen and tiptoed toward the door.',
    cast: ['jack', 'giant', 'hen'],
    events: ['jack-motivation', 'jack-takes-hen'],
  },
  {
    id: 'jack-chase',
    title: 'The Giant Wakes Up',
    durationMs: 13000,
    narration:
      '"Cluck, cluck!" squawked the hen. The Giant woke up and saw that his hen was gone. "Hey! Come back!" he roared, and Jack ran for the beanstalk!',
    cast: ['jack', 'giant', 'hen'],
    events: ['giant-wakes', 'giant-notices-missing-hen', 'chase-begins'],
  },
  {
    id: 'jack-escape',
    title: 'Down the Beanstalk',
    durationMs: 14000,
    narration:
      'Jack hurried down the beanstalk, holding the hen tight. The Giant climbed after him, and the whole beanstalk swayed and shook!',
    cast: ['jack', 'giant', 'hen'],
    events: ['jack-escapes', 'giant-pursues'],
    moments: [
      { id: 'protect', atMs: 9000, windowMs: 8000, accepts: ['ARMS_WIDE'] },
    ],
  },
  {
    id: 'jack-chop',
    title: 'Down Comes the Beanstalk',
    durationMs: 17000,
    narration:
      '"Mother, the axe!" Jack called. Chop, chop, chop! The Giant hurried back up to his castle in the clouds, and the beanstalk came tumbling down.',
    cast: ['jack', 'mother', 'giant', 'hen'],
    events: ['jack-home-safe', 'beanstalk-cut', 'pursuit-ends'],
  },
  {
    id: 'jack-ending',
    title: 'Happily Ever After',
    durationMs: 19000,
    narration:
      'From then on, the hen laid a golden egg each day, and Jack and his mother were never hungry again. They shared with their neighbors, and Jack promised to think carefully before every big choice.',
    cast: ['jack', 'mother', 'hen'],
    events: ['resolution', 'conclusion', 'moral'],
  },
];

const PIGS: readonly StoryScene[] = [
  {
    id: 'pigs-intro',
    title: 'Three Little Pigs',
    durationMs: 16500,
    narration:
      'Once upon a time, three little pigs hugged their mother goodbye. They were off to build homes of their own. "Build them strong," said Mama Pig, "and watch out for the wolf!"',
    cast: ['pig-one', 'pig-two', 'pig-three', 'mama-pig'],
    events: ['intro', 'three-pigs-introduced', 'pigs-leave-home', 'wolf-warning'],
  },
  {
    id: 'pigs-wheat',
    title: 'A House of Wheat',
    durationMs: 15500,
    narration:
      'The first little pig wanted to play, so he built his house quickly from bundles of wheat. "All done!" he cheered. His sister and brother waved and walked on.',
    cast: ['pig-one', 'pig-two', 'pig-three'],
    events: ['wheat-house-built'],
  },
  {
    id: 'pigs-wolf',
    title: 'Here Comes the Wolf',
    durationMs: 15500,
    narration:
      'Out of the woods crept a hungry wolf. He sniffed at the wheat house. "Little pig, little pig, let me come in!" "Not by the hair on my chinny chin chin!"',
    cast: ['pig-one', 'wolf'],
    events: ['wolf-introduced', 'wolf-at-wheat-house'],
  },
  {
    id: 'pigs-wheat-blow',
    title: 'Huff and Puff',
    durationMs: 16000,
    narration:
      '"Then I\'ll huff, and I\'ll puff, and I\'ll blow your house in!" The wolf blew and blew. Whoosh! The wheat house flew apart, and the little pig ran away fast!',
    cast: ['pig-one', 'wolf'],
    events: ['wolf-blows-wheat-house', 'wheat-house-collapses', 'first-pig-escapes'],
  },
  {
    id: 'pigs-stone',
    title: 'A House of Stone',
    durationMs: 18000,
    narration:
      'The second little pig was building with heavy stones. She stacked them high, but she ran out before making a door, so she topped it with a roof of leaves. Then her brother came running in!',
    cast: ['pig-one', 'pig-two'],
    events: ['stone-house-built', 'stone-house-weakness', 'first-pig-reaches-second'],
  },
  {
    id: 'pigs-stone-attack',
    title: 'The Leafy Roof',
    durationMs: 19000,
    narration:
      "The wolf followed them. He couldn't blow down the stone walls, so he huffed right through the open doorway. Whoosh! The leafy roof flew away! The two pigs slipped out the back and ran to their brother's house.",
    cast: ['pig-one', 'pig-two', 'wolf'],
    events: ['wolf-follows', 'stone-house-threatened', 'pigs-flee-to-brick'],
  },
  {
    id: 'pigs-brick',
    title: 'A House of Brick',
    durationMs: 13500,
    narration:
      'The third little pig took his time. Brick by brick, he built strong walls, a sturdy roof, and a tall chimney.',
    cast: ['pig-three'],
    events: ['brick-house-built'],
    moments: [
      { id: 'lastBrick', atMs: 10000, windowMs: 7000, accepts: ['HAND_RAISE'] },
    ],
  },
  {
    id: 'pigs-reunite',
    title: 'Together Again',
    durationMs: 14000,
    narration:
      'Just then, his sister and brother came running. "The wolf is coming!" In they hurried, and slam! The strong door shut tight. All three pigs were together.',
    cast: ['pig-one', 'pig-two', 'pig-three'],
    events: ['pigs-reunite'],
  },
  {
    id: 'pigs-brick-attack',
    title: 'The Strong Brick House',
    durationMs: 20000,
    narration:
      'The wolf huffed, and he puffed, and he blew with all his might! But the brick house did not move, not even one brick. He tried again and again. The house stood strong!',
    cast: ['pig-one', 'pig-two', 'pig-three', 'wolf'],
    events: ['wolf-attacks-brick-house', 'brick-house-stands', 'wolf-frustrated'],
    moments: [
      { id: 'brace', atMs: 15500, windowMs: 8000, accepts: ['ARMS_WIDE'] },
    ],
  },
  {
    id: 'pigs-chimney',
    title: "The Wolf's Last Trick",
    durationMs: 21000,
    narration:
      'The wolf had one last trick. He climbed onto the roof to sneak down the chimney! But the clever third pig popped a lid on top. The wolf slipped, slid down the roof, and splash! He landed in the rain barrel.',
    cast: ['pig-one', 'pig-two', 'pig-three', 'wolf'],
    events: ['wolf-last-plan', 'wolf-outsmarted'],
  },
  {
    id: 'pigs-retreat',
    title: 'Goodbye, Wolf!',
    durationMs: 9000,
    narration:
      'Dripping wet and grumbling, the wolf ran off into the woods and never came back.',
    cast: ['pig-one', 'pig-two', 'pig-three', 'wolf'],
    events: ['wolf-retreats'],
  },
  {
    id: 'pigs-ending',
    title: 'Safe and Sound',
    durationMs: 16000,
    narration:
      'The three little pigs cheered and danced together in their strong brick house. Building carefully takes time, but hard work and planning keep everyone safe.',
    cast: ['pig-one', 'pig-two', 'pig-three'],
    events: ['pigs-celebrate', 'conclusion', 'moral'],
  },
];

export const STORY_SCENES: Record<StoryId, readonly StoryScene[]> = {
  hare: HARE,
  beanstalk: BEANSTALK,
  pigs: PIGS,
};

/** Story time (ms) at which each scene begins. */
export function sceneStarts(storyId: StoryId): number[] {
  let at = 0;
  return STORY_SCENES[storyId].map((scene) => {
    const start = at;
    at += scene.durationMs;
    return start;
  });
}
const STARTS: Record<StoryId, number[]> = {
  hare: sceneStarts('hare'),
  beanstalk: sceneStarts('beanstalk'),
  pigs: sceneStarts('pigs'),
};
export const storyDuration = (storyId: StoryId) =>
  STORY_SCENES[storyId].reduce((total, scene) => total + scene.durationMs, 0);

export function sceneIndexAt(storyId: StoryId, elapsed: number) {
  const starts = STARTS[storyId];
  let index = 0;
  while (index + 1 < starts.length && elapsed >= starts[index + 1]) index++;
  return index;
}

/** The active scene and the time inside it. */
export function sceneAt(storyId: StoryId, elapsed: number) {
  const index = sceneIndexAt(storyId, elapsed);
  const start = STARTS[storyId][index];
  return {
    index,
    scene: STORY_SCENES[storyId][index],
    start,
    local: Math.max(0, elapsed - start),
  };
}

/** Every optional moment, with its absolute story-time start. */
export function storyMoments(storyId: StoryId) {
  const starts = STARTS[storyId];
  return STORY_SCENES[storyId].flatMap((scene, index) =>
    (scene.moments ?? []).map((moment) => ({
      id: moment.id,
      startMs: starts[index] + moment.atMs,
      windowMs: moment.windowMs,
      accepts: moment.accepts,
      sceneId: scene.id,
    })),
  );
}

/** Plot points in the order a child must see them (used by completeness tests). */
export const REQUIRED_EVENTS: Record<StoryId, readonly string[]> = {
  hare: [
    'intro',
    'tortoise-introduced',
    'hare-introduced',
    'race-challenge',
    'race-begins',
    'hare-overconfident',
    'hare-sleeps',
    'tortoise-passes',
    'hare-wakes',
    'tortoise-wins',
    'hare-reacts',
    'conclusion',
    'moral',
  ],
  beanstalk: [
    'intro',
    'jack-introduced',
    'mother-introduced',
    'family-needs-food',
    'mother-gives-cow',
    'trader-offers-beans',
    'cow-traded',
    'jack-receives-beans',
    'mother-upset',
    'beans-in-ground',
    'beanstalk-grows',
    'jack-climbs',
    'castle-introduced',
    'giant-introduced',
    'hen-introduced',
    'jack-takes-hen',
    'giant-notices-missing-hen',
    'chase-begins',
    'jack-escapes',
    'beanstalk-cut',
    'pursuit-ends',
    'resolution',
    'conclusion',
    'moral',
  ],
  pigs: [
    'intro',
    'three-pigs-introduced',
    'wheat-house-built',
    'wolf-introduced',
    'wolf-blows-wheat-house',
    'wheat-house-collapses',
    'stone-house-built',
    'stone-house-threatened',
    'pigs-flee-to-brick',
    'brick-house-built',
    'pigs-reunite',
    'wolf-attacks-brick-house',
    'brick-house-stands',
    'wolf-retreats',
    'pigs-celebrate',
    'conclusion',
    'moral',
  ],
};
