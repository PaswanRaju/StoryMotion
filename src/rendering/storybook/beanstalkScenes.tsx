import type { ReactNode } from 'react';
import type { MomentId } from '../../data/stories/scenes';
import type { Outcome } from '../forest/characterState';
import { clamp01, ease, hash, keys, lerp, lin, wave } from './clock';
import {
  Cow,
  Giant,
  GiantLegs,
  GoldenEgg,
  Hen,
  MagicBeans,
  Mother,
  Place,
  Trader,
} from './cast';
import {
  COW_COLLAR,
  handAt,
  MOTHER_ARM,
  TRADER_ARM,
  TRADER_SHOULDER,
} from './geometry';
import {
  Axe,
  Basket,
  Jack,
  ThoughtOfMother,
  VeggieBasket,
  Zzz,
} from './beanstalkProps';
import type { JackPose } from './cast';
import {
  CastleHall,
  Cottage,
  CottageYard,
  DriftingClouds,
  Dust,
  GiantCup,
  GROUND_Y,
  MarketRoad,
  Pop,
  Rope,
  Sky,
  Sparkles,
  StalkColumn,
  Stool,
} from './sets';

export type SceneCtx = {
  /** Story time inside the scene (holds while an invitation is open). */
  t: number;
  /** Idle clock: keeps running while the story holds, stops on pause. */
  idle: number;
  dur: number;
  outcome: (id: MomentId) => Outcome | null;
  open: MomentId | null;
};
export type Camera = {
  zoom?: number;
  cx?: number;
  cy?: number;
  shake?: number;
};
export type SceneDef = {
  render: (ctx: SceneCtx) => ReactNode;
  camera?: (ctx: SceneCtx) => Camera;
};

const JS = 0.8; // Jack's scale on the ground (matches beanstalkProps)
const MS = 0.86; // Mother
const CS = 0.82; // Milky-White
/** Jack's hands in his own coordinates (feet at the origin). */
const JACK_HAND_FRONT = [55, -114] as const;
const JACK_HAND_BACK = [-55, -114] as const;
const jackHand = (
  x: number,
  y: number,
  s: number,
  hand: readonly [number, number] = JACK_HAND_FRONT,
  facing = 1,
) => ({
  x: x + hand[0] * s * facing,
  y: y + hand[1] * s,
});
const collar = (x: number, y: number, s: number, facing: 1 | -1) => ({
  x: x + COW_COLLAR[0] * s * facing,
  y: y + COW_COLLAR[1] * s,
});

/* ================================================================ scenes */

/** 1 — Jack, his mother, Milky-White and an empty cupboard. */
const home: SceneDef = {
  camera: ({ t }) => ({
    zoom: lerp(1.08, 1, ease(t, 0, 6000)),
    cx: 900,
    cy: 600,
  }),
  render: ({ t, idle }) => {
    const upside = ease(t, 6400, 7400);
    return (
      <>
        <Sky />
        <DriftingClouds idle={idle} />
        <CottageYard />
        <Cottage />
        <Place x={1250} y={GROUND_Y + 30} scale={CS} facing={-1}>
          <Cow
            pose={t > 2000 && t < 3400 ? 'moo' : t > 9000 ? 'graze' : 'idle'}
            idle={idle}
          />
        </Place>
        <Pop x={1080} y={620} t={t} at={2300}>
          Moo!
        </Pop>
        <Place x={760} y={GROUND_Y + 40} scale={MS} testId="mother">
          <Mother
            pose={t < 4500 ? 'idle' : 'basket'}
            idle={idle}
            mood={t > 6000 ? 'worried' : undefined}
          >
            {t >= 4500 && (
              <Basket upside={upside} crumbs={lin(t, 7400, 8600)} />
            )}
          </Mother>
        </Place>
        <Jack x={1000} y={GROUND_Y + 50} pose={t < 6400 ? 'idle' : 'sad'} />
      </>
    );
  },
};

