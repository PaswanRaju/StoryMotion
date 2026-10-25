import { memo } from 'react';
import { CLOUD_TILE, MARKS, PARALLAX, VIEW, layerWidth } from './timeline';

/**
 * Original code-drawn forest art. Generated once from a fixed seed so every render
 * is identical; each layer is static and only translated by the camera.
 */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const H = VIEW.height;
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Smooth ridge: sum of sines sampled every 40px, closed to the bottom. */
function ridge(
  width: number,
  base: number,
  waves: readonly [amp: number, period: number, phase: number][],
) {
  let d = `M0 ${H}`;
  for (let x = 0; x <= width + 40; x += 40) {
    const y = waves.reduce(
      (sum, [amp, period, phase]) =>
        sum + amp * Math.sin((x / period) * Math.PI * 2 + phase),
      base,
    );
    d += `L${x} ${r1(y)}`;
  }
  return `${d}L${width + 40} ${H}Z`;
}

function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="20" rx="150" ry="38" fill="url(#fr-cloud)" />
      <circle cx="-60" cy="0" r="52" fill="url(#fr-cloud)" />
      <circle cx="10" cy="-22" r="68" fill="url(#fr-cloud)" />
      <circle cx="80" cy="4" r="48" fill="url(#fr-cloud)" />
    </g>
  );
}

export const SkyLayer = memo(function SkyLayer() {
  return (
    <svg
      viewBox={`0 0 ${VIEW.width} ${H}`}
      role="img"
      aria-label="The Tortoise and the Hare racing along a sunny forest trail"
    >
      <defs>
        <linearGradient id="fr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6fbde8" />
          <stop offset="0.5" stopColor="#b9e2f3" />
          <stop offset="0.78" stopColor="#f6ecd0" />
          <stop offset="1" stopColor="#fbe3b4" />
        </linearGradient>
        <radialGradient id="fr-sun-glow">
          <stop offset="0" stopColor="#fffbe6" stopOpacity="1" />
          <stop offset="0.25" stopColor="#fff2c2" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff2c2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={VIEW.width} height={H} fill="url(#fr-sky)" />
      <circle cx="1540" cy="190" r="460" fill="url(#fr-sun-glow)" />
      <circle cx="1540" cy="190" r="74" fill="#fff8d9" />
    </svg>
  );
});

/** Long soft rays, rotated slowly around the sun by CSS. */
export const SunRays = memo(function SunRays() {
  const rays = Array.from({ length: 14 }, (_, i) => (i / 14) * 360);
  return (
    <svg viewBox="-1400 -1400 2800 2800" aria-hidden="true">
      <defs>
        <radialGradient id="fr-ray" cx="0" cy="0" r="1400" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fffbe8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fffbe8" stopOpacity="0" />
        </radialGradient>
      </defs>
      {rays.map((deg) => (
        <path
          key={deg}
          d="M0 0L1400 -70L1400 70Z"
          fill="url(#fr-ray)"
          transform={`rotate(${deg})`}
        />
      ))}
    </svg>
  );
});

const cloudRandom = seeded(7);
const CLOUDS = Array.from({ length: 6 }, (_, i) => ({
  x: 160 + i * 320 + cloudRandom() * 120,
  y: 90 + cloudRandom() * 220,
  s: 0.55 + cloudRandom() * 0.6,
}));
/** Two identical tiles so the drifting layer can wrap seamlessly. */
export const CloudLayer = memo(function CloudLayer() {
  return (
    <svg viewBox={`0 0 ${CLOUD_TILE * 2} 420`} aria-hidden="true">
      <defs>
        <linearGradient id="fr-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e2eef5" />
        </linearGradient>
      </defs>
      {[0, CLOUD_TILE].map((offset) => (
        <g key={offset} transform={`translate(${offset} 0)`}>
          {CLOUDS.map((cloud, i) => (
            <Cloud key={i} {...cloud} />
          ))}
        </g>
      ))}
    </svg>
  );
});

