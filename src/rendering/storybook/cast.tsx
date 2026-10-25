import type { ReactNode } from 'react';
import { Jack } from '../beanstalk/Jack';
import { wave } from './clock';
import {
  armRotation,
  MOTHER_ARM,
  MOTHER_SHOULDER,
  TRADER_ARM,
  TRADER_SHOULDER,
} from './geometry';
import type { Side } from './geometry';

/**
 * Original vector characters for the storybook scenes, drawn in the same soft,
 * rounded style as Jack, Tortoise and Hare. Every character has its feet at (0, 0)
 * and is posed by props: arm angles, mood, and two clocks — `t` (story time, for
 * walk cycles that only run while the story moves) and `idle` (keeps running while
 * the story waits, for breathing, blinking and wagging).
 *
 * Arm angles are "outward" degrees: 0 hangs down, 90 points sideways, 180 is up.
 */


function Arm({
  x,
  y,
  side,
  deg,
  len,
  width,
  color,
  skin,
  children,
}: {
  x: number;
  y: number;
  side: Side;
  deg: number;
  len: number;
  width: number;
  color: string;
  skin: string;
  children?: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${armRotation(side, deg)})`}>
      <rect x={-width / 2} y={-width / 3} width={width} height={len} rx={width / 2} fill={color} />
      <circle cy={len} r={width * 0.55} fill={skin} />
      {children && <g transform={`translate(0 ${len})`}>{children}</g>}
    </g>
  );
}

/** A character wrapper: position, scale and facing, with the feet as pivot. */
export function Place({
  x,
  y,
  scale = 1,
  facing = 1,
  rotate = 0,
  opacity = 1,
  children,
  className,
  testId,
}: {
  x: number;
  y: number;
  scale?: number;
  facing?: Side;
  rotate?: number;
  opacity?: number;
  children: ReactNode;
  className?: string;
  testId?: string;
}) {
  return (
    <g
      className={className}
      data-testid={testId}
      opacity={opacity}
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rotate.toFixed(2)}) scale(${(scale * facing).toFixed(3)} ${scale.toFixed(3)})`}
    >
      {children}
    </g>
  );
}

export type Mood = 'smile' | 'talk' | 'frown' | 'sad' | 'grin' | 'o' | 'worried' | 'sleep' | 'sly';