/** 2 — Mother gives Jack the cow to trade for vegetables; they set off. */
const errand: SceneDef = {
  render: ({ t, idle }) => {
    const jackX = keys(t, [
      [7600, 1000],
      [9800, 1520],
      [11000, 1520],
      [14400, 2150],
    ]);
    const cowFacing = t < 10000 ? -1 : 1;
    const cowX = keys(t, [
      [11000, 1260],
      [14400, 1890],
    ]);
    const jackPose: JackPose =
      t < 4800
        ? 'curious'
        : t < 7600
          ? 'idle'
          : t < 9800
            ? 'walk'
            : t < 11000
              ? 'idle'
              : 'walk';
    const motherPose =
      t < 5000 ? 'talk' : t < 8000 ? 'point' : t < 11000 ? 'idle' : 'wave';
    const hand = jackHand(jackX, GROUND_Y + 50, JS, JACK_HAND_BACK);
    return (
      <>
        <Sky />
        <DriftingClouds idle={idle} />
        <CottageYard />
        <Cottage />
        <Place x={cowX} y={GROUND_Y + 30} scale={CS} facing={cowFacing}>
          <Cow
            pose={t > 10000 && t < 10900 ? 'moo' : t >= 11000 ? 'walk' : 'idle'}
            t={t}
            idle={idle}
          />
        </Place>
        <Pop x={cowX + 120} y={640} t={t} at={10100}>
          Moo!
        </Pop>
        <Place x={760} y={GROUND_Y + 40} scale={MS}>
          <Mother pose={motherPose} idle={idle} />
        </Place>
        <Jack
          x={jackX}
          y={GROUND_Y + 50}
          pose={jackPose}
          facing={t > 7600 && t < 9800 ? 1 : 1}
        />
        {t >= 9800 && (
          <Rope from={collar(cowX, GROUND_Y + 30, CS, cowFacing)} to={hand} />
        )}
      </>
    );
  },
};

/** 3 — The mysterious trader offers magic beans; the cow and beans change hands. */
const trade: SceneDef = {
  camera: ({ t }) => ({
    zoom: 1 + 0.1 * ease(t, 5000, 7000) * (1 - ease(t, 13000, 15000)),
    cx: 860,
    cy: 640,
  }),
  render: ({ t, idle }) => {
    const y = GROUND_Y + 40;
    const jackX = keys(t, [
      [0, -150],
      [3500, 640],
    ]);
    const traderX = keys(t, [
      [2500, 1380],
      [4800, 1080],
      [13500, 1080],
      [17400, 2200],
    ]);
    const traderFacing = t < 13500 ? -1 : 1;
    const cowX = keys(t, [
      [0, -470],
      [3500, 330],
      [11000, 330],
      [12800, 830],
      [13500, 830],
      [17400, 1950],
    ]);
    const cowWalking = t < 3500 || (t > 11000 && t < 12800) || t > 13500;
    // Rope: Jack's back hand → (hand-off) → trader's front hand.
    const jackBack = jackHand(jackX, y, JS, JACK_HAND_BACK);
    const traderArm = t < 13500 ? (t > 4800 && t < 11000 ? 78 : 42) : 22;
    const traderHand = handAt(
      traderX,
      y,
      0.86,
      TRADER_SHOULDER,
      1,
      traderArm,
      TRADER_ARM,
      traderFacing,
    );
    const handOff = ease(t, 11000, 12500);
    const ropeEnd = {
      x: lerp(jackBack.x, traderHand.x, handOff),
      y: lerp(jackBack.y, traderHand.y, handOff),
    };
    // Beans: in the trader's open hand, then they fly to Jack's front hand.
    const fly = lin(t, 12000, 13200);
    const jackFront = jackHand(jackX, y, JS, JACK_HAND_FRONT);
    const jackPose: JackPose =
      t < 3500 ? 'walk' : t < 9500 ? 'curious' : t < 13200 ? 'idle' : 'beans';
    const traderPose =
      t < 4800 ? 'walk' : t < 11000 ? 'offer' : t < 13500 ? 'hold' : 'walk';
    return (
      <>
        <Sky />
        <DriftingClouds idle={idle} />
        <MarketRoad />
        <Place x={cowX} y={y - 20} scale={CS * 0.96}>
          <Cow
            pose={t > 11100 && t < 11900 ? 'moo' : cowWalking ? 'walk' : 'idle'}
            t={t}
            idle={idle}
          />
        </Place>
        <Rope from={collar(cowX, y - 20, CS * 0.96, 1)} to={ropeEnd} />
        <Jack x={jackX} y={y} pose={jackPose} />
        <Place
          x={traderX}
          y={y}
          scale={0.86}
          facing={traderFacing}
          testId="trader"
        >
          <Trader
            pose={traderPose}
            t={t}
            idle={idle}
            beans={t > 4800 && t < 12000}
          />
        </Place>
        {fly > 0 && fly < 1 && (
          <g
            transform={`translate(${lerp(traderHand.x, jackFront.x, fly)} ${lerp(traderHand.y, jackFront.y, fly) - Math.sin(fly * Math.PI) * 160})`}
          >
            <MagicBeans />
          </g>
        )}
        <Sparkles
          x={t < 12000 ? traderHand.x : jackFront.x}
          y={t < 12000 ? traderHand.y : jackFront.y + 10}
          idle={idle}
          spread={70}
          count={9}
          color="#d8ffb0"
          amount={t > 4800 ? 1 : 0}
        />
      </>
    );
  },
};

