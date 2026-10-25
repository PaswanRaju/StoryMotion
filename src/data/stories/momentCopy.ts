import type { BodyGesture } from '../../vision/bodyGestures';
import type { MomentId } from './scenes';

/** Words on the invitation card, per optional moment. */
export const PROMPTS: Record<
  MomentId,
  { title: (name: string) => string; body: string }
> = {
  shield: {
    title: (name) => `${name} needs your help!`,
    body: 'Spread your arms wide to make a magic shield!',
  },
  path: {
    title: (name) => `Which way should ${name} go?`,
    body: 'Lean left for the shady woods, or right for the sunny meadow!',
  },
  boost: {
    title: (name) => `Give ${name} one last boost!`,
    body: 'Raise a hand up high!',
  },
  grow: {
    title: () => 'Help the magic beanstalk grow!',
    body: 'Raise your hand to wake up the magic sprout!',
  },
  dodge: {
    title: () => 'Help Jack choose a safe side!',
    body: 'A tumbling cloud is coming down. Lean left or right!',
  },
  glide: {
    title: () => 'The giant is waking up!',
    body: 'Spread your arms wide to open a magic leaf glider!',
  },
  protect: {
    title: () => 'Help protect Jack!',
    body: 'Spread your arms wide to wrap him in magic leaves!',
  },
  lastBrick: {
    title: () => 'Help place the last brick!',
    body: 'Raise a hand to lift it up into the top of the wall!',
  },
  brace: {
    title: () => 'One more giant puff is coming!',
    body: 'Spread your arms wide to help the brick house stand strong!',
  },
};

type ButtonCopy = { label: string; text: string; hint: string };
const ACTIONS: Record<BodyGesture, ButtonCopy> = {
  ARMS_WIDE: { label: 'Use Magic', text: '🫧 Use Magic', hint: 'or spread your arms' },
  LEAN_LEFT: { label: 'Choose Left', text: '← 🌲 Choose Left', hint: 'or lean left' },
  LEAN_RIGHT: { label: 'Choose Right', text: 'Choose Right ☀️ →', hint: 'or lean right' },
  HAND_RAISE: { label: 'Give Boost', text: '✨ Give Boost', hint: 'or raise a hand' },
  CROUCH: { label: 'Duck', text: '⬇ Duck', hint: 'or bend your knees' },
};
/** Story-specific button wording; other moments use the generic ACTIONS labels. */
const MOMENT_BUTTONS: Partial<
  Record<MomentId, Partial<Record<BodyGesture, ButtonCopy>>>
> = {
  grow: {
    HAND_RAISE: { label: 'Grow the Beanstalk', text: '🌱 Grow the Beanstalk', hint: 'or raise a hand' },
  },
  dodge: {
    LEAN_LEFT: { label: 'Move Left', text: '← Move Left', hint: 'or lean left' },
    LEAN_RIGHT: { label: 'Move Right', text: 'Move Right →', hint: 'or lean right' },
  },
  glide: {
    ARMS_WIDE: { label: 'Open the Glider', text: '🍃 Open the Glider', hint: 'or spread your arms' },
  },
  protect: {
    ARMS_WIDE: { label: 'Protect Jack', text: '🍃 Protect Jack', hint: 'or spread your arms' },
  },
  lastBrick: {
    HAND_RAISE: { label: 'Place the Last Brick', text: '🧱 Place the Last Brick', hint: 'or raise a hand' },
  },
  brace: {
    ARMS_WIDE: { label: 'Make the House Strong', text: '🏠 Make it Strong', hint: 'or spread your arms' },
  },
};
export const buttonFor = (moment: MomentId, gesture: BodyGesture) =>
  MOMENT_BUTTONS[moment]?.[gesture] ?? ACTIONS[gesture];

/** What happened, for the caption under the scene and the narrator's one-line reaction. */
export function reaction(
  moment: MomentId,
  outcome: BodyGesture | 'auto',
  name: string,
): { caption: string; spoken: string } {
  const auto = outcome === 'auto';
  switch (moment) {
    case 'shield':
      return auto
        ? {
            caption: `${name} found another way — tucked in safe while the leaves blew past!`,
            spoken: `${name} tucked in safe, and the leaves whooshed right past.`,
          }
        : {
            caption: `Magic shield! The leaves bounce right off the bubble around ${name}.`,
            spoken: 'Wow! A magic shield! The leaves bounce right off!',
          };
    case 'grow':
      return auto
        ? {
            caption: 'The magic beans woke up all by themselves!',
            spoken: 'The beans woke up all by themselves!',
          }
        : {
            caption: 'Your magic made the beanstalk grow! Look at it go!',
            spoken: 'Whoosh! Your magic made the beanstalk grow!',
          };
    case 'dodge':
      return auto
        ? {
            caption: 'Jack found a safe side all by himself!',
            spoken: 'Jack found a safe side.',
          }
        : {
            caption: `Great move! Jack swings ${outcome === 'LEAN_LEFT' ? 'left' : 'right'} and the cloud tumbles past.`,
            spoken: 'Great move! The cloud tumbled right past!',
          };
    case 'glide':
      return auto
        ? {
            caption: 'Jack slid all the way down the beanstalk!',
            spoken: 'Jack slid down the beanstalk, quick and quiet.',
          }
        : {
            caption: 'A magic leaf glider! Jack floats gently home.',
            spoken: 'A magic leaf glider! Jack floats gently home.',
          };
    case 'protect':
      return auto
        ? {
            caption: 'Jack slid down fast, holding the hen tight!',
            spoken: 'Jack slid down fast!',
          }
        : {
            caption: 'Magic leaves wrap around Jack and the hen, and they slide down safely!',
            spoken: 'Magic leaves! Jack slides down safely!',
          };
    case 'lastBrick':
      return auto
        ? {
            caption: 'The third little pig set the last brick on top. Done!',
            spoken: 'The last brick is in place!',
          }
        : {
            caption: 'You lifted the last brick! The brick house is finished.',
            spoken: 'Up it goes! The brick house is finished!',
          };
    case 'brace':
      return auto
        ? {
            caption: 'The bricks held tight all on their own. Strong building!',
            spoken: 'The bricks held tight!',
          }
        : {
            caption: 'Your strong arms helped the brick house stand firm!',
            spoken: 'Strong arms, strong house! It did not move!',
          };
    case 'path':
      return outcome === 'LEAN_LEFT'
        ? {
            caption: `Left path chosen! ${name} takes the cool, shady woods.`,
            spoken: 'The shady woods it is! Cool and green.',
          }
        : outcome === 'LEAN_RIGHT'
          ? {
              caption: `Right path chosen! ${name} takes the warm, sunny meadow.`,
              spoken: 'The sunny meadow it is! Warm and bright.',
            }
          : {
              caption: `${name} picked the sunny meadow. Off we go!`,
              spoken: `${name} picked the sunny meadow.`,
            };
    case 'boost':
      return auto
        ? {
            caption: `${name} keeps going, steady and strong!`,
            spoken: `Steady and strong, ${name} keeps going!`,
          }
        : {
            caption: `A sparkly boost! ${name} zooms toward the finish.`,
            spoken: `Zoom! ${name} feels full of energy!`,
          };
  }
}