export const HillsLayer = memo(function HillsLayer() {
  const width = layerWidth(PARALLAX.hills);
  return (
    <svg viewBox={`0 0 ${width} ${H}`} aria-hidden="true">
      <defs>
        <linearGradient id="fr-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6ecd0" stopOpacity="0" />
          <stop offset="1" stopColor="#f6ecd0" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <path
        d={ridge(width, 560, [
          [60, 1300, 0.4],
          [25, 520, 1.7],
        ])}
        fill="#a9cfc4"
      />
      <path
        d={ridge(width, 625, [
          [45, 900, 2.1],
          [18, 380, 0.3],
        ])}
        fill="#93c4a0"
      />
      <rect y="520" width={width} height="240" fill="url(#fr-haze)" />
    </svg>
  );
});

const farRandom = seeded(21);
const FAR_TREES = (() => {
  const trees: { x: number; h: number; kind: 'pine' | 'round' }[] = [];
  for (let x = -20; x < layerWidth(PARALLAX.farTrees); x += 46 + farRandom() * 50)
    trees.push({
      x,
      h: 120 + farRandom() * 110,
      kind: farRandom() > 0.45 ? 'pine' : 'round',
    });
  return trees;
})();
export const FarTreesLayer = memo(function FarTreesLayer() {
  const width = layerWidth(PARALLAX.farTrees);
  const base = 715;
  return (
    <svg viewBox={`0 0 ${width} ${H}`} aria-hidden="true">
      <defs>
        <linearGradient id="fr-far-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eaf4e4" stopOpacity="0" />
          <stop offset="1" stopColor="#eaf4e4" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path
        d={ridge(width, base - 20, [
          [14, 700, 0.8],
          [8, 260, 2],
        ])}
        fill="#7db886"
      />
      {FAR_TREES.map(({ x, h, kind }, i) =>
        kind === 'pine' ? (
          <g key={i}>
            <path
              d={`M${x} ${base - h}L${x + h * 0.32} ${base}L${x - h * 0.32} ${base}Z`}
              fill="#6aa977"
            />
            <path
              d={`M${x} ${base - h}L${x - h * 0.32} ${base}L${x - h * 0.05} ${base}Z`}
              fill="#82bf8a"
            />
          </g>
        ) : (
          <g key={i}>
            <rect x={x - 5} y={base - h * 0.45} width="10" height={h * 0.45} fill="#7d8e6a" />
            <circle cx={x} cy={base - h * 0.62} r={h * 0.3} fill="#74b37d" />
            <circle cx={x - h * 0.1} cy={base - h * 0.7} r={h * 0.16} fill="#8dc795" />
          </g>
        ),
      )}
      <rect y={base - 260} width={width} height="300" fill="url(#fr-far-haze)" />
    </svg>
  );
});

function RoundTree({
  x,
  base,
  trunk,
  r,
  tone,
}: {
  x: number;
  base: number;
  trunk: number;
  r: number;
  tone: number;
}) {
  const dark = tone ? '#3f8a4c' : '#4b9450';
  const mid = tone ? '#5fae5c' : '#6cb663';
  const light = tone ? '#93d27a' : '#a3d983';
  const top = base - trunk;
  return (
    <g>
      <path
        d={`M${x - 16} ${base}C${x - 12} ${base - trunk * 0.5} ${x - 10} ${top + 20} ${x - 6} ${top}L${x + 8} ${top}C${x + 12} ${top + 20} ${x + 14} ${base - trunk * 0.5} ${x + 20} ${base}Z`}
        fill="#7a5638"
      />
      <path
        d={`M${x + 4} ${base}C${x + 6} ${base - trunk * 0.5} ${x + 6} ${top + 20} ${x + 6} ${top}L${x + 8} ${top}C${x + 12} ${top + 20} ${x + 14} ${base - trunk * 0.5} ${x + 20} ${base}Z`}
        fill="#5e412a"
      />
      <circle cx={x - r * 0.55} cy={top + r * 0.1} r={r * 0.62} fill={dark} />
      <circle cx={x + r * 0.55} cy={top + r * 0.05} r={r * 0.66} fill={dark} />
      <circle cx={x} cy={top - r * 0.45} r={r * 0.78} fill={mid} />
      <circle cx={x - r * 0.45} cy={top - r * 0.2} r={r * 0.5} fill={mid} />
      <circle cx={x + r * 0.5} cy={top - r * 0.25} r={r * 0.48} fill={mid} />
      <circle cx={x - r * 0.25} cy={top - r * 0.75} r={r * 0.36} fill={light} />
      <circle cx={x - r * 0.62} cy={top - r * 0.35} r={r * 0.22} fill={light} />
      <circle cx={x + r * 0.2} cy={top - r * 0.95} r={r * 0.18} fill="#c3e69a" opacity="0.8" />
    </g>
  );
}