/** 4 — Home with beans instead of food: Mother is upset and tosses them into the garden. */
const returnHome: SceneDef = {
  render: ({ t, idle }) => {
    const night = ease(t, 9500, 15500) * 0.9 + 0.1;
    const y = GROUND_Y + 50;
    const jackX = keys(t, [
      [0, 1950],
      [3000, 1100],
      [12500, 1100],
      [15000, 600],
    ]);
    const motherX = keys(t, [
      [1500, 530],
      [3200, 790],
      [11500, 790],
      [13000, 530],
    ]);
    const motherPose =
      t < 4200 ? 'happy' : t < 9000 ? 'upset' : t < 11000 ? 'talk' : 'sad';
    const toss = keys(t, [
      [9000, 20],
      [9700, 165],
      [10050, 60],
    ]);
    const handM = handAt(motherX, y - 10, MS, [44, -232], 1, toss, MOTHER_ARM);
    const garden = { x: 860, y: GROUND_Y + 10 };
    const fly = lin(t, 10050, 11200);
    const jackPose: JackPose =
      t < 3000 ? 'walk' : t < 5000 ? 'beans' : t < 12500 ? 'sad' : 'walk';
    return (
      <>
        <Sky k={night} sunset={0.4 * (1 - night)} />
        <CottageYard />
        <Cottage
          door={ease(t, 1300, 1900) * (1 - ease(t, 15000, 15600))}
          lit={ease(t, 12000, 14000)}
        />
        {t > 11200 && (
          <Sparkles
            x={garden.x}
            y={garden.y - 20}
            idle={idle}
            spread={50}
            count={6}
            color="#c8ff9a"
          />
        )}
        {t > 1500 && t < 13200 && (
          <Place x={motherX} y={y - 10} scale={MS} facing={t > 11500 ? -1 : 1}>
            <Mother
              pose={motherPose}
              idle={idle}
              armR={t >= 9000 && t < 10500 ? toss : undefined}
            >
              {t >= 5200 && t < 10050 && <MagicBeans />}
            </Mother>
          </Place>
        )}
        {fly > 0 && fly < 1 && (
          <g
            transform={`translate(${lerp(handM.x, garden.x, fly)} ${lerp(handM.y, garden.y, fly) - Math.sin(fly * Math.PI) * 220}) rotate(${fly * 720})`}
          >
            <MagicBeans />
          </g>
        )}
        <Dust
          x={garden.x}
          y={garden.y}
          t={t}
          at={11200}
          size={0.5}
          color="#8a5a3a"
        />
        <Jack x={jackX} y={y} pose={jackPose} facing={t > 12500 ? -1 : 1} />
      </>
    );
  },
};

