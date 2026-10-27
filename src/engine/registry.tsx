import { RiveJack } from './Character';
import type { Character, CharacterViewProps } from './Character';
import type { ComponentType } from 'react';
import { StoryCover } from '../components/art/StoryArt';
import { AnimatedStoryScene } from '../rendering/AnimatedStoryScene';
import { Hare, Tortoise, Crowd } from '../rendering/forest/characters';
import {
  JackActor,
  Mother,
  Cow,
  Trader,
  Giant,
  Hen,
  Pig,
  Wolf,
} from '../rendering/storybook/cast';
import { STORY_SFX } from '../audio/sfx';
import type { Sfx } from '../audio/sfx';
import type { RegistryCatalog } from './schema';
import type { StoryId } from './types';
import type { BodyGesture } from '../vision/bodyGestures';

export type CharacterProps = CharacterViewProps;
type CharacterAsset = {
  Component: ComponentType<CharacterProps>;
  states: readonly string[];
};
const poseAliases: Record<string, readonly string[]> = {
  happy: ['celebrate', 'cheer', 'happy', 'grin'],
  scared: ['worried', 'scared', 'surprised'],
  casting: ['beans', 'point', 'talk'],
  reacting: ['curious', 'wave', 'surprised', 'cheer', 'happy'],
};
/** Adapters narrow the validated animation id to each existing rig's pose vocabulary. */
function rig<P extends string>(
  Component: ComponentType<{ pose: P; t?: number; idle?: number }>,
  states: readonly P[],
): CharacterAsset {
  return {
    states: [
      'cinematic',
      'idle',
      'happy',
      'scared',
      'casting',
      'reacting',
      ...states,
    ],
    Component: ({ animation, t }) => (
      <Component
        pose={
          states.find((state) => state === animation) ??
          states.find((state) => poseAliases[animation]?.includes(state)) ??
          states[0]
        }
        t={t}
        idle={t}
      />
    ),
  };
}
const pig = (id: 'one' | 'two' | 'three' | 'mama') =>
  rig(
    (props: Omit<Parameters<typeof Pig>[0], 'id'>) => (
      <Pig {...props} id={id} />
    ),
    [
      'idle',
      'walk',
      'run',
      'build',
      'carry',
      'cheer',
      'scared',
      'proud',
      'wave',
      'talk',
      'push',
      'hug',
    ] as const,
  );