const midRandom = seeded(99);
const MID_TREES = (() => {
  const trees: { x: number; trunk: number; r: number; tone: number }[] = [];
  for (let x = 40; x < layerWidth(PARALLAX.midTrees); x += 170 + midRandom() * 140)
    trees.push({
      x,
      trunk: 150 + midRandom() * 110,
      r: 85 + midRandom() * 55,
      tone: midRandom() > 0.5 ? 1 : 0,
    });
  return trees;
})();
export const MidTreesLayer = memo(function MidTreesLayer() {
  const width = layerWidth(PARALLAX.midTrees);
  const base = 790;
  return (
    <svg viewBox={`0 0 ${width} ${H}`} aria-hidden="true">
      <path
        d={ridge(width, base - 30, [
          [10, 500, 1.2],
          [6, 170, 0.2],
        ])}
        fill="#7fbf6a"
      />
      {MID_TREES.map((tree, i) => (
        <RoundTree key={i} base={base} {...tree} />
      ))}
      {MID_TREES.map(({ x }, i) => (
        <g key={`b${i}`} fill={i % 2 ? '#5aa456' : '#68b05d'}>
          <circle cx={x + 80} cy={base - 8} r="42" />
          <circle cx={x + 125} cy={base + 2} r="34" />
          <circle cx={x + 45} cy={base + 6} r="30" />
        </g>
      ))}
    </svg>
  );
});

function Flower({ x, y, color, s }: { x: number; y: number; color: string; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0V22" stroke="#4f8f45" strokeWidth="3" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse key={deg} cx="0" cy="-7" rx="5" ry="8" fill={color} transform={`rotate(${deg})`} />
      ))}
      <circle r="4.5" fill="#f7c948" />
    </g>
  );
}
function Rock({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-34 0C-36 -22 -18 -36 2 -34C22 -33 36 -18 34 0Z" fill="#a9a29a" />
      <path d="M-20 -26C-10 -34 8 -34 16 -28C4 -26 -8 -22 -20 -12Z" fill="#c9c3ba" />
      <path d="M8 0C20 -6 30 -14 34 -2V0Z" fill="#8c857d" />
    </g>
  );
}
function Bunting({ x1, x2, y, sag }: { x1: number; x2: number; y: number; sag: number }) {
  const colors = ['#e8775f', '#f5bf72', '#7fb8de', '#a9d7a0', '#d99ad0'];
  const flags = [];
  const n = Math.round((x2 - x1) / 34);
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const fx = x1 + (x2 - x1) * t;
    const fy = y + sag * 4 * t * (1 - t);
    flags.push(
      <path key={i} d={`M${fx - 12} ${fy}L${fx + 12} ${fy}L${fx} ${fy + 26}Z`} fill={colors[i % colors.length]} />,
    );
  }
  return (
    <g>
      <path d={`M${x1} ${y}Q${(x1 + x2) / 2} ${y + sag * 2} ${x2} ${y}`} stroke="#8b6a4a" strokeWidth="3" fill="none" />
      {flags}
    </g>
  );
}
function Post({ x, base, h }: { x: number; base: number; h: number }) {
  return (
    <g>
      <rect x={x - 9} y={base - h} width="18" height={h} rx="5" fill="#9a6e47" />
      <rect x={x - 9} y={base - h} width="7" height={h} rx="3" fill="#b8865a" />
    </g>
  );
}