/** 8 — The giant's castle: everything is enormous, and the Giant stomps in. */
const castle: SceneDef = {
  camera: ({ t }) => {
    const hits = [6400, 7700, 9000, 10300];
    const shake = hits.reduce(
      (s, h) => s + Math.max(0, 1 - Math.abs(t - h - 120) / 260),
      0,
    );
    return {
      zoom: lerp(1.12, 1, ease(t, 0, 5000)),
      cx: 700,
      cy: 700,
      shake: shake * 10,
    };
  },
  render: ({ t }) => {
    const F = 1000;
    const jackX = keys(t, [
      [0, 200],
      [5000, 700],
      [7300, 700],
      [8400, 520],
      [11800, 520],
      [12600, 400],
    ]);
    const jackPose: JackPose =
      t < 5000
        ? 'sneak'
        : t < 6200
          ? 'lookUp'
          : t < 7300
            ? 'scared'
            : t < 8400
              ? 'walk'
              : t < 11800
                ? 'scared'
                : 'curious';
    const legsX = keys(t, [
      [6000, 2400],
      [10500, 1450],
    ]);
    return (
      <>
        <CastleHall />
        <Place x={legsX} y={F} scale={0.78}>
          <GiantLegs t={t} walking={t > 6000 && t < 10500} />
        </Place>
        <Jack
          x={jackX}
          y={F}
          s={0.5}
          pose={jackPose}
          facing={t > 7300 && t < 8400 ? -1 : 1}
        />
        <GiantCup x={560} />
        {[6400, 7700, 9000, 10300].map((h) => (
          <Dust
            key={h}
            x={legsX + (h === 7700 || h === 10300 ? 150 : -150) * 0.78}
            y={F}
            t={t}
            at={h}
            size={1.2}
            color="#c9a88a"
          />
        ))}
        <Pop x={1500} y={520} t={t} at={6400} size={90}>
          Thump!
        </Pop>
        <Pop x={1300} y={480} t={t} at={9000} size={90}>
          Thump!
        </Pop>
      </>
    );
  },
};

const HEN_STOOL = { x: 975, y: 852 };
const GIANT = { x: 1430, y: 1000, s: 0.95 };

/** 9 — The golden hen lays a golden egg for the Giant. */
const hen: SceneDef = {
  camera: ({ t }) => ({
    zoom: 1 + 0.16 * ease(t, 4200, 6500) * (1 - ease(t, 11000, 13500)),
    cx: 1050,
    cy: 760,
  }),
  render: ({ t, idle }) => {
    const hold = handAt(GIANT.x, GIANT.y, GIANT.s, [-190, -640], -1, 70, 300);
    const hop = ease(t, 1400, 2600);
    const henPos = {
      x: lerp(hold.x, HEN_STOOL.x, hop),
      y: lerp(hold.y + 40, HEN_STOOL.y, hop) - Math.sin(hop * Math.PI) * 120,
    };
    const giantPose =
      t < 2600 ? 'reach' : t < 4600 ? 'talk' : t < 10000 ? 'laugh' : 'sit';
    const egg = ease(t, 5600, 6200);
    return (
      <>
        <CastleHall />
        <Place x={GIANT.x} y={GIANT.y} scale={GIANT.s} testId="giant">
          <Giant pose={giantPose} idle={idle} look={t > 2600 ? -0.6 : -1} />
        </Place>
        <Stool x={900} />
        {egg > 0 && (
          <g
            transform={`translate(${HEN_STOOL.x + 70} ${HEN_STOOL.y - 26 + (1 - egg) * -40}) scale(${egg})`}
          >
            <GoldenEgg />
          </g>
        )}
        <Place x={henPos.x} y={henPos.y} scale={1}>
          <Hen
            pose={
              t < 2600 ? 'flap' : t < 5600 ? 'sit' : t < 9600 ? 'idle' : 'peck'
            }
            idle={idle}
          />
        </Place>
        <Sparkles
          x={HEN_STOOL.x + 70}
          y={HEN_STOOL.y - 60}
          idle={idle}
          spread={80}
          count={10}
          amount={egg}
        />
        <Jack
          x={400}
          y={1000}
          s={0.5}
          pose={t > 6000 && t < 10000 ? 'surprised' : 'curious'}
        />
        <GiantCup x={560} />
        <Pop x={1300} y={300} t={t} at={3400} size={110} color="#ffe08a">
          Lay!
        </Pop>
      </>
    );
  },
};