function Eyes({
  cx,
  cy,
  gap,
  r,
  mood,
  look = 0,
  color = '#2b2117',
}: {
  cx: number;
  cy: number;
  gap: number;
  r: number;
  mood: Mood;
  look?: number;
  color?: string;
}) {
  if (mood === 'sleep')
    return (
      <g stroke={color} strokeWidth={r * 0.55} fill="none" strokeLinecap="round">
        <path d={`M${cx - gap - r} ${cy}q${r} ${r * 0.8} ${r * 2} 0`} />
        <path d={`M${cx + gap - r} ${cy}q${r} ${r * 0.8} ${r * 2} 0`} />
      </g>
    );
  const big = mood === 'o' || mood === 'worried' ? 1.25 : 1;
  return (
    <g className="sb-blink">
      {[-1, 1].map((s) => (
        <g key={s}>
          <ellipse cx={cx + s * gap} cy={cy} rx={r * big} ry={r * 1.2 * big} fill="#fff" />
          <circle cx={cx + s * gap + look * r * 0.45} cy={cy + r * 0.1} r={r * 0.68} fill={color} />
          <circle cx={cx + s * gap + look * r * 0.45 + r * 0.25} cy={cy - r * 0.25} r={r * 0.24} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

function Mouth({ x, y, w, mood, idle, color = '#6a3a1e' }: { x: number; y: number; w: number; mood: Mood; idle: number; color?: string }) {
  const sw = Math.max(3, w * 0.22);
  switch (mood) {
    case 'talk': {
      const open = 0.35 + 0.65 * Math.abs(wave(idle, 360));
      return <ellipse cx={x} cy={y + w * 0.1} rx={w * 0.55} ry={w * 0.45 * open} fill="#7a3b3b" />;
    }
    case 'o':
      return <ellipse cx={x} cy={y + w * 0.15} rx={w * 0.42} ry={w * 0.55} fill="#7a3b3b" />;
    case 'grin':
      return <path d={`M${x - w} ${y - w * 0.2}Q${x} ${y + w * 1.3} ${x + w} ${y - w * 0.2}Z`} fill="#7a3b3b" stroke={color} strokeWidth={sw * 0.6} strokeLinejoin="round" />;
    case 'frown':
    case 'sad':
      return <path d={`M${x - w * 0.8} ${y + w * 0.4}Q${x} ${y - w * 0.4} ${x + w * 0.8} ${y + w * 0.4}`} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" />;
    case 'worried':
      return <path d={`M${x - w * 0.7} ${y + w * 0.3}q${w * 0.35} -${w * 0.35} ${w * 0.7} 0t${w * 0.7} 0`} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" />;
    case 'sleep':
      return <ellipse cx={x} cy={y + w * 0.2} rx={w * 0.25} ry={w * 0.2 * (1 + 0.5 * wave(idle, 2400))} fill="#7a3b3b" />;
    case 'sly':
      return <path d={`M${x - w * 0.8} ${y}Q${x + w * 0.1} ${y + w * 0.8} ${x + w * 1.1} ${y - w * 0.4}`} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" />;
    default:
      return <path d={`M${x - w * 0.8} ${y}Q${x} ${y + w * 0.9} ${x + w * 0.8} ${y}`} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" />;
  }
}

function Brows({ cx, cy, gap, w, mood, color }: { cx: number; cy: number; gap: number; w: number; mood: Mood; color: string }) {
  const tilt = mood === 'frown' ? 1 : mood === 'sad' || mood === 'worried' ? -1 : mood === 'o' ? -0.2 : 0;
  const lift = mood === 'o' || mood === 'worried' ? -w * 0.35 : 0;
  return (
    <g stroke={color} strokeWidth={w * 0.28} strokeLinecap="round" fill="none">
      {[-1, 1].map((s) => (
        <path
          key={s}
          d={`M${cx + s * gap - w / 2} ${cy + lift + (s < 0 ? -tilt : tilt) * -w * 0.25}L${cx + s * gap + w / 2} ${cy + lift + (s < 0 ? tilt : -tilt) * -w * 0.25}`}
        />
      ))}
    </g>
  );
}

const breathe = (idle: number, amount = 0.012, period = 3000) =>
  `scale(1 ${(1 + amount * wave(idle, period)).toFixed(4)})`;

/* ------------------------------------------------------------------ Jack */

export type JackPose =
  | 'idle'
  | 'walk'
  | 'run'
  | 'curious'
  | 'beans'
  | 'surprised'
  | 'lookUp'
  | 'climb'
  | 'scared'
  | 'sneak'
  | 'celebrate'
  | 'sad';

/** Jack (the shared beanstalk rig), animated by beanstalk.css state classes. */
export function JackActor({ pose }: { pose: JackPose }) {
  // 'sad' reuses the worried face without the shiver.
  const cls = pose === 'sad' ? 'idle is-sad' : pose;
  return (
    <g className={`jack is-${cls}`} data-testid="sb-jack" data-pose={pose}>
      <Jack asGroup />
    </g>
  );
}

/* ---------------------------------------------------------------- Mother */

export type MotherPose = 'idle' | 'talk' | 'point' | 'upset' | 'sad' | 'happy' | 'hug' | 'wave' | 'basket' | 'worried' | 'run';
export function Mother({
  pose = 'idle',
  idle = 0,
  t = 0,
  armL,
  armR,
  mood,
  children,
}: {
  pose?: MotherPose;
  idle?: number;
  t?: number;
  armL?: number;
  armR?: number;
  mood?: Mood;
  /** Drawn in the right (front) hand. */
  children?: ReactNode;
}) {
  const w = wave(idle, 900);
  const arms: Record<MotherPose, [number, number]> = {
    idle: [8, 8],
    talk: [12, 30 + 12 * w],
    point: [10, 92],
    upset: [150 + 8 * w, 150 - 8 * w],
    sad: [4, 4],
    happy: [140 + 10 * w, 140 - 10 * w],
    hug: [62, 62],
    wave: [10, 150 + 22 * wave(idle, 520)],
    basket: [38, 38],
    worried: [40, 40],
    run: [30 + 25 * wave(t, 420), 30 - 25 * wave(t, 420)],
  };
  const moods: Record<MotherPose, Mood> = {
    idle: 'smile',
    talk: 'talk',
    point: 'talk',
    upset: 'frown',
    sad: 'sad',
    happy: 'grin',
    hug: 'grin',
    wave: 'smile',
    basket: 'worried',
    worried: 'worried',
    run: 'o',
  };
  const [l, r] = arms[pose];
  const face = mood ?? moods[pose];
  const headTilt = pose === 'sad' ? 8 : pose === 'upset' ? -4 * w : 0;
  const bob = pose === 'run' ? Math.abs(wave(t, 420)) * -10 : 0;
  return (
    <g transform={`translate(0 ${bob})`} data-testid="sb-mother" data-pose={pose}>
      <ellipse cy="4" rx="70" ry="12" fill="#1d1408" opacity="0.2" />
      <g transform={breathe(idle)}>
        <ellipse cx="-24" cy="-8" rx="22" ry="11" fill="#5a3a26" />
        <ellipse cx="24" cy="-8" rx="22" ry="11" fill="#5a3a26" />
        <Arm x={-MOTHER_SHOULDER[0]} y={MOTHER_SHOULDER[1]} side={-1} deg={armL ?? l} len={MOTHER_ARM} width={26} color="#7a5fa6" skin="#f3c29e" />
        <path d="M-44 -238Q-56 -150 -84 -14H84Q56 -150 44 -238Q22 -250 0 -250Q-22 -250 -44 -238Z" fill="#8e6bbf" />
        <path d="M-40 -170Q-50 -90 -60 -24H60Q50 -90 40 -170Z" fill="#f3e6c8" />
        <path d="M-40 -170H40" stroke="#d9c49a" strokeWidth="6" />
        <rect x="18" y="-120" width="26" height="22" rx="4" fill="#c99a6a" opacity="0.9" />
        <path d="M18 -120l26 22M44 -120l-26 22" stroke="#8a5a34" strokeWidth="2" opacity="0.6" />
        <Arm x={MOTHER_SHOULDER[0]} y={MOTHER_SHOULDER[1]} side={1} deg={armR ?? r} len={MOTHER_ARM} width={26} color="#8e6bbf" skin="#f3c29e">
          {children}
        </Arm>
        <g transform={`rotate(${headTilt} 0 -250)`}>
          <rect x="-11" y="-262" width="22" height="18" fill="#e9b08a" />
          <circle cx="0" cy="-296" r="46" fill="#f6cba6" />
          <path d="M-48 -300Q-52 -352 0 -354Q52 -352 48 -300Q40 -330 0 -332Q-40 -330 -48 -300Z" fill="#9a7a62" />
          <circle cx="0" cy="-352" r="20" fill="#9a7a62" />
          <path d="M-50 -310Q-46 -360 0 -362Q46 -360 50 -310L44 -318Q0 -300 -44 -318Z" fill="#d9776a" />
          <path d="M44 -318q20 6 22 26q-12 -6 -22 -10Z" fill="#c4615a" />
          <Brows cx={0} cy={-312} gap={17} w={16} mood={face} color="#7a5a44" />
          <Eyes cx={0} cy={-296} gap={17} r={7} mood={face} />
          <ellipse cx="-28" cy="-276" rx="9" ry="5" fill="#f29b9b" opacity="0.5" />
          <ellipse cx="28" cy="-276" rx="9" ry="5" fill="#f29b9b" opacity="0.5" />
          <Mouth x={0} y={-268} w={11} mood={face} idle={idle} />
        </g>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------- Cow */

export type CowPose = 'idle' | 'walk' | 'moo' | 'graze';
export function Cow({ pose = 'idle', t = 0, idle = 0 }: { pose?: CowPose; t?: number; idle?: number }) {
  const step = pose === 'walk' ? wave(t, 700) : 0;
  const legs: [number, number][] = [
    [-118, step * 18],
    [-86, -step * 18],
    [92, -step * 18],
    [124, step * 18],
  ];
  const head = pose === 'moo' ? -22 : pose === 'graze' ? 26 : 3 * wave(idle, 2600);
  const bob = pose === 'walk' ? Math.abs(step) * -6 : 0;
  return (
    <g data-testid="sb-cow" data-pose={pose}>
      <ellipse cy="4" rx="170" ry="14" fill="#1d1408" opacity="0.2" />
      <g transform={`translate(0 ${bob})`}>
        {legs.map(([x, a], i) => (
          <g key={i} transform={`translate(${x} -112) rotate(${a})`}>
            <rect x="-13" y="0" width="26" height="104" rx="11" fill={i % 2 ? '#efe6da' : '#f8f1e6'} />
            <rect x="-14" y="90" width="28" height="20" rx="6" fill="#4a3528" />
          </g>
        ))}
        <g transform={`rotate(${14 * wave(idle, 1600)} -158 -196)`}>
          <path d="M-158 -196Q-196 -150 -186 -96" stroke="#e8ddd0" strokeWidth="9" fill="none" strokeLinecap="round" />
          <ellipse cx="-186" cy="-92" rx="12" ry="18" fill="#6a4a36" />
        </g>
        <ellipse cx="0" cy="-168" rx="168" ry="78" fill="#fbf7f0" />
        <path d="M-120 -230Q-60 -246 -40 -200Q-70 -160 -130 -180Z" fill="#7a5038" />
        <path d="M30 -238Q90 -242 96 -196Q60 -176 24 -196Z" fill="#7a5038" />
        <ellipse cx="-70" cy="-120" rx="40" ry="22" fill="#7a5038" />
        <ellipse cx="-30" cy="-96" rx="28" ry="16" fill="#f5b5bd" />
        <g transform={`rotate(${head} 150 -200)`}>
          <path d="M140 -214Q160 -190 150 -150" stroke="#c94c3c" strokeWidth="10" fill="none" />
          <circle cx="152" cy="-148" r="13" fill="#e8c35a" stroke="#a8812a" strokeWidth="3" />
          <ellipse cx="200" cy="-214" rx="58" ry="46" fill="#fbf7f0" />
          <path d="M168 -254Q200 -266 226 -248Q210 -230 180 -236Z" fill="#7a5038" />
          <path d="M176 -252q-8 -26 6 -34M224 -252q10 -26 -4 -34" stroke="#f3e2b8" strokeWidth="9" fill="none" strokeLinecap="round" />
          <ellipse cx="158" cy="-236" rx="22" ry="11" fill="#efe1d2" transform="rotate(-30 158 -236)" />
          <ellipse cx="236" cy="-196" rx="34" ry="26" fill="#f5b5bd" />
          <ellipse cx="228" cy="-198" rx="4" ry="6" fill="#8a4a5a" />
          <ellipse cx="246" cy="-196" rx="4" ry="6" fill="#8a4a5a" />
          <g className="sb-blink">
            <ellipse cx="206" cy="-230" rx="8" ry="10" fill="#2b2117" />
            <circle cx="209" cy="-233" r="3" fill="#fff" />
          </g>
          {pose === 'moo' && <ellipse cx="236" cy="-176" rx="16" ry="11" fill="#7a3b3b" />}
        </g>
      </g>
    </g>
  );
}

/* ---------------------------------------------------------------- Trader */

export type TraderPose = 'idle' | 'offer' | 'hold' | 'walk' | 'wave';
export function Trader({
  pose = 'idle',
  idle = 0,
  t = 0,
  beans = false,
  mood,
}: {
  pose?: TraderPose;
  idle?: number;
  t?: number;
  /** Glowing beans in the open front hand. */
  beans?: boolean;
  mood?: Mood;
}) {
  const w = wave(idle, 1400);
  const arms: Record<TraderPose, [number, number]> = {
    idle: [14, 18],
    offer: [16, 78 + 4 * w],
    hold: [16, 42],
    walk: [18 + 10 * wave(t, 600), 22 - 10 * wave(t, 600)],
    wave: [14, 150 + 20 * wave(idle, 500)],
  };
  const [l, r] = arms[pose];
  const face: Mood = mood ?? (pose === 'offer' ? 'sly' : 'smile');
  return (
    <g data-testid="sb-trader" data-pose={pose} transform={pose === 'walk' ? `translate(0 ${Math.abs(wave(t, 600)) * -6})` : undefined}>
      <ellipse cy="4" rx="72" ry="12" fill="#1d1408" opacity="0.22" />
      <g transform={breathe(idle, 0.01, 3600)}>
        <Arm x={-TRADER_SHOULDER[0]} y={TRADER_SHOULDER[1]} side={-1} deg={l} len={TRADER_ARM} width={34} color="#3c2d63" skin="#d9a982" />
        <path d="M-50 -250Q-70 -140 -92 -4H92Q70 -140 50 -250Q0 -276 -50 -250Z" fill="#4b3a78" />
        <path d="M-6 -250L-30 -4H30L6 -250Z" fill="#3c2d63" />
        {[
          [-50, -120],
          [40, -70],
          [-20, -40],
          [56, -170],
        ].map(([x, y], i) => (
          <path key={i} transform={`translate(${x} ${y}) scale(0.5)`} d="M0 -12l3.5 8.5 8.5 3.5-8.5 3.5-3.5 8.5-3.5-8.5-8.5-3.5 8.5-3.5z" fill="#ffd36e" opacity="0.8" />
        ))}
        <path d="M-46 -150H46" stroke="#c9a26a" strokeWidth="8" />
        <ellipse cx="-30" cy="-136" rx="16" ry="20" fill="#8a5a34" />
        <Arm x={TRADER_SHOULDER[0]} y={TRADER_SHOULDER[1]} side={1} deg={r} len={TRADER_ARM} width={34} color="#4b3a78" skin="#d9a982">
          {beans && (
            <g transform={`rotate(${-armRotation(1, r)})`}>
              <circle className="sb-glow" r="30" fill="#c8ff9a" opacity="0.5" />
              <MagicBeans />
            </g>
          )}
        </Arm>
        <path d="M-56 -260Q-60 -350 0 -356Q60 -350 56 -260Q40 -246 0 -246Q-40 -246 -56 -260Z" fill="#4b3a78" />
        <circle cx="0" cy="-296" r="38" fill="#e2b48f" />
        <path d="M-40 -302Q-40 -348 0 -348Q40 -348 40 -302Q30 -326 0 -328Q-30 -326 -40 -302Z" fill="#3c2d63" />
        <path d="M-30 -282Q-34 -220 0 -196Q34 -220 30 -282Q14 -270 0 -272Q-14 -270 -30 -282Z" fill="#eceff4" />
        <Brows cx={0} cy={-312} gap={15} w={14} mood={face} color="#d8dde6" />
        <Eyes cx={0} cy={-298} gap={15} r={6} mood={face} />
        <ellipse cx="0" cy="-286" rx="7" ry="9" fill="#cf9470" />
        <Mouth x={0} y={-270} w={9} mood={face} idle={idle} color="#7a5a5a" />
      </g>
    </g>
  );
}

/** Five glowing magic beans, centered on the origin. */
export function MagicBeans({ glow = 1 }: { glow?: number }) {
  return (
    <g data-testid="sb-beans">
      <circle r="22" fill="#c8ff9a" opacity={0.35 * glow} />
      {[
        [-12, -2],
        [0, 6],
        [12, -3],
        [-5, -12],
        [7, -14],
      ].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="6" ry="8" fill={i % 2 ? '#8ef06a' : '#5fd24a'} stroke="#2f8f3a" strokeWidth="1.5" />
      ))}
    </g>
  );
}

/* ----------------------------------------------------------------- Giant */

export type GiantPose = 'sit' | 'talk' | 'yawn' | 'sleep' | 'wake' | 'look' | 'stand' | 'reach' | 'shout' | 'laugh';
export function Giant({
  pose = 'sit',
  idle = 0,
  look = 0,
  rise = 0,
}: {
  pose?: GiantPose;
  idle?: number;
  /** -1 looks left, 1 looks right. */
  look?: number;
  /** 0 seated → 1 standing up (body rises off the chair). */
  rise?: number;
}) {
  const w = wave(idle, 1800);
  const arms: Record<GiantPose, [number, number]> = {
    sit: [22, 22],
    talk: [24, 60 + 10 * w],
    yawn: [160, 160],
    sleep: [16, 16],
    wake: [70, 70],
    look: [30, 30],
    stand: [40 + 10 * w, 40 - 10 * w],
    reach: [96, 20],
    shout: [120, 120],
    laugh: [30, 30],
  };
  const moods: Record<GiantPose, Mood> = {
    sit: 'smile',
    talk: 'talk',
    yawn: 'o',
    sleep: 'sleep',
    wake: 'o',
    look: 'worried',
    stand: 'frown',
    reach: 'talk',
    shout: 'talk',
    laugh: 'grin',
  };
  const [l, r] = arms[pose];
  const face = moods[pose];
  const nod = pose === 'sleep' ? 12 + 2 * w : 0;
  const lift = -rise * 230;
  return (
    <g data-testid="sb-giant" data-pose={pose}>
      <ellipse cy="10" rx="360" ry="34" fill="#1d1408" opacity="0.25" />
      {[-1, 1].map((s) => (
        <g key={s}>
          <rect x={s * 130 - 60} y={-330 + lift * 0.4} width="120" height={320 - lift * 0.4} rx="40" fill="#46587e" />
          <g transform={`translate(${s * 130} 0) scale(${s} 1)`}>
            <path d="M-80 -10Q-84 -96 0 -96Q150 -96 160 -10Z" fill="#6a4428" />
            <rect x="-84" y="-16" width="250" height="18" rx="9" fill="#4a2f1c" />
          </g>
        </g>
      ))}
      <g transform={`translate(0 ${lift}) ${breathe(idle, pose === 'sleep' ? 0.03 : 0.015, pose === 'sleep' ? 3400 : 2800)}`}>
        <path d="M-220 -330Q-250 -380 -240 -620Q-200 -690 0 -700Q200 -690 240 -620Q250 -380 220 -330Z" fill="#6d8f5a" />
        <path d="M-226 -400H226" stroke="#4a2f1c" strokeWidth="34" />
        <rect x="-30" y="-424" width="60" height="48" rx="8" fill="#e8c35a" />
        <path d="M-80 -690L0 -600 80 -690" fill="#e9dcc0" />
        <Arm x={-190} y={-640} side={-1} deg={l} len={300} width={86} color="#5b7a4a" skin="#e9b896" />
        <Arm x={190} y={-640} side={1} deg={r} len={300} width={86} color="#6d8f5a" skin="#e9b896" />
        <g transform={`rotate(${nod} 0 -700)`}>
          <rect x="-50" y="-730" width="100" height="60" fill="#d9a07e" />
          <circle cx="-122" cy="-800" r="30" fill="#e2a988" />
          <circle cx="122" cy="-800" r="30" fill="#e2a988" />
          <circle cx="0" cy="-810" r="126" fill="#efbf9c" />
          <path d="M-128 -820Q-140 -950 0 -950Q140 -950 128 -820Q110 -890 40 -892Q0 -870 -40 -892Q-110 -890 -128 -820Z" fill="#8a5a2a" />
          <path d="M-110 -760Q-120 -640 0 -620Q120 -640 110 -760Q80 -720 0 -726Q-80 -720 -110 -760Z" fill="#9a6532" />
          <Brows cx={look * 10} cy={-850} gap={46} w={46} mood={face} color="#6a4220" />
          <Eyes cx={look * 10} cy={-818} gap={46} r={16} mood={face} look={look} />
          <ellipse cx={look * 12} cy="-778" rx="26" ry="22" fill="#e09a7a" />
          <ellipse cx="-80" cy="-770" rx="22" ry="12" fill="#f29b9b" opacity="0.45" />
          <ellipse cx="80" cy="-770" rx="22" ry="12" fill="#f29b9b" opacity="0.45" />
          <Mouth x={look * 8} y={-736} w={30} mood={face} idle={idle} color="#5a2f1a" />
        </g>
      </g>
    </g>
  );
}

/** The Giant's legs and boots striding into view (only legs fit in the hall). */
export function GiantLegs({ t = 0, walking = true }: { t?: number; walking?: boolean }) {
  const step = walking ? wave(t, 1300) : 0;
  return (
    <g data-testid="sb-giant-legs">
      {[-1, 1].map((s) => {
        const lift = walking ? Math.max(0, s * step) * 90 : 0;
        return (
          <g key={s} transform={`translate(${s * 150 + s * step * 40} ${-lift})`}>
            <rect x="-85" y="-1500" width="170" height="1330" rx="50" fill={s < 0 ? '#3f5f94' : '#46587e'} />
            <path d="M-100 -200H90Q260 -200 270 -60Q276 0 200 0H-110Q-120 -100 -100 -200Z" fill="#6a4428" />
            <path d="M-110 -14H210" stroke="#4a2f1c" strokeWidth="26" strokeLinecap="round" />
            <path d="M60 -170l40 40M100 -176l40 40" stroke="#e8d2a8" strokeWidth="8" strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------------- Hen */

export type HenPose = 'idle' | 'peck' | 'flap' | 'sit' | 'squawk' | 'carried';
export function Hen({ pose = 'idle', idle = 0 }: { pose?: HenPose; idle?: number }) {
  const flapping = pose === 'flap' || pose === 'squawk' || pose === 'carried';
  const wing = flapping ? -30 + 30 * wave(idle, 220) : 0;
  const head = pose === 'peck' ? 22 * Math.max(0, wave(idle, 900)) : pose === 'squawk' ? -14 : 4 * wave(idle, 1700);
  const legs = pose !== 'sit';
  return (
    <g data-testid="sb-hen" data-pose={pose}>
      <ellipse cy="3" rx="44" ry="7" fill="#1d1408" opacity={pose === 'carried' ? 0 : 0.2} />
      {legs && (
        <g stroke="#e8902a" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M-8 -26V0M-14 0h12M8 -26V0M2 0h12" />
        </g>
      )}
      <g transform={pose === 'sit' ? 'translate(0 18)' : undefined}>
        <path d="M-40 -60Q-74 -96 -58 -112Q-44 -92 -34 -86Q-46 -108 -26 -118Q-20 -92 -18 -80Z" fill="#e8a72a" />
        <ellipse cx="0" cy="-54" rx="46" ry="36" fill="url(#sb-gold)" />
        <g transform={`rotate(${wing} -6 -64)`}>
          <path d="M-30 -66Q-6 -84 22 -64Q10 -36 -24 -40Z" fill="#f2b632" stroke="#c98a1a" strokeWidth="2.5" />
        </g>
        <g transform={`rotate(${head} 28 -76)`}>
          <circle cx="36" cy="-92" r="22" fill="url(#sb-gold)" />
          <path d="M26 -112q4 -14 10 -2q6 -14 10 0q8 -8 8 6Z" fill="#e2453a" />
          <path d={pose === 'squawk' ? 'M54 -96l20 -6-18 4 18 8Z' : 'M54 -94l18 4-18 6Z'} fill="#e8902a" />
          <path d="M50 -82q4 12 -4 14q-6 -8 4 -14Z" fill="#e2453a" />
          <g className="sb-blink">
            <circle cx="42" cy="-96" r="4.5" fill="#2b2117" />
            <circle cx="43.5" cy="-97.5" r="1.5" fill="#fff" />
          </g>
        </g>
      </g>
    </g>
  );
}

export function GoldenEgg({ shine = 1 }: { shine?: number }) {
  return (
    <g data-testid="sb-golden-egg">
      <circle r="44" fill="#fff2b0" opacity={0.35 * shine} className="sb-glow" />
      <ellipse rx="20" ry="26" fill="url(#sb-gold)" stroke="#c98a1a" strokeWidth="2" />
      <ellipse cx="-7" cy="-9" rx="5" ry="9" fill="#fffbe0" opacity="0.8" />
    </g>
  );
}

/* ------------------------------------------------------------------ Pigs */

export type PigId = 'one' | 'two' | 'three' | 'mama';
export type PigPose = 'idle' | 'walk' | 'run' | 'build' | 'carry' | 'cheer' | 'scared' | 'proud' | 'wave' | 'talk' | 'push' | 'hug';
const PIG_STYLE: Record<PigId, { outfit: string; trim: string }> = {
  one: { outfit: '#f2cf63', trim: '#c99a2a' },
  two: { outfit: '#6fae7a', trim: '#3f7a4a' },
  three: { outfit: '#4f7fb8', trim: '#2f5a8a' },
  mama: { outfit: '#d98ab8', trim: '#a8588a' },
};
export function Pig({
  id,
  pose = 'idle',
  t = 0,
  idle = 0,
  mood,
  tool,
}: {
  id: PigId;
  pose?: PigPose;
  t?: number;
  idle?: number;
  mood?: Mood;
  /** Hammer in the right hand while building. */
  tool?: boolean;
}) {
  const style = PIG_STYLE[id];
  const phase = id === 'one' ? 0 : id === 'two' ? 1.3 : 2.6;
  const fast = pose === 'run' ? 300 : 520;
  const moving = pose === 'walk' || pose === 'run';
  const step = moving ? wave(t, fast, phase) : 0;
  const hop =
    pose === 'cheer' ? Math.abs(wave(idle, 640, phase)) * -34 : moving ? Math.abs(step) * -8 : 0;
  const shiver = pose === 'scared' ? 3 * wave(idle, 90) : 0;
  const ww = wave(idle, 800, phase);
  const arms: Record<PigPose, [number, number]> = {
    idle: [14, 14],
    walk: [24 + 16 * step, 24 - 16 * step],
    run: [60 + 30 * step, 60 - 30 * step],
    build: [30, 70 + 50 * Math.max(0, wave(idle, 520, phase))],
    carry: [165, 165],
    cheer: [150 + 12 * ww, 150 - 12 * ww],
    scared: [110, 110],
    proud: [40, 40],
    wave: [14, 150 + 22 * wave(idle, 480, phase)],
    talk: [16, 40 + 14 * ww],
    push: [90, 90],
    hug: [70, 70],
  };
  const moods: Record<PigPose, Mood> = {
    idle: 'smile',
    walk: 'smile',
    run: 'o',
    build: 'smile',
    carry: 'smile',
    cheer: 'grin',
    scared: 'worried',
    proud: 'grin',
    wave: 'smile',
    talk: 'talk',
    push: 'frown',
    hug: 'grin',
  };
  const [l, r] = arms[pose];
  const face = mood ?? moods[pose];
  return (
    <g data-testid={`sb-pig-${id}`} data-pose={pose}>
      <ellipse cy="4" rx="60" ry="10" fill="#1d1408" opacity="0.2" />
      <g transform={`translate(${shiver} ${hop})`}>
        {[-1, 1].map((s) => (
          <g key={s} transform={`translate(${s * 20} ${moving ? -Math.max(0, s * step) * 16 : 0})`}>
            <rect x="-11" y="-52" width="22" height="50" rx="9" fill="#e58f9e" />
            <rect x="-12" y="-12" width="24" height="12" rx="5" fill="#8a4a5a" />
          </g>
        ))}
        <g transform={`rotate(${8 * wave(idle, 600, phase)} 50 -84)`}>
          <path d="M48 -84q18 -6 16 8q-2 12 -12 6q-6 -6 4 -12" stroke="#e58f9e" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
        <g transform={breathe(idle, 0.02, 2200)}>
          <Arm x={-44} y={-114} side={-1} deg={l} len={48} width={18} color="#f4b3bd" skin="#e58f9e" />
          <ellipse cy="-88" rx="54" ry="52" fill="#f4b3bd" />
          {id === 'one' && <path d="M-50 -110Q0 -96 50 -110L48 -70Q0 -56 -48 -70Z" fill={style.outfit} />}
          {id === 'two' && (
            <>
              <path d="M-50 -76Q0 -64 50 -76L60 -42Q0 -24 -60 -42Z" fill={style.outfit} />
              <path d="M-30 -132Q0 -118 30 -132L34 -118Q0 -104 -34 -118Z" fill={style.trim} />
            </>
          )}
          {id === 'three' && (
            <>
              <path d="M-46 -96H46Q52 -60 40 -40H-40Q-52 -60 -46 -96Z" fill={style.outfit} />
              <path d="M-30 -96L-36 -132M30 -96L36 -132" stroke={style.outfit} strokeWidth="10" strokeLinecap="round" />
              <rect x="-12" y="-86" width="24" height="18" rx="4" fill={style.trim} />
            </>
          )}
          {id === 'mama' && <path d="M-46 -120Q0 -104 46 -120L56 -40Q0 -26 -56 -40Z" fill="#fff4e6" stroke={style.outfit} strokeWidth="6" />}
          <Arm x={44} y={-114} side={1} deg={r} len={48} width={18} color="#f4b3bd" skin="#e58f9e">
            {tool && (
              <g transform="rotate(-80)">
                <rect x="-4" y="-6" width="8" height="46" rx="3" fill="#8a5a34" />
                <rect x="-16" y="34" width="32" height="16" rx="4" fill="#8e98a8" />
              </g>
            )}
          </Arm>
          <g transform={`rotate(${pose === 'scared' ? -4 : 3 * wave(idle, 2600, phase)} 0 -140)`}>
            <path d="M-40 -190l-12 -30 30 14Z M40 -190l12 -30 -30 14Z" fill="#e58f9e" />
            <circle cy="-170" r="46" fill="#f7c2ca" />
            <ellipse cy="-156" rx="20" ry="14" fill="#e58f9e" />
            <ellipse cx="-7" cy="-156" rx="3.5" ry="5" fill="#8a4a5a" />
            <ellipse cx="7" cy="-156" rx="3.5" ry="5" fill="#8a4a5a" />
            <Brows cx={0} cy={-196} gap={17} w={12} mood={face} color="#c46a7e" />
            <Eyes cx={0} cy={-182} gap={17} r={6} mood={face} />
            <ellipse cx="-30" cy="-160" rx="8" ry="5" fill="#f08aa0" opacity="0.6" />
            <ellipse cx="30" cy="-160" rx="8" ry="5" fill="#f08aa0" opacity="0.6" />
            <Mouth x={0} y={-136} w={9} mood={face} idle={idle} color="#8a4a5a" />
            {id === 'one' && (
              <g fill={style.outfit}>
                <ellipse cy="-212" rx="52" ry="10" />
                <path d="M-30 -214Q-28 -246 0 -246Q28 -246 30 -214Z" />
                <path d="M-30 -220Q0 -212 30 -220" stroke={style.trim} strokeWidth="6" fill="none" />
              </g>
            )}
            {id === 'two' && (
              <g>
                <path d="M18 -214l26 -14v28Z M18 -214l-6 -26 22 10Z" fill="#e2675f" />
                <circle cx="20" cy="-212" r="7" fill="#c4473f" />
              </g>
            )}
            {id === 'three' && (
              <g>
                <path d="M-42 -200Q-40 -244 0 -246Q40 -244 42 -200Z" fill="#e8775f" />
                <rect x="-50" y="-206" width="100" height="12" rx="6" fill="#c45a44" />
              </g>
            )}
            {id === 'mama' && <circle cx="-26" cy="-210" r="12" fill="#ffd36e" stroke="#e8a72a" strokeWidth="3" />}
          </g>
        </g>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ Wolf */

export type WolfPose =
  | 'walk'
  | 'sneak'
  | 'sniff'
  | 'talk'
  | 'grin'
  | 'inhale'
  | 'blow'
  | 'surprised'
  | 'frustrated'
  | 'climb'
  | 'slip'
  | 'wet'
  | 'run'
  | 'idle';
export function Wolf({
  pose = 'idle',
  t = 0,
  idle = 0,
  puff = 0,
}: {
  pose?: WolfPose;
  t?: number;
  idle?: number;
  /** 0 → 1: how full of air he is (inhale/blow cheeks and chest). */
  puff?: number;
}) {
  const moving = pose === 'walk' || pose === 'sneak' || pose === 'run' || pose === 'climb';
  const period = pose === 'run' ? 330 : pose === 'sneak' ? 900 : 650;
  const step = moving ? wave(t, period) : pose === 'frustrated' ? wave(idle, 260) : 0;
  const crouch = pose === 'sneak' ? 34 : pose === 'climb' ? 20 : 0;
  const lean =
    pose === 'sneak' ? 14 : pose === 'run' ? 16 : pose === 'inhale' ? -10 * puff : pose === 'blow' ? 12 : pose === 'sniff' ? -6 : pose === 'slip' ? -24 : 0;
  const hop = pose === 'surprised' ? -26 : pose === 'run' ? Math.abs(step) * -14 : moving ? Math.abs(step) * -6 : 0;
  const tail =
    pose === 'wet' || pose === 'run' ? 50 : pose === 'frustrated' ? 20 * wave(idle, 200) : pose === 'sneak' ? 10 : -10 + 12 * wave(idle, 1100);
  const armsBy: Partial<Record<WolfPose, [number, number]>> = {
    talk: [20, 60 + 14 * wave(idle, 700)],
    grin: [30, 30],
    inhale: [40 + 20 * puff, 40 + 20 * puff],
    blow: [70, 70],
    surprised: [140, 140],
    frustrated: [120 + 20 * step, 120 - 20 * step],
    climb: [130 + 30 * step, 130 - 30 * step],
    slip: [160 + 20 * wave(idle, 200), 120 - 20 * wave(idle, 200)],
    wet: [8, 8],
    run: [60 + 40 * step, 60 - 40 * step],
    sneak: [70, 80],
    sniff: [20, 30],
  };
  const [l, r] = armsBy[pose] ?? [16 + 18 * step, 16 - 18 * step];
  const cheeks = pose === 'blow' ? 1 : pose === 'inhale' ? puff * 0.6 : 0;
  const mouthOpen = pose === 'talk' ? 0.4 + 0.6 * Math.abs(wave(idle, 330)) : pose === 'surprised' || pose === 'slip' ? 1 : 0;
  const earsDown = pose === 'wet' || pose === 'slip' ? 1 : 0;
  const eyeR = pose === 'surprised' || pose === 'slip' ? 1.35 : 1;
  return (
    <g data-testid="sb-wolf" data-pose={pose}>
      <ellipse cy="4" rx="80" ry="12" fill="#1d1408" opacity="0.22" />
      <g transform={`translate(0 ${hop + crouch})`}>
        <g transform={`rotate(${lean} 0 -150)`}>
          <g transform={`rotate(${tail} -46 -150)`}>
            <path d="M-46 -150Q-130 -150 -150 -230Q-120 -200 -96 -214Q-110 -170 -46 -168Z" fill="#6f7c96" />
            <path d="M-140 -222Q-150 -236 -152 -244Q-130 -230 -122 -214Z" fill="#e8ecf4" />
          </g>
          {[-1, 1].map((s) => (
            <g key={s} transform={`translate(${s * 14} ${-140 + crouch * 0.4}) rotate(${s * 26 * step})`}>
              <rect x="-15" y="0" width="30" height={134 - crouch * 0.4} rx="14" fill={s < 0 ? '#5a4f7a' : '#6a5f8a'} />
              <ellipse cx="14" cy={136 - crouch * 0.4} rx="28" ry="12" fill="#5d687f" />
            </g>
          ))}
          <path d="M-26 -150L-20 -120M10 -150l6 30" stroke="#8a7aa8" strokeWidth="6" opacity="0.6" />
          <rect x="-34" y="-176" width="70" height="20" rx="8" fill="#4a3f6a" />
          <Arm x={-6} y={-250} side={-1} deg={l} len={92} width={24} color="#6f7c96" skin="#5d687f" />
          <g transform={`translate(0 -210) scale(${1 + 0.18 * cheeks} ${1 + 0.1 * cheeks}) translate(0 210)`}>
            <ellipse cx="0" cy="-212" rx="52" ry="68" fill="#7d8aa3" />
            <ellipse cx="14" cy="-200" rx="28" ry="46" fill="#dfe4ee" />
          </g>
          <Arm x={18} y={-250} side={1} deg={r} len={92} width={24} color="#7d8aa3" skin="#5d687f" />
          <g transform={`rotate(${pose === 'sniff' ? -16 + 4 * wave(idle, 300) : pose === 'wet' ? 14 : 0} 20 -270)`}>
            <g transform={`rotate(${earsDown * 50} -6 -340)`}>
              <path d="M-26 -320L-14 -382 12 -330Z" fill="#6f7c96" />
              <path d="M-18 -330L-12 -366 2 -334Z" fill="#e8b4bc" />
            </g>
            <g transform={`rotate(${earsDown * 40} 30 -336)`}>
              <path d="M14 -330L34 -386 50 -326Z" fill="#7d8aa3" />
            </g>
            <circle cx="18" cy="-296" r="50" fill="#7d8aa3" />
            <path d="M40 -310Q110 -306 124 -280Q120 -258 52 -258Z" fill="#8a97b0" />
            <path d="M44 -268Q92 -262 118 -270" stroke="#dfe4ee" strokeWidth="14" strokeLinecap="round" />
            <ellipse cx="124" cy="-286" rx="13" ry="11" fill="#2b2b3a" />
            <circle cx={36 + 18 * cheeks} cy={-268} r={24 * cheeks} fill="#9aa7c0" />
            {mouthOpen > 0 ? (
              <ellipse cx="86" cy="-262" rx="18" ry={14 * mouthOpen} fill="#7a3b3b" />
            ) : pose === 'blow' ? (
              <ellipse cx="118" cy="-266" rx="9" ry="8" fill="#7a3b3b" />
            ) : (
              <path d={pose === 'grin' || pose === 'sneak' ? 'M58 -266Q90 -246 116 -270' : pose === 'wet' || pose === 'frustrated' ? 'M60 -258Q88 -270 114 -262' : 'M60 -264Q90 -256 116 -268'} stroke="#3a3a4a" strokeWidth="5" fill="none" strokeLinecap="round" />
            )}
            {(pose === 'grin' || pose === 'sneak') && <path d="M74 -262l5 10 5 -9Z" fill="#fff" />}
            <g className="sb-blink">
              <ellipse cx="38" cy="-310" rx={11 * eyeR} ry={13 * eyeR} fill="#ffe28a" />
              <circle cx={pose === 'sniff' ? 44 : 41} cy="-308" r={6 * eyeR} fill="#2b2117" />
              <circle cx="43" cy="-312" r="2" fill="#fff" />
            </g>
            <path
              d={pose === 'frustrated' || pose === 'grin' || pose === 'sneak' ? 'M22 -334L54 -322' : pose === 'wet' ? 'M24 -322L52 -332' : 'M24 -330Q38 -338 54 -330'}
              stroke="#3a3a4a"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </g>
      </g>
    </g>
  );
}

/** Shared gradients used by several characters; render once per stage. */
export function CastDefs() {
  return (
    <defs>
      <radialGradient id="sb-gold" cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#fff6c8" />
        <stop offset="0.45" stopColor="#ffd34d" />
        <stop offset="1" stopColor="#d89a1a" />
      </radialGradient>
    </defs>
  );
}