const rigRegistry: Record<string, CharacterAsset> = {
  'jack-rive': {
    Component: RiveJack,
    states: ['idle', 'happy', 'scared', 'casting', 'reacting'],
  },
  tortoise: {
    Component: ({ animation }) => (
      <g
        className={`tortoise is-${({ happy: 'energized', scared: 'worried', casting: 'magic', reacting: 'magic' } as Record<string, string>)[animation] ?? animation}`}
      >
        <Tortoise />
      </g>
    ),
    states: [
      'cinematic',
      'idle',
      'walk',
      'worried',
      'magic',
      'tuck',
      'ponder',
      'energized',
    ],
  },
  hare: {
    Component: ({ animation }) => (
      <g
        className={`hare is-${({ happy: 'cheer', scared: 'surprised', casting: 'magic', reacting: 'magic' } as Record<string, string>)[animation] ?? animation}`}
      >
        <Hare />
      </g>
    ),
    states: [
      'cinematic',
      'idle',
      'run',
      'sleep',
      'surprised',
      'cheer',
      'happy',
      'scared',
      'casting',
      'reacting',
    ],
  },
  'forest-friends': {
    Component: () => <Crowd />,
    states: ['cinematic', 'idle'],
  },
  jack: rig(JackActor, [
    'idle',
    'walk',
    'run',
    'curious',
    'beans',
    'surprised',
    'lookUp',
    'climb',
    'scared',
    'sneak',
    'celebrate',
    'sad',
  ]),
  mother: rig(Mother, [
    'idle',
    'talk',
    'point',
    'upset',
    'sad',
    'happy',
    'hug',
    'wave',
    'basket',
    'worried',
    'run',
  ]),
  cow: rig(Cow, ['idle', 'walk', 'moo', 'graze']),
  trader: rig(Trader, ['idle', 'offer', 'hold', 'walk', 'wave']),
  giant: rig(Giant, [
    'sit',
    'talk',
    'yawn',
    'sleep',
    'wake',
    'look',
    'stand',
    'reach',
    'shout',
    'laugh',
  ]),
  hen: rig(Hen, ['idle', 'peck', 'flap', 'sit', 'squawk', 'carried']),
  'pig-one': pig('one'),
  'pig-two': pig('two'),
  'pig-three': pig('three'),
  'mama-pig': pig('mama'),
  wolf: rig(Wolf, [
    'idle',
    'walk',
    'sneak',
    'sniff',
    'talk',
    'grin',
    'inhale',
    'blow',
    'surprised',
    'frustrated',
    'climb',
    'slip',
    'wet',
    'run',
  ]),
};
for (const character of Object.values(rigRegistry)) {
  character.states = [
    ...new Set([
      ...character.states,
      'idle',
      'happy',
      'scared',
      'casting',
      'reacting',
    ]),
  ];
}
export const characterRegistry: Record<string, Character> = Object.fromEntries(
  Object.entries(rigRegistry).map(([id, asset]) => [
    id,
    {
      ...asset,
      id,
      renderer: id === 'jack-rive' ? 'rive' : 'svg',
      animations: {
        idle: 'idle',
        happy: 'happy',
        scared: 'scared',
        casting: 'casting',
        reacting: 'reacting',
      },
    } satisfies Character,
  ]),
);
export type AssetProps = {
  elapsed: number;
  paused: boolean;
  magic: boolean;
  gesture: BodyGesture | null;
  characterId?: string;
  outcomes: (BodyGesture | 'auto' | null)[];
  personDetected?: boolean;
  holdProgress?: number;
  openMoment: number | null;
  onFinishLine: () => void;
};
export type SceneAsset = {
  Component: ComponentType<AssetProps>;
  composition: boolean;
};
const cinematic = (storyId: StoryId): SceneAsset => ({
  composition: true,
  Component: ({ personDetected, holdProgress, ...props }) => (
    <div
      className={
        personDetected
          ? holdProgress
            ? 'is-anticipating is-excited'
            : 'is-anticipating'
          : ''
      }
    >
      <AnimatedStoryScene {...props} storyId={storyId} />
    </div>
  ),
});
const forest = cinematic('hare');
const beanstalk = cinematic('beanstalk');
const pigs = cinematic('pigs');
export const assetRegistry: Record<string, SceneAsset> = {
  space: {
    composition: false,
    Component: () => (
      <>
        <rect width="1920" height="1080" fill="#151b46" />
        {Array.from({ length: 24 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 179) % 1920}
            cy={(i * 113) % 1080}
            r="5"
            fill="#fef3c7"
          />
        ))}
      </>
    ),
  },
  woodland: {
    composition: false,
    Component: () => (
      <>
        <rect width="1920" height="1080" fill="#b7dfc2" />
        <path d="M0 1080V650Q480 330 960 650T1920 650V1080Z" fill="#41764b" />
      </>
    ),
  },
  clouds: {
    composition: false,
    Component: () => (
      <g fill="#fff" opacity="0.7">
        {[200, 900, 1600].map((x) => (
          <ellipse key={x} cx={x} cy="200" rx="180" ry="65" />
        ))}
      </g>
    ),
  },
  meadow: {
    composition: false,
    Component: () => <rect width="1920" height="1080" fill="#d8ebc4" />,
  },
  'hare-cover': {
    composition: true,
    Component: () => <StoryCover storyId="hare" />,
  },
  'beanstalk-cover': {
    composition: true,
    Component: () => <StoryCover storyId="beanstalk" />,
  },
  'pigs-cover': {
    composition: true,
    Component: () => <StoryCover storyId="pigs" />,
  },
  'hare-intro': forest,
  'hare-challenge': forest,
  'hare-wind': forest,
  'hare-nap': forest,
  'hare-finish': forest,
  'hare-ending': forest,
  'jack-home': beanstalk,
  'jack-errand': beanstalk,
  'jack-trade': beanstalk,
  'jack-return': beanstalk,
  'jack-grow': beanstalk,
  'jack-climb': beanstalk,
  'jack-clouds': beanstalk,
  'jack-castle': beanstalk,
  'jack-hen': beanstalk,
  'jack-take': beanstalk,
  'jack-chase': beanstalk,
  'jack-escape': beanstalk,
  'jack-chop': beanstalk,
  'jack-ending': beanstalk,
  'pigs-intro': pigs,
  'pigs-wheat': pigs,
  'pigs-wolf': pigs,
  'pigs-wheat-blow': pigs,
  'pigs-stone': pigs,
  'pigs-stone-attack': pigs,
  'pigs-brick': pigs,
  'pigs-reunite': pigs,
  'pigs-brick-attack': pigs,
  'pigs-chimney': pigs,
  'pigs-retreat': pigs,
  'pigs-ending': pigs,
};
export const soundRegistry: Record<string, Sfx> = Object.fromEntries(
  (
    [
      ...STORY_SFX,
      'invite',
      'magic',
      'shield',
      'duck',
      'path',
      'finish',
      'celebrate',
    ] satisfies Sfx[]
  ).map((id) => [id, id]),
);
export const narrationAudioRegistry: Record<string, string> = {};
export const registryCatalog: RegistryCatalog = {
  assets: new Set(Object.keys(assetRegistry)),
  audio: new Set(Object.keys(narrationAudioRegistry)),
  layerAssets: new Set(
    Object.entries(assetRegistry)
      .filter(([, asset]) => !asset.composition)
      .map(([id]) => id),
  ),
  characters: Object.fromEntries(
    Object.entries(characterRegistry).map(([id, value]) => [id, value.states]),
  ),
  sounds: new Set(Object.keys(soundRegistry)),
};