/** 10 — The Giant falls asleep; Jack thinks of his hungry mother and takes the hen. */
const take: SceneDef = {
  render: ({ t, idle }) => {
    const F = 1000;
    const jackX = keys(t, [
      [3500, 400],
      [6500, 860],
      [8500, 860],
      [12800, 250],
    ]);
    const lift = ease(t, 7200, 8300);
    const carried = { x: jackX + 6, y: F - 100 };
    const henPos = {
      x: lerp(HEN_STOOL.x, carried.x, lift),
      y: lerp(HEN_STOOL.y, carried.y, lift) - Math.sin(lift * Math.PI) * 40,
    };
    const jackPose: JackPose =
      t < 3500 ? 'curious' : t < 6500 ? 'sneak' : t < 8500 ? 'lookUp' : 'sneak';
    return (
      <>
        <CastleHall />
        <Place x={GIANT.x} y={GIANT.y} scale={GIANT.s}>
          <Giant pose={t < 2600 ? 'yawn' : 'sleep'} idle={idle} />
        </Place>
        {t > 2600 && <Zzz x={1500} y={160} idle={idle} />}
        <Stool x={900} />
        <g transform={`translate(${HEN_STOOL.x + 70} ${HEN_STOOL.y - 26})`}>
          <GoldenEgg />
        </g>
        <Jack
          x={jackX}
          y={F}
          s={0.5}
          pose={jackPose}
          facing={t > 8500 ? -1 : 1}
        />
        <Place
          x={henPos.x}
          y={henPos.y}
          scale={lerp(1, 0.75, lift)}
          facing={t > 8500 ? -1 : 1}
        >
          <Hen
            pose={lift > 0 && lift < 1 ? 'flap' : lift >= 1 ? 'sit' : 'idle'}
            idle={idle}
          />
        </Place>
        <GiantCup x={560} />
        <ThoughtOfMother
          x={jackX - 40}
          y={700}
          show={ease(t, 4300, 5000) * (1 - ease(t, 7200, 7800))}
          idle={idle}
        />
      </>
    );
  },
};