const groundRandom = seeded(4242);
const TRAIL_TOP = (x: number) => 815 + 10 * Math.sin(x / 260) + 6 * Math.sin(x / 97);
const TRAIL_BOTTOM = (x: number) => 985 + 12 * Math.sin(x / 310 + 1) + 5 * Math.sin(x / 83);
const GROUND = (() => {
  const width = layerWidth(PARALLAX.ground);
  let trailTop = `M0 ${r1(TRAIL_TOP(0))}`;
  let trailBottom = '';
  for (let x = 0; x <= width; x += 30) trailTop += `L${x} ${r1(TRAIL_TOP(x))}`;
  for (let x = width; x >= 0; x -= 30) trailBottom += `L${x} ${r1(TRAIL_BOTTOM(x))}`;
  let blades = '';
  for (let i = 0; i < 900; i++) {
    const x = groundRandom() * width;
    const band = groundRandom();
    const y =
      band < 0.45
        ? 740 + groundRandom() * (TRAIL_TOP(x) - 750)
        : TRAIL_BOTTOM(x) + 8 + groundRandom() * 90;
    const h = 10 + groundRandom() * 18;
    const lean = (groundRandom() - 0.5) * 12;
    blades += `M${r1(x)} ${r1(y)}q${r1(lean / 2)} ${r1(-h / 2)} ${r1(lean)} ${r1(-h)}`;
  }
  const flowerColors = ['#f4a3b5', '#ffffff', '#f7d26a', '#c7a7e8', '#ef8f7a'];
  const flowers = Array.from({ length: 150 }, () => {
    const x = groundRandom() * width;
    const above = groundRandom() > 0.5;
    return {
      x,
      y: above ? 755 + groundRandom() * 45 : TRAIL_BOTTOM(x) + 25 + groundRandom() * 70,
      color: flowerColors[Math.floor(groundRandom() * flowerColors.length)],
      s: 0.7 + groundRandom() * 0.6,
    };
  });
  const pebbles = Array.from({ length: 140 }, () => {
    const x = groundRandom() * width;
    return {
      x,
      y: TRAIL_TOP(x) + 18 + groundRandom() * (TRAIL_BOTTOM(x) - TRAIL_TOP(x) - 30),
      r: 2 + groundRandom() * 4,
    };
  });
  const rocks = Array.from({ length: 16 }, (_, i) => {
    const x = 150 + i * 340 + groundRandom() * 150;
    return { x, y: TRAIL_TOP(x) - 4, s: 0.6 + groundRandom() * 0.7 };
  });
  return { width, trail: `${trailTop}${trailBottom}Z`, blades, flowers, pebbles, rocks };
})();

