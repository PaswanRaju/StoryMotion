import { memo } from 'react';
import type { ReactNode } from 'react';
import { clamp01, ease, hash, lerp, wave } from './clock';

/**
 * Backgrounds, buildings, props and effects for the storybook scenes, authored on
 * the 1920×1080 stage. Static backdrops are memoized; anything that moves takes the
 * story clock (`t`) or the idle clock (`idle`) as a prop.
 */

export const GROUND_Y = 900;

/* ------------------------------------------------------------- shared bits */

export function Cloud({ x, y, s = 1, opacity = 1 }: { x: number; y: number; s?: number; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity} fill="#fffaf0">
      <ellipse cx="0" cy="0" rx="120" ry="34" />
      <ellipse cx="-40" cy="-22" rx="56" ry="38" />
      <ellipse cx="34" cy="-30" rx="62" ry="44" />
    </g>
  );
}

/** Clouds that drift with the idle clock (they keep moving while the story waits). */
export function DriftingClouds({ idle, y = 120, speed = 0.012 }: { idle: number; y?: number; speed?: number }) {
  return (
    <g>
      {[0, 1, 2, 3].map((i) => {
        const x = ((idle * speed * (1 + i * 0.25) + i * 640) % 2400) - 240;
        return <Cloud key={i} x={x} y={y + (i % 2) * 90 + i * 12} s={0.7 + (i % 3) * 0.25} opacity={0.9} />;
      })}
    </g>
  );
}

export function Tree({ x, y, s = 1, tone = 0 }: { x: number; y: number; s?: number; tone?: number }) {
  const greens = ['#6cb663', '#5aa65a', '#7cc46c'];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-18" y="-170" width="36" height="170" rx="10" fill="#8a6446" />
      <circle cx="0" cy="-220" r="100" fill={greens[tone % 3]} />
      <circle cx="-70" cy="-170" r="64" fill={greens[(tone + 1) % 3]} />
      <circle cx="70" cy="-176" r="70" fill={greens[(tone + 2) % 3]} />
      <circle cx="-30" cy="-260" r="34" fill="#ffffff" opacity="0.12" />
    </g>
  );
}

function Sun({ x, y, r = 70 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r * 2.4} fill="#fff4c2" opacity="0.25" />
      <circle cx={x} cy={y} r={r} fill="#fff1b0" />
    </g>
  );
}

/** Sky that blends day → dusk → night. k: 0 day, 0.5 dusk, 1 night. */
export function Sky({ k = 0, sunset = 0 }: { k?: number; sunset?: number }) {
  return (
    <g>
      <defs>
        <linearGradient id="sb-sky-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd0f0" />
          <stop offset="1" stopColor="#e7f6ee" />
        </linearGradient>
        <linearGradient id="sb-sky-dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a6fc8" />
          <stop offset="0.6" stopColor="#f2a87a" />
          <stop offset="1" stopColor="#ffd9a8" />
        </linearGradient>
        <linearGradient id="sb-sky-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141c44" />
          <stop offset="1" stopColor="#3a3f7a" />
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#sb-sky-day)" />
      <rect width="1920" height="1080" fill="url(#sb-sky-dusk)" opacity={Math.max(sunset, clamp01(k * 2) * (1 - clamp01((k - 0.5) * 2)))} />
      <rect width="1920" height="1080" fill="url(#sb-sky-night)" opacity={clamp01((k - 0.5) * 2)} />
      {k > 0.6 && (
        <g opacity={clamp01((k - 0.6) * 2.5)}>
          <circle cx="1560" cy="170" r="62" fill="#fdf6d8" />
          <circle cx="1586" cy="152" r="56" fill="#2a3166" />
          {Array.from({ length: 40 }, (_, i) => (
            <circle key={i} className="sb-twinkle" style={{ animationDelay: `${(i % 7) * 0.4}s` }} cx={hash(i) * 1920} cy={hash(i + 99) * 520} r={1.5 + hash(i + 7) * 2.5} fill="#fffbe0" />
          ))}
        </g>
      )}
    </g>
  );
}

/* --------------------------------------------------------- Jack's cottage */