/** 11 — The hen clucks, the Giant wakes, sees she is gone, and the chase begins. */
const chase: SceneDef = {
  camera: ({ t }) => {
    const hits = [9400, 10800, 12200];
    const shake = hits.reduce(
      (s, h) => s + Math.max(0, 1 - Math.abs(t - h - 120) / 260),
      0,
    );
    return { shake: shake * 12 + (t > 7300 && t < 8200 ? 6 : 0) };
  },
  render: ({ t, idle }) => {
    const F = 1000;
    const jackX = keys(t, [
      [0, 250],
      [1400, 210],
      [7000, 210],
      [8800, -160],
    ]);
    const rise = ease(t, 7000, 8400);
    const giantX = keys(t, [
      [8400, GIANT.x],
      [13000, 980],
    ]);
    const giantPose =
      t < 2000
        ? 'sleep'
        : t < 3500
          ? 'wake'
          : t < 5600
            ? 'look'
            : t < 7000
              ? 'wake'
              : t < 8600
                ? 'shout'
                : 'stand';
    const look = t >= 3500 && t < 5600 ? -0.5 : t >= 5600 ? -1 : 0;
    const jackPose: JackPose =
      t < 1400 ? 'sneak' : t < 7000 ? 'scared' : 'walk';
    return (
      <>
        <CastleHall />
        <Place x={giantX} y={GIANT.y} scale={GIANT.s}>
          <Giant pose={giantPose} idle={idle} look={look} rise={rise} />
        </Place>
        {t < 2000 && <Zzz x={1500} y={160} idle={idle} />}
        <Stool x={900} />
        <g transform={`translate(${HEN_STOOL.x + 70} ${HEN_STOOL.y - 26})`}>
          <GoldenEgg />
        </g>
        <Jack x={jackX} y={F} s={0.5} pose={jackPose} facing={-1} />
        <Place x={jackX - 6} y={F - 100} scale={0.75} facing={-1}>
          <Hen pose={t > 1300 && t < 3000 ? 'squawk' : 'carried'} idle={idle} />
        </Place>
        <Pop x={260} y={780} t={t} at={1400} size={70}>
          Cluck!
        </Pop>
        <Pop x={1440} y={150} t={t} at={4000} size={110} color="#ffe08a">
          ?!
        </Pop>
        <Pop x={1200} y={200} t={t} at={7300} size={110} color="#ffe08a">
          Hey!
        </Pop>
        {[9400, 10800, 12200].map((h) => (
          <Dust
            key={h}
            x={giantX}
            y={F}
            t={t}
            at={h}
            size={1.4}
            color="#c9a88a"
          />
        ))}
      </>
    );
  },
};

/** 12 — Down the swaying beanstalk, the Giant climbing after Jack and the hen. */
const escape: SceneDef = {
  render: ({ t, idle, outcome, open }) => {
    const answer = outcome('protect');
    const byChild = answer !== null && answer !== 'auto';
    const after = Math.max(0, t - 9000);
    const scroll = t * 0.55 + (answer ? after * 0.5 : 0);
    // Kept low in the frame so the invitation card never hides Jack or the boots.
    const jackY = keys(t, [
      [0, 760],
      [9000, 880],
      [12600, 1420],
    ]);
    // The Giant's boots climb down into view above Jack, closing in until the moment.
    const giantY = keys(t, [
      [0, 200],
      [9000, 520],
      [13000, byChild ? 380 : 640],
    ]);
    const sway =
      2.5 * wave(idle, 1600) +
      3 * Math.max(0, 1 - Math.abs(((t % 2400) - 300) / 400));
    const leaves = byChild ? ease(after, 0, 700) : 0;
    const jackPose: JackPose = open === 'protect' ? 'scared' : 'climb';
    return (
      <>
        <defs>
          <linearGradient id="sb-descent-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9a8cf0" />
            <stop offset="0.5" stopColor="#9fd0f5" />
            <stop offset="1" stopColor="#d6f0ff" />
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#sb-descent-sky)" />
        {/* Clouds rushing upward past the descent */}
        {Array.from({ length: 7 }, (_, i) => {
          const y =
            1300 -
            ((((scroll * (0.8 + hash(i) * 0.6) + i * 260) % 1700) + 1700) %
              1700);
          const x = 120 + hash(i + 3) * 1700;
          return (
            <g
              key={i}
              transform={`translate(${x} ${y}) scale(${0.9 + hash(i + 5)})`}
              fill="#fffaf0"
              opacity="0.9"
            >
              <ellipse rx="140" ry="40" />
              <ellipse cx="-50" cy="-24" rx="60" ry="40" />
              <ellipse cx="40" cy="-30" rx="70" ry="48" />
            </g>
          );
        })}
        <g transform={`rotate(${sway} 960 1300)`}>
          <StalkColumn x={940} scroll={-scroll} />
          <Place x={1060} y={giantY} scale={0.42} testId="giant">
            <GiantLegs t={t} walking />
          </Place>
          <Jack x={880} y={jackY} s={0.72} pose={jackPose} />
          <Place x={950} y={jackY - 120} scale={0.6}>
            <Hen pose="carried" idle={idle} />
          </Place>
          {leaves > 0 && (
            <g
              opacity={leaves * (1 - ease(after, 3600, 4200))}
              transform={`translate(900 ${jackY - 140})`}
            >
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <g
                  key={i}
                  transform={`rotate(${i * 60 + idle / 20}) translate(0 ${-170 * leaves}) rotate(90)`}
                >
                  <path
                    d="M0 0C40 -60 150 -50 170 0C120 30 40 30 0 0Z"
                    fill={i % 2 ? '#8ed97a' : '#6cc45f'}
                    stroke="#3f8a45"
                    strokeWidth="4"
                  />
                </g>
              ))}
              <circle r={200 * leaves} fill="#c8ff9a" opacity="0.18" />
            </g>
          )}
        </g>
        <Sparkles
          x={900}
          y={jackY - 160}
          idle={idle}
          spread={140}
          count={12}
          color="#d8ffb0"
          amount={leaves}
        />
      </>
    );
  },
};