function NapOak({ x }: { x: number }) {
  const base = 812;
  return (
    <g>
      <ellipse cx={x + 20} cy={base + 70} rx="300" ry="55" fill="#2f5d2c" opacity="0.18" />
      <path
        d={`M${x - 70} ${base}C${x - 40} ${base - 40} ${x - 40} ${base - 160} ${x - 30} ${base - 300}L${x + 50} ${base - 300}C${x + 55} ${base - 160} ${x + 60} ${base - 40} ${x + 100} ${base}Z`}
        fill="#7a5638"
      />
      <path
        d={`M${x + 20} ${base}C${x + 30} ${base - 120} ${x + 35} ${base - 200} ${x + 40} ${base - 300}L${x + 50} ${base - 300}C${x + 55} ${base - 160} ${x + 60} ${base - 40} ${x + 100} ${base}Z`}
        fill="#5e412a"
      />
      <path d={`M${x - 70} ${base}q-40 6 -60 18M${x + 100} ${base}q40 6 60 16`} stroke="#6b4a30" strokeWidth="16" strokeLinecap="round" fill="none" />
      <ellipse cx={x + 8} cy={base - 150} rx="14" ry="20" fill="#4a3220" />
      {[
        [-150, -330, 120, '#3f8a4c'],
        [160, -320, 125, '#3f8a4c'],
        [0, -420, 150, '#5fae5c'],
        [-120, -400, 100, '#5fae5c'],
        [130, -410, 105, '#5fae5c'],
        [-60, -500, 90, '#93d27a'],
        [60, -480, 80, '#7cc46c'],
        [-170, -440, 50, '#93d27a'],
      ].map(([dx, dy, r, fill], i) => (
        <circle key={i} cx={x + Number(dx)} cy={base + Number(dy)} r={r} fill={String(fill)} />
      ))}
      <circle cx={x - 40} cy={base - 540} r="34" fill="#c3e69a" opacity="0.8" />
    </g>
  );
}

function Checkers({ x, y, w, h, cell }: { x: number; y: number; w: number; h: number; cell: number }) {
  const squares = [];
  for (let cx = 0; cx < w / cell; cx++)
    for (let cy = 0; cy < h / cell; cy++)
      if ((cx + cy) % 2 === 0)
        squares.push(<rect key={`${cx}-${cy}`} x={x + cx * cell} y={y + cy * cell} width={cell} height={cell} fill="#3d3a36" />);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#fffaf0" />
      {squares}
    </g>
  );
}

function Gate({ x, finish }: { x: number; finish: boolean }) {
  const base = 818;
  const h = finish ? 330 : 270;
  return (
    <g>
      <Post x={x - 130} base={base} h={h} />
      <Post x={x + 130} base={base} h={h} />
      {finish ? (
        <>
          <path d={`M${x - 150} ${base - h + 10}h300v58h-300Z`} fill="#c75c4a" />
          <Checkers x={x - 140} y={base - h + 18} w={280} h={42} cell={14} />
          <Bunting x1={x - 130} x2={x + 130} y={base - h + 80} sag={18} />
        </>
      ) : (
        <Bunting x1={x - 130} x2={x + 130} y={base - h + 20} sag={28} />
      )}
    </g>
  );
}

export const GroundLayer = memo(function GroundLayer() {
  const { width, trail, blades, flowers, pebbles, rocks } = GROUND;
  return (
    <svg viewBox={`0 0 ${width} ${H}`} aria-hidden="true">
      <defs>
        <linearGradient id="fr-meadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fcb72" />
          <stop offset="1" stopColor="#5ea84f" />
        </linearGradient>
        <linearGradient id="fr-trail" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3c58f" />
          <stop offset="0.5" stopColor="#efd7a6" />
          <stop offset="1" stopColor="#d8b47b" />
        </linearGradient>
      </defs>
      <path
        d={ridge(width, 742, [
          [8, 420, 0.5],
          [4, 130, 1.1],
        ])}
        fill="url(#fr-meadow)"
      />
      <NapOak x={MARKS.nap + 80} />
      <Gate x={MARKS.tortoiseStart - 40} finish={false} />
      <Gate x={MARKS.finish} finish />
      {rocks.map((rock, i) => (
        <Rock key={i} {...rock} />
      ))}
      <path d={trail} fill="url(#fr-trail)" />
      <path d={trail} fill="none" stroke="#c99e64" strokeWidth="4" opacity="0.6" />
      {pebbles.map(({ x, y, r }, i) => (
        <ellipse key={i} cx={r1(x)} cy={r1(y)} rx={r1(r * 1.4)} ry={r1(r)} fill="#c6a679" opacity="0.7" />
      ))}
      {/* Chalk start and checkered finish lines across the trail */}
      <path d={`M${MARKS.tortoiseStart - 60} 822L${MARKS.tortoiseStart - 20} 982`} stroke="#fffaf0" strokeWidth="12" opacity="0.85" />
      <g transform={`translate(${MARKS.finish} 822) skewX(14)`}>
        <Checkers x={-18} y={0} w={36} h={160} cell={12} />
      </g>
      <path d={blades} stroke="#4f9a45" strokeWidth="3" strokeLinecap="round" fill="none" />
      {flowers.map((flower, i) => (
        <Flower key={i} {...flower} />
      ))}
    </svg>
  );
});