export function Cottage({ door = 0, lit = 0, x = 230, y = GROUND_Y }: { door?: number; lit?: number; x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} data-testid="sb-cottage">
      <rect x="300" y="-470" width="56" height="130" fill="#9a8a7a" />
      <rect x="292" y="-482" width="72" height="18" rx="6" fill="#7a6a5a" />
      <rect x="0" y="-330" width="420" height="330" fill="#f3e0c0" />
      <path d="M0 -40H420M0 -120H420" stroke="#e2c99e" strokeWidth="6" />
      <path d="M-50 -320L210 -520 470 -320Z" fill="#c9954a" />
      <path d="M-50 -320L210 -520 470 -320" fill="none" stroke="#a8763a" strokeWidth="14" strokeLinejoin="round" />
      {[-0.7, -0.35, 0, 0.35, 0.7].map((k, i) => (
        <path key={i} d={`M${210 + k * 200} -360L${210 + k * 120} -470`} stroke="#b07e3e" strokeWidth="5" opacity="0.6" />
      ))}
      {/* Window: empty shelf inside, warm light at night */}
      <rect x="44" y="-250" width="110" height="100" rx="8" fill={lit ? '#ffe9a8' : '#9cc4d8'} />
      <rect x="44" y="-250" width="110" height="100" rx="8" fill="#ffd36e" opacity={lit * 0.8} />
      <path d="M58 -200H140" stroke="#8a6446" strokeWidth="6" />
      <circle cx="80" cy="-210" r="7" fill="#c9a26a" />
      <path d="M99 -250V-150M44 -200H154" stroke="#7a5638" strokeWidth="8" />
      <rect x="44" y="-250" width="110" height="100" rx="8" fill="none" stroke="#7a5638" strokeWidth="10" />
      {/* Door, swings open */}
      <rect x="240" y="-200" width="110" height="200" rx="14" fill="#3a2a1a" />
      <rect x="240" y="-200" width={110 * (1 - door * 0.8)} height="200" rx="14" fill="#7a5638" />
      <circle cx={240 + 110 * (1 - door * 0.8) - 18} cy="-100" r="8" fill="#e8c35a" opacity={1 - door} />
    </g>
  );
}

/** Jack's home: cottage, empty garden patch, fence, tree, rolling hills. */
export const CottageYard = memo(function CottageYard({ patch = true }: { patch?: boolean }) {
  return (
    <g>
      <path d="M0 640Q300 520 700 600T1400 580T1920 620V1080H0Z" fill="#a8d8a0" />
      <path d="M0 720Q480 660 960 700T1920 690V1080H0Z" fill="#8ccb7e" />
      <Tree x={1700} y={GROUND_Y - 10} s={1.2} tone={1} />
      <rect y={GROUND_Y - 20} width="1920" height={1080 - GROUND_Y + 20} fill="#7cc46c" />
      <path d={`M0 ${GROUND_Y + 60}Q600 ${GROUND_Y + 20} 1100 ${GROUND_Y + 70}T1920 ${GROUND_Y + 50}`} stroke="#e9d3a4" strokeWidth="70" fill="none" />
      {patch && (
        <g transform={`translate(860 ${GROUND_Y + 10})`}>
          <ellipse rx="190" ry="34" fill="#8a5a3a" />
          {[-130, -60, 10, 80, 140].map((x) => (
            <path key={x} d={`M${x} -4q10 -18 4 -30`} stroke="#9a8a4a" strokeWidth="5" fill="none" strokeLinecap="round" />
          ))}
        </g>
      )}
      <g fill="#c9a26a">
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={1180 + i * 70} y={GROUND_Y - 110} width="16" height="110" rx="5" />
        ))}
        <rect x="1170" y={GROUND_Y - 90} width="590" height="14" rx="6" />
        <rect x="1170" y={GROUND_Y - 44} width="590" height="14" rx="6" />
      </g>
    </g>
  );
});

/* -------------------------------------------------------- road to market */