/** 13 — Home again: Mother brings the axe, the Giant climbs back up, the beanstalk falls. */
const chop: SceneDef = {
  camera: ({ t }) => ({
    shake: Math.max(0, 1 - Math.abs(t - 13450) / 500) * 22,
  }),
  render: ({ t, idle }) => {
    const y = GROUND_Y + 50;
    const stalkX = 1300;
    const fall = clamp01((t - 11000) / 2500) ** 2; // gravity: slow start, fast finish
    const jackY = keys(t, [
      [0, -120],
      [1900, y],
    ]);
    const jackX = keys(t, [
      [1900, 1180],
      [4200, 1180],
      [5000, 1120],
    ]);
    const motherX = keys(t, [
      [2600, 530],
      [4400, 960],
      [13600, 960],
      [14600, 1020],
    ]);
    const chopping = t > 5000 && t < 10000;
    const swing = chopping
      ? keys(((t - 5000) % 900) + 5000, [
          [5000, -20],
          [5450, -110],
          [5600, 40],
          [5900, -20],
        ])
      : -20;
    const hits = [5600, 6500, 7400, 8300, 9200];
    const henX = keys(t, [
      [3400, jackX + 6],
      [4200, 1560],
    ]);
    const henY = keys(t, [
      [0, jackY - 100],
      [1900, y - 100],
      [3400, y - 100],
      [4200, y],
    ]);
    // The Giant's boots come down the stalk, then hurry back up when the chopping starts.
    const bootsY = keys(t, [
      [2500, -200],
      [5200, 170],
      [6400, 170],
      [9600, -600],
    ]);
    const jackPose: JackPose =
      t < 1900
        ? 'climb'
        : t < 3000
          ? 'scared'
          : t < 5000
            ? 'idle'
            : t < 10000
              ? 'curious'
              : t < 13600
                ? 'surprised'
                : 'celebrate';
    const motherPose =
      t < 2600 ? 'idle' : t < 4400 ? 'run' : t < 13600 ? 'worried' : 'hug';
    return (
      <>
        <Sky />
        <DriftingClouds idle={idle} />
        <CottageYard patch={false} />
        <Cottage door={ease(t, 2300, 2700)} />
        <g
          transform={`rotate(${fall * 84 + (t > 10000 && t < 11000 ? 1.5 * wave(idle, 140) : 0)} ${stalkX} ${GROUND_Y + 20})`}
        >
          <Place x={stalkX + 30} y={bootsY} scale={0.4} testId="giant">
            <GiantLegs t={t} walking={t > 2500 && t < 10000} />
          </Place>
          <StalkColumn
            x={stalkX}
            scroll={0}
            sway={t > 10000 && t < 11000 ? 1.5 * wave(idle, 160) : 0}
          />
        </g>
        <ellipse
          cx={stalkX + 40}
          cy={GROUND_Y + 30}
          rx="120"
          ry="24"
          fill="#5a3a26"
          opacity={fall > 0 ? 1 : 0}
        />
        <Dust
          x={1720}
          y={GROUND_Y + 40}
          t={t}
          at={13400}
          size={2.2}
          color="#e9dcc0"
        />
        {hits.map((h) => (
          <Dust
            key={h}
            x={stalkX - 30}
            y={GROUND_Y - 60}
            t={t}
            at={h}
            size={0.45}
            color="#8ed97a"
          />
        ))}
        <Place x={henX} y={henY} scale={0.7}>
          <Hen
            pose={
              t < 3400
                ? 'carried'
                : t < 4200
                  ? 'flap'
                  : t < 13600
                    ? 'idle'
                    : 'flap'
            }
            idle={idle}
          />
        </Place>
        {t > 2600 && (
          <Place x={motherX} y={y - 10} scale={MS}>
            <Mother pose={motherPose} t={t} idle={idle}>
              {t < 4400 && <Axe angle={-150} />}
            </Mother>
          </Place>
        )}
        <Jack
          x={jackX}
          y={jackY}
          pose={jackPose}
          rotate={chopping ? swing * 0.06 : 0}
        />
        {t >= 4400 && t < 10400 && (
          <g transform={`translate(${jackX + 50} ${jackY - 100})`}>
            <Axe angle={swing + 90} />
          </g>
        )}
        {hits.map((h) => (
          <Pop
            key={h}
            x={stalkX - 120}
            y={GROUND_Y - 330}
            t={t}
            at={h}
            dur={700}
            size={64}
          >
            Chop!
          </Pop>
        ))}
        <Pop
          x={1500}
          y={GROUND_Y - 300}
          t={t}
          at={13300}
          size={100}
          color="#ffe08a"
        >
          CRASH!
        </Pop>
      </>
    );
  },
};

