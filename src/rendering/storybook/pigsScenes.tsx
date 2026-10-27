import { clamp01, ease, keys, lerp, lin, wave } from './clock';
import { Pig, Place } from './cast';
import type { PigPose, WolfPose } from './cast';
import { Load, P, W, WindowFaces, WS, Y } from './pigsProps';
import { LAST_BRICK } from './geometry';
import {
  BrickHouse,
  Countryside,
  Dust,
  Gust,
  MamaHouse,
  Pile,
  Pop,
  RainBarrel,
  Sparkles,
  StoneHouse,
  WarmSky,
  WheatHouse,
} from './sets';
import type { SceneDef } from './beanstalkScenes';

/**
 * The Three Little Pigs as ONE continuous story. The pigs travel left → right from
 * Mama Pig's house to the wheat, stone and brick houses; the Wolf lives in the
 * woods on the left and follows them. Every scene is a pure function of time.
 */

const HOUSE_X = 1080;
/** Where the Wolf's breath leaves his snout, relative to his feet (facing right). */
const snout = (x: number, y = Y) => ({ x: x + 124 * WS, y: y - 280 * WS });

/** Shuttle between a pile and a building site while `build` grows. */
function shuttle(
  t: number,
  a: number,
  b: number,
  from: number,
  to: number,
  period = 2200,
) {
  if (t < a || t > b)
    return { x: t < a ? from : to, carrying: false, facing: -1 as const };
  const p = ((t - a) % period) / period;
  const k = 0.5 - 0.5 * Math.cos(p * Math.PI * 2);
  return {
    x: lerp(to, from, k),
    carrying: p > 0.5,
    facing: (p > 0.5 ? -1 : 1) as 1 | -1,
  };
}
/** Huff-and-puff choreography: [inhale start, blow start, blow end]. */
function breath(t: number, inhaleAt: number, blowAt: number, endAt: number) {
  if (t >= inhaleAt && t < blowAt)
    return {
      pose: 'inhale' as const,
      puff: ease(t, inhaleAt, blowAt),
      gust: 0,
    };
  if (t >= blowAt && t < endAt)
    return {
      pose: 'blow' as const,
      puff: 1,
      gust: Math.min(1, (t - blowAt) / 250) * (1 - ease(t, endAt - 300, endAt)),
    };
  return null;
}
/* ================================================================ scenes */

/** 1 — Mama Pig says goodbye to her three little pigs. */
const intro: SceneDef = {
  camera: ({ t }) => ({
    zoom: lerp(1.1, 1, ease(t, 0, 6000)),
    cx: 760,
    cy: 640,
  }),
  render: ({ t, idle }) => {
    const walk = Math.max(0, t - 12500) * 0.32;
    const hop = (start: number): PigPose =>
      t >= start && t < start + 1000
        ? 'cheer'
        : t < 4500
          ? 'hug'
          : t > 12500
            ? 'walk'
            : t > 11300 && t < 12500
              ? 'scared'
              : 'idle';
    return (
      <>
        <WarmSky idle={idle} />
        <Countryside woods={false} />
        <MamaHouse x={420} />
        <Place x={420} y={Y - 10} scale={1.15}>
          <Pig
            id="mama"
            pose={
              t < 4500 ? 'hug' : t < 8500 ? 'idle' : t < 13000 ? 'talk' : 'wave'
            }
            idle={idle}
          />
        </Place>
        <P id="one" x={680 + walk} pose={hop(5000)} t={t} idle={idle} />
        <P id="two" x={850 + walk} pose={hop(6000)} t={t} idle={idle} />
        <P id="three" x={1020 + walk} pose={hop(7000)} t={t} idle={idle} />
        <Sparkles
          x={850 + walk}
          y={Y - 260}
          idle={idle}
          spread={260}
          count={8}
          amount={t > 4800 && t < 8200 ? 1 : 0}
        />
      </>
    );
  },
};