const fgRandom = seeded(777);
const FOREGROUND = (() => {
  const width = layerWidth(PARALLAX.foreground);
  const tufts: { x: number; h: number; tone: number }[] = [];
  for (let x = 0; x < width; x += 90 + fgRandom() * 260)
    tufts.push({ x, h: 50 + fgRandom() * 80, tone: fgRandom() > 0.5 ? 1 : 0 });
  const ferns = Array.from({ length: 10 }, (_, i) => ({
    x: 300 + i * 680 + fgRandom() * 200,
    s: 0.8 + fgRandom() * 0.5,
    flip: fgRandom() > 0.5,
  }));
  return { width, tufts, ferns };
})();

function Fern({ x, s, flip }: { x: number; s: number; flip: boolean }) {
  const leaves = Array.from({ length: 7 }, (_, i) => i);
  return (
    <g transform={`translate(${x} ${H + 10}) scale(${flip ? -s : s} ${s})`}>
      <path d="M0 0Q30 -120 120 -190" stroke="#2f6e33" strokeWidth="8" fill="none" strokeLinecap="round" />
      {leaves.map((i) => {
        const t = (i + 1) / 8;
        const px = 120 * t * t + 30 * t;
        const py = -190 * t;
        return (
          <g key={i} transform={`translate(${px} ${py})`}>
            <ellipse cx="-26" cy="-8" rx="30" ry="10" fill="#3c8a3e" transform="rotate(-30)" />
            <ellipse cx="22" cy="6" rx="28" ry="9" fill="#2f7a35" transform="rotate(25)" />
          </g>
        );
      })}
    </g>
  );
}

export const ForegroundLayer = memo(function ForegroundLayer() {
  const { width, tufts, ferns } = FOREGROUND;
  return (
    <svg viewBox={`0 0 ${width} ${H}`} aria-hidden="true">
      {ferns.map((fern, i) => (
        <Fern key={i} {...fern} />
      ))}
      {tufts.map(({ x, h, tone }, i) => (
        <path
          key={i}
          d={`M${x - 40} ${H}Q${x - 30} ${H - h * 0.6} ${x - 45} ${H - h}Q${x - 12} ${H - h * 0.55} ${x} ${H - h * 1.15}Q${x + 10} ${H - h * 0.5} ${x + 42} ${H - h * 0.9}Q${x + 30} ${H - h * 0.4} ${x + 40} ${H}Z`}
          fill={tone ? '#3f8f40' : '#4c9c46'}
        />
      ))}
    </svg>
  );
});

/** Soft diagonal light shafts and a warm vignette, layered over the world. */
export const LightLayer = memo(function LightLayer() {
  return (
    <svg viewBox={`0 0 ${VIEW.width} ${H}`} aria-hidden="true">
      <defs>
        <linearGradient id="fr-beam" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6d2" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff6d2" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="fr-vignette" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.6" stopColor="#3a2614" stopOpacity="0" />
          <stop offset="1" stopColor="#3a2614" stopOpacity="0.32" />
        </radialGradient>
      </defs>
      <g className="forest-beams">
        <path d="M1500 0h120L900 1080H640Z" fill="url(#fr-beam)" />
        <path d="M1700 0h70L1200 1080H1050Z" fill="url(#fr-beam)" opacity="0.7" />
        <path d="M1250 0h60L380 1080H230Z" fill="url(#fr-beam)" opacity="0.55" />
      </g>
      <rect width={VIEW.width} height={H} fill="url(#fr-vignette)" />
    </svg>
  );
});