/** 14 — Happily ever after: golden eggs, food on the table, sharing, and a lesson. */
const ending: SceneDef = {
  render: ({ t, idle }) => {
    const y = GROUND_Y + 50;
    const eggs = Math.min(
      4,
      Math.floor(lin(t, 2400, 9000) * 4) + (t > 2400 ? 1 : 0),
    );
    return (
      <>
        <Sky sunset={0.85} />
        <DriftingClouds idle={idle} />
        <CottageYard patch={false} />
        <Cottage door={1} lit={0.5} />
        {/* The garden is full of vegetables now */}
        {Array.from({ length: 8 }, (_, i) => (
          <g
            key={i}
            transform={`translate(${720 + i * 46} ${GROUND_Y + 6 + (i % 2) * 14})`}
          >
            <path
              d="M0 0q-14 -30 -4 -50M0 0q14 -30 4 -46"
              stroke="#4fa35a"
              strokeWidth="6"
              fill="none"
            />
            <ellipse
              cy="4"
              rx="16"
              ry="10"
              fill={i % 3 ? '#e8775f' : '#a86ad0'}
            />
          </g>
        ))}
        <VeggieBasket x={1100} y={y} />
        {Array.from({ length: eggs }, (_, i) => (
          <g key={i} transform={`translate(${1500 + i * 44} ${y - 24})`}>
            <GoldenEgg shine={0.6} />
          </g>
        ))}
        <Place x={1440} y={y} scale={0.9}>
          <Hen pose={t < 2400 ? 'sit' : 'peck'} idle={idle} />
        </Place>
        <Place x={820} y={y - 10} scale={MS}>
          <Mother pose={t < 6000 ? 'happy' : 'hug'} idle={idle} />
        </Place>
        <Jack x={960} y={y} pose={t < 6000 ? 'celebrate' : 'idle'} />
        <Sparkles x={1560} y={y - 60} idle={idle} spread={120} count={10} />
      </>
    );
  },
};

export const BEANSTALK_SCENES: Record<string, SceneDef> = {
  'jack-home': home,
  'jack-errand': errand,
  'jack-trade': trade,
  'jack-return': returnHome,
  'jack-castle': castle,
  'jack-hen': hen,
  'jack-take': take,
  'jack-chase': chase,
  'jack-escape': escape,
  'jack-chop': chop,
  'jack-ending': ending,
};