export const MarketRoad = memo(function MarketRoad() {
  return (
    <g>
      <path d="M0 600Q400 500 900 580T1920 560V1080H0Z" fill="#b4dca8" />
      {/* Far market stalls on the hill */}
      <g transform="translate(1540 600)">
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${i * 110} ${-i * 6})`}>
            <rect x="-40" y="-60" width="80" height="60" fill="#f3e0c0" />
            <path d="M-50 -60H50L40 -90H-40Z" fill={['#e2675f', '#7fb8de', '#f5bf72'][i]} />
            <path d="M-50 -60q12 14 25 0q12 14 25 0q12 14 25 0q12 14 25 0" fill={['#e2675f', '#7fb8de', '#f5bf72'][i]} />
          </g>
        ))}
        <path d="M60 -100V-170" stroke="#8a6446" strokeWidth="5" />
        <path className="sb-flag" d="M60 -170l46 12-46 12Z" fill="#e2675f" />
      </g>
      <path d="M0 720Q500 650 980 700T1920 680V1080H0Z" fill="#8ccb7e" />
      <rect y={GROUND_Y - 20} width="1920" height="200" fill="#7cc46c" />
      <path d={`M-40 ${GROUND_Y + 50}Q700 ${GROUND_Y + 10} 1300 ${GROUND_Y + 40}T1960 ${GROUND_Y - 80}`} stroke="#e9d3a4" strokeWidth="110" fill="none" strokeLinecap="round" />
      {/* Signpost: an arrow and a carrot, no words */}
      <g transform={`translate(560 ${GROUND_Y - 10})`}>
        <rect x="-10" y="-230" width="20" height="230" rx="6" fill="#9a6e47" />
        <path d="M-90 -220H80L120 -190 80 -160H-90Z" fill="#c9a26a" stroke="#8a6446" strokeWidth="6" />
        <path d="M-40 -190l34 -10 -6 -12M-40 -190l20 18" stroke="#e8775f" strokeWidth="14" strokeLinecap="round" fill="none" />
        <path d="M-6 -200l14 -14M-6 -200l18 -4" stroke="#6cb663" strokeWidth="6" strokeLinecap="round" />
      </g>
      <Tree x={1300} y={GROUND_Y} s={1.35} tone={0} />
      <Tree x={160} y={GROUND_Y - 30} s={0.9} tone={2} />
    </g>
  );
});

/* ------------------------------------------------------ the giant's castle */

export const CastleHall = memo(function CastleHall() {
  const F = 1000;
  return (
    <g data-testid="sb-castle-hall">
      <defs>
        <linearGradient id="sb-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a5a9a" />
          <stop offset="1" stopColor="#4a3f78" />
        </linearGradient>
        <radialGradient id="sb-fire" cx="0.5" cy="0.8" r="0.7">
          <stop offset="0" stopColor="#fff2b0" />
          <stop offset="0.4" stopColor="#ffb04a" />
          <stop offset="1" stopColor="#ff7a3a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1920" height={F} fill="url(#sb-wall)" />
      {Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: 7 }, (_, col) => (
          <rect key={`${row}-${col}`} x={col * 330 - (row % 2) * 165} y={row * 170} width="322" height="162" rx="18" fill="#5d4f8c" opacity="0.55" />
        )),
      )}
      {/* Huge window with clouds outside */}
      <path d="M760 90Q900 -40 1040 90V420H760Z" fill="#bfe6ff" />
      <circle cx="840" cy="300" r="60" fill="#ffffff" opacity="0.9" />
      <circle cx="960" cy="330" r="46" fill="#ffffff" opacity="0.8" />
      <path d="M900 20V420M760 250H1040" stroke="#3a2f60" strokeWidth="16" />
      <path d="M760 90Q900 -40 1040 90V420H760Z" fill="none" stroke="#3a2f60" strokeWidth="20" />
      {/* Towering door on the left (Jack's way out) */}
      <path d={`M20 ${F}V200Q190 0 360 200V${F}Z`} fill="#3a2a1a" />
      <path d={`M48 ${F}V220Q190 40 332 220V${F}Z`} fill="#8a5a34" />
      <path d={`M250 ${F}V240L332 220V${F}Z`} fill="#fff3c8" opacity="0.8" className="sb-glow" />
      {[300, 460, 620, 780].map((y) => (
        <path key={y} d={`M48 ${y}H250`} stroke="#5a3820" strokeWidth="10" />
      ))}
      {/* Fireplace */}
      <rect x="1660" y="460" width="260" height={F - 460} fill="#3a2a1a" />
      <path d={`M1690 ${F}V560Q1800 470 1920 560V${F}Z`} fill="#1d140c" />
      <ellipse className="sb-flicker" cx="1810" cy={F - 60} rx="130" ry="130" fill="url(#sb-fire)" />
      {/* Floor and giant footprints */}
      <rect y={F} width="1920" height={1080 - F} fill="#8a5f3e" />
      {Array.from({ length: 10 }, (_, i) => (
        <path key={i} d={`M${i * 200} ${F}l-30 80`} stroke="#6a4428" strokeWidth="4" opacity="0.6" />
      ))}
      {/* Giant chair */}
      <g>
        <rect x="1150" y="160" width="560" height="560" rx="40" fill="#7a3f52" />
        <rect x="1180" y="190" width="500" height="500" rx="30" fill="#9a4f68" />
        <rect x="1100" y="640" width="660" height="120" rx="30" fill="#7a3f52" />
        <rect x="1130" y="760" width="60" height={F - 760} fill="#5a3820" />
        <rect x="1670" y="760" width="60" height={F - 760} fill="#5a3820" />
      </g>
    </g>
  );
});

/** A giant cup on the floor: Jack's hiding place. */
export function GiantCup({ x, y = 1000 }: { x: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} data-testid="sb-cup">
      <path d="M-150 -300H150L120 0H-120Z" fill="#e8d2a8" />
      <path d="M150 -250Q240 -240 230 -150Q220 -80 135 -90" fill="none" stroke="#d9bf8f" strokeWidth="34" />
      <ellipse cx="0" cy="-300" rx="150" ry="26" fill="#d9bf8f" />
      <path d="M-140 -220H140" stroke="#7fb8de" strokeWidth="20" />
    </g>
  );
}

/** Giant's footstool, where the golden hen sits. */
export function Stool({ x, y = 1000 }: { x: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} data-testid="sb-stool">
      <rect x="-20" y="-110" width="26" height="110" fill="#5a3820" />
      <rect x="140" y="-110" width="26" height="110" fill="#5a3820" />
      <rect x="-40" y="-150" width="230" height="50" rx="16" fill="#8a5a34" />
      <ellipse cx="75" cy="-150" rx="110" ry="14" fill="#c79bff" />
    </g>
  );
}

/* ----------------------------------------------------- the descent (escape) */

/** Beanstalk seen from the side while the view slides down it; `scroll` in px. */
export function StalkColumn({ x, scroll, sway = 0 }: { x: number; scroll: number; sway?: number }) {
  const seg = 360;
  const offset = ((scroll % seg) + seg) % seg;
  return (
    <g transform={`rotate(${sway} ${x} 1200)`} data-testid="sb-stalk">
      <path d={`M${x - 40} -200Q${x + 40} 300 ${x - 30} 700T${x - 40} 1300H${x + 60}Q${x + 120} 1000 ${x + 50} 700T${x + 60} -200Z`} fill="#4fa35a" />
      <path d={`M${x} -200Q${x + 70} 300 ${x} 700T${x} 1300`} stroke="#8ed97a" strokeWidth="10" fill="none" opacity="0.7" />
      {Array.from({ length: 6 }, (_, i) => {
        const y = -seg + i * seg + offset;
        const side = i % 2 ? 1 : -1;
        return (
          <g key={i} transform={`translate(${x + side * 50} ${y}) scale(${side} 1)`}>
            <path d="M0 0C40 -60 150 -50 170 0C120 30 40 30 0 0Z" fill={i % 2 ? '#6cc45f' : '#8ed97a'} />
            <path d="M0 0Q90 -10 160 0" stroke="#3f8a45" strokeWidth="4" fill="none" />
            <path d="M0 0q-20 30 10 60q30 -20 10 -50" stroke="#3f9a4c" strokeWidth="6" fill="none" />
          </g>
        );
      })}
    </g>
  );
}

/* ----------------------------------------------------------- countryside */

/** The pigs' countryside; the Wolf's woods are on the left, behind the travelling pigs. */
export const Countryside = memo(function Countryside({ woods = true }: { woods?: boolean }) {
  return (
    <g>
      <path d="M0 620Q360 520 760 590T1500 560T1920 600V1080H0Z" fill="#b4dca8" />
      {woods && (
        <g>
          {Array.from({ length: 7 }, (_, i) => (
            <Tree key={i} x={-40 + i * 70} y={720 + (i % 2) * 20} s={0.75 + (i % 3) * 0.12} tone={i} />
          ))}
        </g>
      )}
      <path d="M0 700Q500 640 980 690T1920 680V1080H0Z" fill="#9fd48f" />
      <rect y={GROUND_Y - 30} width="1920" height="230" fill="#86c873" />
      {Array.from({ length: 26 }, (_, i) => (
        <path key={i} d={`M${(i * 77) % 1920} ${GROUND_Y + 30 + (i % 4) * 34}q6 -16 12 0`} stroke="#6cb663" strokeWidth="4" fill="none" />
      ))}
      {[180, 420, 1120].map((x, i) => (
        <g key={x} transform={`translate(${x} ${GROUND_Y + 80 + i * 20})`}>
          <circle r="8" fill={['#ffd36e', '#f29bb5', '#ffffff'][i]} />
          <circle r="3" fill="#e8902a" />
        </g>
      ))}
    </g>
  );
});

/** Sky for the pigs' world: warm daylight that drifts toward evening at the end. */
export function WarmSky({ idle, evening = 0 }: { idle: number; evening?: number }) {
  return (
    <g>
      <Sky sunset={evening} />
      <Sun x={lerp(300, 1500, evening * 0.5)} y={lerp(170, 300, evening)} />
      <DriftingClouds idle={idle} />
    </g>
  );
}

export function MamaHouse({ x, y = GROUND_Y }: { x: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-170" y="-260" width="340" height="260" fill="#fbe3d0" />
      <path d="M-210 -250L0 -420 210 -250Z" fill="#d97a6a" />
      <rect x="-50" y="-170" width="100" height="170" rx="40" fill="#e88aa8" />
      <circle cx="30" cy="-86" r="7" fill="#ffd36e" />
      <rect x="-140" y="-200" width="70" height="60" rx="8" fill="#cde9ed" stroke="#a8786a" strokeWidth="6" />
      <rect x="70" y="-200" width="70" height="60" rx="8" fill="#cde9ed" stroke="#a8786a" strokeWidth="6" />
      {[-150, -120, 110, 140].map((dx) => (
        <circle key={dx} cx={dx} cy="-6" r="14" fill={dx < 0 ? '#f29bb5' : '#ffd36e'} />
      ))}
    </g>
  );
}

/* ------------------------------------------------------------- houses */

/** Pieces fly away (downwind, `dir`) as `blow` goes 0 → 1; deterministic per index. */
function flyAway(i: number, blow: number, dir = 1) {
  if (blow <= 0) return { dx: 0, dy: 0, r: 0, o: 1 };
  const k = blow;
  return {
    dx: dir * (300 + hash(i) * 900) * k,
    dy: -(200 + hash(i + 3) * 400) * k + 600 * k * k * hash(i + 5),
    r: dir * (90 + hash(i + 9) * 400) * k,
    o: 1 - clamp01((k - 0.6) / 0.4),
  };
}

export function WheatHouse({
  x,
  y = GROUND_Y,
  build = 1,
  blow = 0,
  shake = 0,
  idle = 0,
}: {
  x: number;
  y?: number;
  build?: number;
  blow?: number;
  shake?: number;
  idle?: number;
}) {
  const bundles = 9;
  const jiggle = shake * 10 * wave(idle, 110);
  return (
    <g transform={`translate(${x + jiggle} ${y})`} data-testid="sb-wheat-house" data-build={build.toFixed(2)} data-blow={blow.toFixed(2)}>
      {Array.from({ length: bundles }, (_, i) => {
        const appear = clamp01((build * 1.25 - i / bundles) * 4);
        const f = flyAway(i, blow);
        const bx = -200 + i * 50;
        const h = 250 - Math.abs(i - 4) * 8;
        return (
          <g key={i} opacity={appear * f.o} transform={`translate(${bx + f.dx} ${f.dy}) rotate(${f.r + shake * 4 * wave(idle, 140, i)} 20 0) scale(1 ${appear})`}>
            <rect x="0" y={-h} width="44" height={h} rx="10" fill={i % 2 ? '#f2cf63' : '#e8bf4a'} />
            {[8, 18, 28, 36].map((sx) => (
              <path key={sx} d={`M${sx} -6V${-h + 10}`} stroke="#c99a2a" strokeWidth="3" />
            ))}
            <path d={`M0 ${-h * 0.45}H44`} stroke="#a8763a" strokeWidth="6" />
          </g>
        );
      })}
      {(() => {
        const roofIn = clamp01((build - 0.7) / 0.25);
        const f = flyAway(20, blow * 1.1);
        return (
          <g opacity={roofIn * f.o} transform={`translate(${f.dx} ${-40 * (1 - roofIn) + f.dy}) rotate(${f.r * 0.5} 30 -300)`}>
            <path d="M-250 -230L30 -420 310 -230Z" fill="#f2cf63" />
            {Array.from({ length: 14 }, (_, i) => (
              <path key={i} d={`M${-240 + i * 40} -232l${10 + (i % 3) * 4} 30`} stroke="#c99a2a" strokeWidth="5" strokeLinecap="round" />
            ))}
            <path d="M-250 -230L30 -420 310 -230" fill="none" stroke="#c99a2a" strokeWidth="10" strokeLinejoin="round" />
          </g>
        );
      })()}
      {build > 0.9 && blow === 0 && <rect x="-10" y="-150" width="80" height="150" rx="30" fill="#7a5638" opacity={clamp01((build - 0.9) * 10)} />}
    </g>
  );
}

export function StoneHouse({
  x,
  y = GROUND_Y,
  build = 1,
  roofOff = 0,
}: {
  x: number;
  y?: number;
  build?: number;
  roofOff?: number;
}) {
  const rows = 6;
  const perRow = 7;
  return (
    <g transform={`translate(${x} ${y})`} data-testid="sb-stone-house" data-build={build.toFixed(2)} data-roof-off={roofOff.toFixed(2)}>
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: perRow }, (_, col) => {
          const n = row * perRow + col;
          const appear = clamp01((build * 1.15 * rows * perRow - n) / 3);
          // Leave the doorway open: no stones in the middle columns of the lower rows.
          if (row < 4 && (col === 3 || col === 2)) return null;
          const cx = -205 + col * 62 + (row % 2) * 20;
          const cy = -34 - row * 50;
          return (
            <g key={n} opacity={appear} transform={`translate(${cx} ${cy - (1 - appear) * 60})`}>
              <ellipse rx="34" ry="26" fill={['#a8b0bc', '#9aa3b0', '#b8bec8'][n % 3]} stroke="#7a8290" strokeWidth="4" />
              <ellipse cx="-10" cy="-8" rx="10" ry="5" fill="#dfe4ea" opacity="0.6" />
            </g>
          );
        }),
      )}
      {/* The open doorway (no door) */}
      <path d="M-70 0V-170Q-20 -200 30 -170V0Z" fill="#2a2a3a" opacity={clamp01((build - 0.5) * 3)} />
      {/* Roof of leaves: light, so it can blow away */}
      {(() => {
        const roofIn = clamp01((build - 0.8) / 0.2);
        const k = ease(roofOff, 0, 1);
        return (
          <g opacity={roofIn * (1 - clamp01((roofOff - 0.7) / 0.3))} transform={`translate(${900 * k} ${-500 * k + 200 * k * k}) rotate(${140 * k} 0 -330)`}>
            <path d="M-270 -310L0 -470 270 -310Z" fill="#6cb663" />
            {Array.from({ length: 10 }, (_, i) => (
              <ellipse key={i} cx={-220 + i * 48} cy={-320 - (i % 2) * 30 - (4.5 - Math.abs(i - 4.5)) * 22} rx="40" ry="18" fill={i % 2 ? '#8ed97a' : '#5aa65a'} transform={`rotate(${i % 2 ? 20 : -20} ${-220 + i * 48} -330)`} />
            ))}
          </g>
        );
      })()}
    </g>
  );
}

export function BrickHouse({
  x,
  y = GROUND_Y,
  build = 1,
  door = 0,
  lid = 0,
  lastBrick = 1,
  glow = 0,
  wobble = 0,
}: {
  x: number;
  y?: number;
  build?: number;
  /** 0 open → 1 shut. */
  door?: number;
  /** 0 → 1: the lid dropping onto the chimney. */
  lid?: number;
  /** 1 once the last wall brick is in place (until then its gap shows). */
  lastBrick?: number;
  /** Protective shimmer from the child's gesture. */
  glow?: number;
  /** The tiniest tremble during the strongest gust (it never moves more). */
  wobble?: number;
}) {
  const rows = 9;
  const perRow = 8;
  const total = rows * perRow;
  return (
    <g transform={`translate(${x + wobble} ${y})`} data-testid="sb-brick-house" data-build={build.toFixed(2)} data-door={door.toFixed(2)} data-lid={lid.toFixed(2)}>
      {glow > 0 && (
        <ellipse cx="0" cy="-260" rx="400" ry="330" fill="#9fdcff" opacity={0.25 * glow} stroke="#cfefff" strokeWidth="10" strokeOpacity={0.8 * glow} className="sb-glow" />
      )}
      {/* Chimney, and the lid the clever third pig drops on it */}
      <g opacity={clamp01((build - 0.85) / 0.1)}>
        <rect x="120" y="-500" width="80" height="140" fill="#c4674f" />
        {[0, 1, 2].map((r) => (
          <path key={r} d={`M120 ${-470 + r * 40}H200`} stroke="#f0c0a8" strokeWidth="4" />
        ))}
        <rect x="112" y="-530" width="96" height="34" rx="4" fill="#d9775f" stroke="#8f4a3a" strokeWidth="4" />
        <g transform={`translate(0 ${(1 - lid) * -220})`} opacity={lid > 0 ? 1 : 0} data-testid="sb-chimney-lid">
          <rect x="100" y="-552" width="120" height="22" rx="8" fill="#8e98a8" stroke="#5d6676" strokeWidth="4" />
          <rect x="146" y="-572" width="28" height="22" rx="6" fill="#5d6676" />
        </g>
      </g>
      {Array.from({ length: rows }, (_, row) =>
        Array.from({ length: perRow }, (_, col) => {
          const n = row * perRow + col;
          const appear = clamp01((build / 0.75) * total - n);
          const bx = -240 + col * 60 + (row % 2 ? 30 : 0) - (row % 2 && col === perRow - 1 ? 30 : 0);
          const by = -34 - row * 34;
          const w = row % 2 && col === perRow - 1 ? 30 : 58;
          // The very last brick (top row, right end) waits for the child or the pig.
          if (n === total - 1 && lastBrick < 1) return <rect key={n} x={bx} y={by} width={w} height="32" rx="3" fill="#3a2a22" opacity={0.35 * appear} />;
          return (
            <rect key={n} x={bx} y={by - (1 - appear) * 50} width={w} height="32" rx="3" opacity={appear} fill={['#d9775f', '#c4674f', '#e08870'][(n * 7) % 3]} stroke="#8f4a3a" strokeWidth="3" />
          );
        }),
      )}
      {/* Roof */}
      <g opacity={clamp01((build - 0.75) / 0.1)}>
        <path d="M-290 -330L0 -520 290 -330Z" fill="#9d5f57" />
        {[0, 1, 2, 3].map((r) => (
          <path key={r} d={`M${-250 + r * 50} ${-350 - r * 32}H${250 - r * 50}`} stroke="#7a4a44" strokeWidth="6" />
        ))}
      </g>
      {/* Window and door */}
      <g opacity={clamp01((build - 0.6) / 0.1)}>
        <rect x="-200" y="-240" width="90" height="80" rx="8" fill="#ffe9a8" stroke="#6a4428" strokeWidth="8" />
        <path d="M-155 -240V-160M-200 -200H-110" stroke="#6a4428" strokeWidth="6" />
        <rect x="-10" y="-190" width="110" height="190" rx="20" fill="#2a1d14" />
        <g transform={`translate(-10 0) scale(${0.12 + 0.88 * door} 1)`}>
          <rect x="0" y="-190" width="110" height="190" rx="20" fill="#7a5638" stroke="#5a3820" strokeWidth="6" />
          <circle cx="88" cy="-90" r="8" fill="#e8c35a" />
        </g>
      </g>
    </g>
  );
}

export function RainBarrel({ x, y = GROUND_Y, splash = 0 }: { x: number; y?: number; splash?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} data-testid="sb-barrel">
      <path d="M-70 -170Q-84 -85 -70 0H70Q84 -85 70 -170Z" fill="#8a5a34" />
      <path d="M-78 -120H78M-78 -40H78" stroke="#5a5a6a" strokeWidth="10" />
      <ellipse cy="-170" rx="70" ry="16" fill="#7fb8de" />
      {splash > 0 && splash < 1 && (
        <g opacity={1 - splash}>
          {Array.from({ length: 12 }, (_, i) => {
            const a = Math.PI * (0.1 + 0.8 * (i / 11));
            const d = 60 + splash * 200;
            return <circle key={i} cx={-Math.cos(a) * d} cy={-170 - Math.sin(a) * d + splash * splash * 160} r={10 - splash * 6} fill="#9fdcff" />;
          })}
        </g>
      )}
    </g>
  );
}

/** Piles of building materials next to a site. */
export function Pile({ kind, x, y = GROUND_Y, amount = 1 }: { kind: 'wheat' | 'stone' | 'brick'; x: number; y?: number; amount?: number }) {
  const n = Math.round(6 * clamp01(amount));
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: n }, (_, i) => {
        const px = (i % 3) * 52 - 52;
        const py = -Math.floor(i / 3) * 34 - 4;
        if (kind === 'wheat') return <rect key={i} x={px - 20} y={py - 30} width="40" height="34" rx="10" fill="#f2cf63" stroke="#c99a2a" strokeWidth="3" />;
        if (kind === 'stone') return <ellipse key={i} cx={px} cy={py - 14} rx="28" ry="20" fill="#a8b0bc" stroke="#7a8290" strokeWidth="3" />;
        return <rect key={i} x={px - 26} y={py - 28} width="52" height="28" rx="3" fill="#d9775f" stroke="#8f4a3a" strokeWidth="3" />;
      })}
    </g>
  );
}

/* ------------------------------------------------------------- effects */

/** A gust of wind streaking across from (x, y) toward `dir`, strength 0 → 1. */
export function Gust({ x, y, idle, strength, dir = -1, width = 900 }: { x: number; y: number; idle: number; strength: number; dir?: number; width?: number }) {
  if (strength <= 0.01) return null;
  return (
    <g data-testid="sb-gust" opacity={strength} stroke="#ffffff" strokeLinecap="round" fill="none">
      {Array.from({ length: 9 }, (_, i) => {
        const phase = ((idle / 600 + hash(i) * 3) % 1 + 1) % 1;
        const sx = x + dir * phase * width;
        const sy = y + (hash(i + 4) - 0.5) * 260;
        const len = 120 + hash(i + 2) * 160;
        return <path key={i} d={`M${sx} ${sy}q${dir * len * 0.5} -20 ${dir * len} 0`} strokeWidth={6 + hash(i + 8) * 6} opacity={0.5 + 0.5 * Math.sin(phase * Math.PI)} />;
      })}
    </g>
  );
}

/** Twinkling sparkles around a point (idle clock). */
export function Sparkles({ x, y, idle, spread = 120, count = 10, color = '#fff4c2', amount = 1 }: { x: number; y: number; idle: number; spread?: number; count?: number; color?: string; amount?: number }) {
  if (amount <= 0) return null;
  return (
    <g opacity={amount} fill={color}>
      {Array.from({ length: count }, (_, i) => {
        const p = ((idle / 1400 + hash(i)) % 1 + 1) % 1;
        const sx = x + (hash(i + 1) - 0.5) * spread * 2;
        const sy = y + (hash(i + 2) - 0.5) * spread - p * 80;
        const s = Math.sin(p * Math.PI) * (0.6 + hash(i + 3) * 0.8);
        return <path key={i} transform={`translate(${sx} ${sy}) scale(${s})`} d="M0 -14l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" />;
      })}
    </g>
  );
}

/** A dust puff that grows and fades over [at, at + 900ms] of story time. */
export function Dust({ x, y, t, at, size = 1, color = '#f0e2c4' }: { x: number; y: number; t: number; at: number; size?: number; color?: string }) {
  const k = (t - at) / 900;
  if (k < 0 || k > 1) return null;
  return (
    <g opacity={1 - k} fill={color}>
      {[-1, 0, 1].map((s) => (
        <circle key={s} cx={x + s * (40 + 120 * k) * size} cy={y - 20 - 40 * k * size} r={(30 + 50 * k) * size} />
      ))}
    </g>
  );
}

/** An onomatopoeia pop ("Moo!", "Thump!") that springs in and floats away. */
export function Pop({ x, y, t, at, dur = 1400, children, size = 64, color = '#fffaf0' }: { x: number; y: number; t: number; at: number; dur?: number; children: ReactNode; size?: number; color?: string }) {
  const k = (t - at) / dur;
  if (k < 0 || k > 1) return null;
  const s = k < 0.15 ? 0.4 + (k / 0.15) * 0.75 : 1.15 - Math.min(0.15, (k - 0.15) * 0.6);
  return (
    <g transform={`translate(${x} ${y - k * 40}) scale(${s})`} opacity={k > 0.8 ? (1 - k) / 0.2 : 1}>
      <text textAnchor="middle" fontFamily="var(--font-heading), sans-serif" fontWeight="700" fontSize={size} fill={color} stroke="#4a3728" strokeWidth={size / 9} paintOrder="stroke" strokeLinejoin="round">
        {children}
      </text>
    </g>
  );
}

/** Rope with a gentle sag between two points. */
export function Rope({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
  const mx = (from.x + to.x) / 2;
  const my = Math.max(from.y, to.y) + 40;
  return <path d={`M${from.x} ${from.y}Q${mx} ${my} ${to.x} ${to.y}`} stroke="#b07e3e" strokeWidth="6" fill="none" strokeLinecap="round" data-testid="sb-rope" />;
}