/** 2 — The first pig quickly builds a house of wheat; the others walk on. */
const wheat: SceneDef = {
  render: ({ t, idle }) => {
    const enter = (start: number, to: number) =>
      keys(t, [
        [0, start],
        [3000, to],
      ]);
    const build = lin(t, 4600, 10600);
    const work = shuttle(t, 4600, 10600, 1560, 800);
    const oneX =
      t < 4600
        ? enter(-260, 800)
        : t < 10600
          ? work.x
          : keys(t, [
              [13600, 800],
              [15200, 1050],
            ]);
    const onePose: PigPose =
      t < 3000
        ? 'walk'
        : t < 4600
          ? 'talk'
          : t < 10600
            ? 'walk'
            : t < 13000
              ? 'cheer'
              : t < 13600
                ? 'wave'
                : 'walk';
    const twoX = t < 13000 ? enter(-420, 420) : 420 + (t - 13000) * 0.6;
    const threeX = t < 13000 ? enter(-580, 260) : 260 + (t - 13000) * 0.6;
    const sibling: PigPose =
      t < 3000 ? 'walk' : t < 11000 ? 'idle' : t < 13000 ? 'wave' : 'walk';
    return (
      <>
        <WarmSky idle={idle} />
        <Countryside />
        {/* Swaying wheat field */}
        {Array.from({ length: 16 }, (_, i) => (
          <g
            key={i}
            transform={`translate(${1500 + i * 28} ${Y - 30}) rotate(${4 * wave(idle, 1800, i * 0.4)})`}
          >
            <path d="M0 0V-120" stroke="#d9b043" strokeWidth="5" />
            <ellipse cy="-128" rx="9" ry="20" fill="#f2cf63" />
          </g>
        ))}
        <Pile kind="wheat" x={1600} y={Y} amount={1 - build * 0.8} />
        <WheatHouse x={HOUSE_X} y={Y} build={build} idle={idle} />
        <P id="three" x={threeX} pose={sibling} t={t} idle={idle} />
        <P id="two" x={twoX} pose={sibling} t={t} idle={idle} />
        <P
          id="one"
          x={oneX}
          pose={onePose}
          t={t}
          idle={idle}
          facing={t >= 4600 && t < 10600 ? work.facing : 1}
          opacity={1 - ease(t, 14800, 15400)}
        />
        {work.carrying && <Load kind="wheat" x={oneX} y={Y - 270} />}
        <Pop x={800} y={Y - 320} t={t} at={11200} size={70}>
          All done!
        </Pop>
      </>
    );
  },
};

/** 3 — A hungry wolf creeps out of the woods to the wheat house. */
const wolfArrives: SceneDef = {
  camera: ({ t }) => ({
    zoom: 1 + 0.12 * ease(t, 6000, 8000),
    cx: 760,
    cy: 640,
  }),
  render: ({ t, idle }) => {
    const wolfX = keys(t, [
      [0, -320],
      [6000, 560],
      [8000, 660],
    ]);
    const wolfPose: WolfPose =
      t < 6000 ? 'sneak' : t < 8000 ? 'sniff' : t < 11500 ? 'talk' : 'grin';
    return (
      <>
        <WarmSky idle={idle} />
        <Countryside />
        <WheatHouse x={HOUSE_X} y={Y} idle={idle} />
        <P
          id="one"
          x={1120}
          y={Y - 4}
          s={0.85}
          pose={t < 8000 ? 'idle' : t < 11500 ? 'scared' : 'talk'}
          t={t}
          idle={idle}
          facing={-1}
        />
        <W x={wolfX} pose={wolfPose} t={t} idle={idle} />
        {t > 6000 && t < 8000 && (
          <g
            stroke="#ffffff"
            strokeWidth="4"
            fill="none"
            opacity="0.8"
            strokeLinecap="round"
          >
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M${wolfX + 140 + i * 14} ${Y - 300 - i * 16}q10 -8 0 -16`}
              />
            ))}
          </g>
        )}
      </>
    );
  },
};

/** 4 — Huff, puff… the wheat house blows apart and the first pig runs. */
const wheatBlow: SceneDef = {
  camera: ({ t }) => ({
    shake: Math.max(0, 1 - Math.abs(t - 9300) / 600) * 12,
  }),
  render: ({ t, idle }) => {
    const wolfX = keys(t, [
      [13400, 660],
      [16000, 1500],
    ]);
    const b = breath(t, 4000, 6000, 7500) ?? breath(t, 7600, 8800, 10800);
    const wolfPose: WolfPose =
      b?.pose ??
      (t < 4000
        ? 'talk'
        : t < 11500
          ? 'surprised'
          : t < 13400
            ? 'grin'
            : 'walk');
    const blow = ease(t, 9000, 11000);
    const shake = t > 6000 && t < 9000 ? 1 : 0;
    const pigX = keys(t, [
      [11500, 1120],
      [14000, 2150],
    ]);
    const from = snout(wolfX);
    return (
      <>
        <WarmSky idle={idle} />
        <Countryside />
        <WheatHouse x={HOUSE_X} y={Y} blow={blow} shake={shake} idle={idle} />
        <P
          id="one"
          x={pigX}
          y={Y - 4}
          s={0.85}
          pose={t < 11500 ? 'scared' : 'run'}
          t={t}
          idle={idle}
          facing={t < 11500 ? -1 : 1}
        />
        <W x={wolfX} pose={wolfPose} t={t} idle={idle} puff={b?.puff ?? 0} />
        <Gust
          x={from.x}
          y={from.y + 60}
          idle={idle}
          strength={b?.gust ?? 0}
          dir={1}
        />
        <Pop x={from.x + 60} y={from.y - 80} t={t} at={6000} size={70}>
          Huff!
        </Pop>
        <Pop x={from.x + 60} y={from.y - 80} t={t} at={8800} size={80}>
          Puff!
        </Pop>
        <Pop
          x={HOUSE_X + 120}
          y={Y - 430}
          t={t}
          at={9100}
          size={100}
          color="#ffe08a"
        >
          Whoosh!
        </Pop>
      </>
    );
  },
};

/** 5 — The second pig builds with stone but runs out before the door; her brother arrives. */
const stone: SceneDef = {
  render: ({ t, idle }) => {
    const build = keys(t, [
      [500, 0],
      [8200, 0.8],
      [10000, 0.8],
      [11400, 1],
    ]);
    const work = shuttle(t, 500, 8200, 1600, 840, 1500);
    const twoX =
      t < 8200
        ? work.x
        : keys(t, [
            [14600, 840],
            [16600, 1050],
          ]);
    const twoPose: PigPose =
      t < 8200
        ? 'walk'
        : t < 9800
          ? 'idle'
          : t < 11500
            ? 'build'
            : t < 14500
              ? 'scared'
              : 'walk';
    const oneX = keys(t, [
      [11500, -220],
      [14200, 700],
      [14800, 700],
      [16800, 1030],
    ]);
    const inside = 1 - ease(t, 16000, 17200);
    return (
      <>
        <WarmSky idle={idle} />
        <Countryside />
        <Pile
          kind="stone"
          x={1640}
          y={Y}
          amount={keys(t, [
            [500, 1],
            [8200, 0],
          ])}
        />
        <StoneHouse x={HOUSE_X + 60} y={Y} build={build} />
        <P
          id="two"
          x={twoX}
          pose={twoPose}
          t={t}
          idle={idle}
          facing={t < 8200 ? work.facing : 1}
          opacity={inside}
        />
        {work.carrying && <Load kind="stone" x={twoX} y={Y - 270} />}
        {t > 11500 && (
          <P
            id="one"
            x={oneX}
            pose={t < 14200 ? 'run' : t < 14800 ? 'scared' : 'walk'}
            t={t}
            idle={idle}
            opacity={inside}
          />
        )}
        {t > 9000 && t < 10000 && (
          <Pop x={1640} y={Y - 200} t={t} at={9000} size={70}>
            ?
          </Pop>
        )}
      </>
    );
  },
};

/** 6 — The wolf can't blow the stones down, so he blows through the doorway: the leafy roof flies off. */
const stoneAttack: SceneDef = {
  render: ({ t, idle }) => {
    const wolfX = keys(t, [
      [0, -320],
      [4500, 640],
      [9500, 640],
      [10200, 780],
      [17000, 780],
      [19000, 1300],
    ]);
    const b = breath(t, 4500, 6500, 8000) ?? breath(t, 9600, 11000, 13200);
    const wolfPose: WolfPose =
      b?.pose ??
      (t < 4500
        ? 'walk'
        : t < 9500
          ? 'frustrated'
          : t < 9600
            ? 'walk'
            : t < 15000
              ? 'surprised'
              : t < 17000
                ? 'frustrated'
                : 'walk');
    const roofOff = ease(t, 11400, 13600);
    const from = snout(wolfX);
    const escapeX = keys(t, [
      [13600, 1460],
      [17200, 2250],
    ]);
    return (
      <>
        <WarmSky idle={idle} />
        <Countryside />
        <StoneHouse x={HOUSE_X + 60} y={Y} roofOff={roofOff} />
        {/* Two pigs peeking from the open doorway until they slip out the back */}
        {t < 13600 && (
          <g opacity={1 - ease(t, 13200, 13600)}>
            <P
              id="one"
              x={1090}
              y={Y - 30}
              s={0.6}
              pose="scared"
              t={t}
              idle={idle}
            />
            <P
              id="two"
              x={1150}
              y={Y - 30}
              s={0.6}
              pose={t > 11000 ? 'scared' : 'idle'}
              t={t}
              idle={idle}
            />
          </g>
        )}
        {t > 13600 && (
          <>
            <P id="two" x={escapeX} pose="run" t={t} idle={idle} />
            <P id="one" x={escapeX - 150} pose="run" t={t} idle={idle} />
          </>
        )}
        <W x={wolfX} pose={wolfPose} t={t} idle={idle} puff={b?.puff ?? 0} />
        <Gust
          x={from.x}
          y={from.y + 80}
          idle={idle}
          strength={b?.gust ?? 0}
          dir={1}
          width={700}
        />
        {/* Leaves from the roof */}
        {roofOff > 0 && roofOff < 1 && (
          <g fill="#6cb663">
            {Array.from({ length: 10 }, (_, i) => (
              <ellipse
                key={i}
                cx={HOUSE_X + 60 + roofOff * (300 + i * 80)}
                cy={
                  Y - 420 - roofOff * (100 + i * 30) + roofOff * roofOff * 300
                }
                rx="18"
                ry="8"
                transform={`rotate(${roofOff * 720 + i * 40} ${HOUSE_X + 60 + roofOff * (300 + i * 80)} ${Y - 420})`}
              />
            ))}
          </g>
        )}
        <Pop x={1160} y={Y - 520} t={t} at={11600} size={90} color="#ffe08a">
          Whoosh!
        </Pop>
      </>
    );
  },
};

/** 7 — The third pig builds carefully with bricks (the child can lift the last one). */
const brick: SceneDef = {
  render: ({ t, idle, outcome }) => {
    const build = lin(t, 500, 9200);
    const answer = outcome('lastBrick');
    const byChild = answer !== null && answer !== 'auto';
    // The last brick flies from the pig's hands into the gap at the top of the wall.
    const fly = answer ? ease(t, 10000, 10900) : 0;
    const from = { x: 740, y: Y - 270 };
    const to = {
      x: HOUSE_X + LAST_BRICK.x + LAST_BRICK.w / 2,
      y: Y + LAST_BRICK.y + 30,
    };
    const pose: PigPose =
      t < 9200 ? 'build' : !answer || t < 10000 ? 'carry' : 'proud';
    return (
      <>
        <WarmSky idle={idle} />
        <Countryside />
        <Pile kind="brick" x={1580} y={Y} amount={1 - build * 0.7} />
        <BrickHouse
          x={HOUSE_X}
          y={Y}
          build={build}
          lastBrick={fly >= 1 ? 1 : 0}
          glow={
            byChild ? ease(t, 10600, 10900) * (1 - ease(t, 11400, 12600)) : 0
          }
        />
        <P id="three" x={740} pose={pose} t={t} idle={idle} tool={t < 9200} />
        {t >= 9200 && fly < 1 && (
          <Load
            kind="brick"
            x={lerp(from.x, to.x, fly)}
            y={lerp(from.y, to.y, fly) - Math.sin(fly * Math.PI) * 160}
          />
        )}
        <Sparkles
          x={to.x}
          y={to.y - 30}
          idle={idle}
          spread={90}
          count={10}
          amount={
            byChild ? ease(t, 10600, 10900) * (1 - ease(t, 11800, 12800)) : 0
          }
        />
        {t > 1000 && t < 9200 && (
          <Dust
            x={HOUSE_X - 140 + ((Math.floor(t / 520) * 97) % 400)}
            y={Y - 30 - Math.floor(build * 8) * 34}
            t={t % 520}
            at={0}
            size={0.25}
            color="#e8b8a0"
          />
        )}
      </>
    );
  },
};

/** 8 — The other two arrive; all three pigs go in and the strong door shuts. */
const reunite: SceneDef = {
  render: ({ t, idle }) => {
    const oneX = keys(t, [
      [0, -220],
      [3600, 720],
      [6000, 720],
      [7600, 1030],
    ]);
    const twoX = keys(t, [
      [0, -380],
      [3600, 880],
      [6400, 880],
      [8200, 1050],
    ]);
    const threeX = keys(t, [
      [6800, 1300],
      [9000, 1060],
    ]);
    const fade = (a: number) => 1 - ease(t, a, a + 600);
    return (
      <>
        <WarmSky idle={idle} />
        <Countryside />
        <BrickHouse x={HOUSE_X} y={Y} door={ease(t, 9600, 10200)} />
        <P
          id="three"
          x={threeX}
          pose={t < 3800 ? 'wave' : t < 6800 ? 'scared' : 'walk'}
          t={t}
          idle={idle}
          facing={-1}
          opacity={fade(8800)}
        />
        <P
          id="two"
          x={twoX}
          pose={t < 3600 ? 'run' : t < 6400 ? 'talk' : 'walk'}
          t={t}
          idle={idle}
          opacity={fade(8000)}
        />
        <P
          id="one"
          x={oneX}
          pose={t < 3600 ? 'run' : t < 6000 ? 'scared' : 'walk'}
          t={t}
          idle={idle}
          opacity={fade(7400)}
        />
        {t > 10400 && <WindowFaces x={HOUSE_X} idle={idle} mood="grin" />}
        <Pop
          x={HOUSE_X + 40}
          y={Y - 300}
          t={t}
          at={10100}
          size={90}
          color="#ffe08a"
        >
          Slam!
        </Pop>
      </>
    );
  },
};

/** 9 — The climax: the wolf blows and blows, and the brick house stands strong. */
const brickAttack: SceneDef = {
  camera: ({ t }) => ({
    zoom: 1 + 0.1 * ease(t, 12500, 15500) * (1 - ease(t, 18000, 19500)),
    cx: 900,
    cy: 600,
  }),
  render: ({ t, idle, outcome, open }) => {
    const wolfX = keys(t, [
      [0, -320],
      [3500, 560],
    ]);
    const answer = outcome('brace');
    const byChild = answer !== null && answer !== 'auto';
    const b =
      breath(t, 3500, 5000, 6500) ??
      breath(t, 7500, 9000, 11000) ??
      (open === 'brace' || (t >= 12500 && t < 15500)
        ? {
            pose: 'inhale' as const,
            puff: 0.4 + 0.9 * ease(t, 12500, 15500),
            gust: 0,
          }
        : null) ??
      breath(t, 15500, 15500, 18000);
    const wolfPose: WolfPose =
      b?.pose ??
      (t < 3500
        ? 'walk'
        : t < 7500
          ? 'surprised'
          : t < 12500
            ? 'frustrated'
            : 'frustrated');
    const strongest = t >= 15500 && t < 18000;
    const from = snout(wolfX);
    const shield = byChild
      ? ease(t, 15500, 15900) * (1 - ease(t, 18200, 19200))
      : 0;
    return (
      <>
        <WarmSky idle={idle} />
        <Countryside />
        <BrickHouse
          x={HOUSE_X}
          y={Y}
          door={1}
          glow={shield}
          wobble={strongest && !byChild ? 2 * wave(idle, 90) : 0}
        />
        <WindowFaces
          x={HOUSE_X}
          idle={idle}
          mood={t > 18000 ? 'grin' : 'worried'}
        />
        <W x={wolfX} pose={wolfPose} t={t} idle={idle} puff={b?.puff ?? 0} />
        <Gust
          x={from.x}
          y={from.y + 80}
          idle={idle}
          strength={(b?.gust ?? 0) * (strongest ? 1.4 : 1)}
          dir={1}
          width={strongest ? 1100 : 800}
        />
        <Sparkles
          x={HOUSE_X}
          y={Y - 300}
          idle={idle}
          spread={320}
          count={16}
          color="#cfefff"
          amount={shield}
        />
        <Pop x={from.x + 60} y={from.y - 80} t={t} at={5000} size={70}>
          Huff!
        </Pop>
        <Pop x={from.x + 60} y={from.y - 80} t={t} at={9000} size={80}>
          Puff!
        </Pop>
        <Pop
          x={from.x + 120}
          y={from.y - 110}
          t={t}
          at={15600}
          size={110}
          color="#ffe08a"
        >
          WHOOSH!
        </Pop>
        <Pop x={wolfX + 40} y={Y - 470} t={t} at={18200} size={70}>
          Grrr…
        </Pop>
      </>
    );
  },
};

const BARREL_X = 1460;
/** 10 — The wolf's last trick: down the chimney… but the lid is on. Splash! */
const chimney: SceneDef = {
  render: ({ t, idle }) => {
    // Up the leftover brick pile, along the roof to the chimney; slide down the far side.
    const path: [number, number, number][] = [
      [2500, 560, Y],
      [3300, 700, Y - 90],
      [4300, 790, Y - 350],
      [7000, 1080, Y - 520],
      [9800, 1080, Y - 520],
      [11300, 1360, Y - 340],
      [12000, BARREL_X, Y],
    ];
    const wx = keys(
      t,
      path.map(([ms, x]) => [ms, x] as const),
    );
    const wy = keys(
      t,
      path.map(([ms, , y]) => [ms, y] as const),
    );
    const onRoof = t > 4300 && t < 7000;
    const sliding = t > 9800 && t < 12000;
    const wolfPose: WolfPose =
      t < 2500
        ? 'grin'
        : t < 7000
          ? 'climb'
          : t < 8800
            ? 'sneak'
            : t < 9800
              ? 'surprised'
              : t < 12000
                ? 'slip'
                : 'wet';
    const rotate = onRoof ? -32 : sliding ? 30 + 20 * wave(idle, 180) : 0;
    const splash = lin(t, 12000, 13200);
    return (
      <>
        <WarmSky idle={idle} />
        <Countryside />
        <Pile kind="brick" x={700} y={Y} amount={0.6} />
        <BrickHouse x={HOUSE_X} y={Y} door={1} lid={ease(t, 7800, 8400)} />
        <WindowFaces
          x={HOUSE_X}
          idle={idle}
          mood={t < 7000 ? 'worried' : 'grin'}
        />
        <W
          x={wx}
          y={t >= 12000 ? Y + 40 : wy}
          pose={wolfPose}
          t={t}
          idle={idle}
          rotate={rotate}
        />
        <RainBarrel x={BARREL_X} y={Y} splash={splash} />
        {t > 12000 &&
          [0, 1, 2].map((i) => {
            const p = (((idle / 900 + i / 3) % 1) + 1) % 1;
            return (
              <ellipse
                key={i}
                cx={BARREL_X - 30 + i * 30}
                cy={Y - 300 + p * 120}
                rx="5"
                ry="8"
                fill="#9fdcff"
                opacity={1 - p}
              />
            );
          })}
        <Pop x={560} y={Y - 470} t={t} at={600} size={90} color="#ffe08a">
          !
        </Pop>
        <Pop x={1160} y={Y - 640} t={t} at={9200} size={80}>
          Bonk!
        </Pop>
        <Pop
          x={BARREL_X}
          y={Y - 330}
          t={t}
          at={12000}
          size={100}
          color="#9fdcff"
        >
          Splash!
        </Pop>
      </>
    );
  },
};

/** 11 — The dripping wolf runs off into the woods for good; the pigs come out. */
const retreat: SceneDef = {
  render: ({ t, idle }) => {
    const wx = keys(t, [
      [1200, BARREL_X],
      [1800, BARREL_X - 140],
      [6400, -380],
    ]);
    const wy = keys(t, [
      [0, Y + 40],
      [1200, Y + 40],
      [1500, Y - 120],
      [1800, Y],
    ]);
    const out = ease(t, 6400, 8400);
    return (
      <>
        <WarmSky idle={idle} />
        <Countryside />
        <BrickHouse x={HOUSE_X} y={Y} door={1 - ease(t, 5800, 6300)} lid={1} />
        {t < 6000 && <WindowFaces x={HOUSE_X} idle={idle} mood="grin" />}
        <W
          x={wx}
          y={wy}
          pose={t < 1800 ? 'wet' : 'run'}
          t={t}
          idle={idle}
          facing={-1}
        />
        <RainBarrel x={BARREL_X} y={Y} />
        {t > 1800 &&
          [0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              cx={wx + 30 + i * 50}
              cy={Y - 10}
              r={6}
              fill="#9fdcff"
              opacity={clamp01(1 - i * 0.25)}
            />
          ))}
        {out > 0 && (
          <>
            <P
              id="one"
              x={lerp(1050, 820, out)}
              pose="cheer"
              t={t}
              idle={idle}
              opacity={out}
            />
            <P
              id="two"
              x={lerp(1050, 1000, out)}
              pose="cheer"
              t={t}
              idle={idle}
              opacity={out}
            />
            <P
              id="three"
              x={lerp(1050, 1260, out)}
              pose="cheer"
              t={t}
              idle={idle}
              opacity={out}
            />
          </>
        )}
      </>
    );
  },
};

/** 12 — All three pigs together and safe; the lesson. */
const ending: SceneDef = {
  render: ({ t, idle }) => {
    const evening = 0.2 + 0.6 * ease(t, 0, 16000);
    return (
      <>
        <WarmSky idle={idle} evening={evening} />
        <Countryside />
        <BrickHouse x={HOUSE_X + 120} y={Y - 30} door={0} lid={1} />
        {(['one', 'two', 'three'] as const).map((id, i) => (
          <P
            key={id}
            id={id}
            x={560 + i * 200 + 24 * wave(idle, 1800, i * 2)}
            pose="cheer"
            t={t}
            idle={idle + i * 200}
          />
        ))}
        <Sparkles x={760} y={Y - 280} idle={idle} spread={320} count={18} />
      </>
    );
  },
};

export const PIGS_SCENES: Record<string, SceneDef> = {
  'pigs-intro': intro,
  'pigs-wheat': wheat,
  'pigs-wolf': wolfArrives,
  'pigs-wheat-blow': wheatBlow,
  'pigs-stone': stone,
  'pigs-stone-attack': stoneAttack,
  'pigs-brick': brick,
  'pigs-reunite': reunite,
  'pigs-brick-attack': brickAttack,
  'pigs-chimney': chimney,
  'pigs-retreat': retreat,
  'pigs-ending': ending,
};
