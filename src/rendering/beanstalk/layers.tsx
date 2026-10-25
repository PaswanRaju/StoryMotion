import { memo } from 'react';
import {
  STALK_LEAVES,
  CLOUD_Y,
  COTTAGE_X,
  GROUND_VIEW,
  GROUND_Y,
  PARALLAX,
  STALK_TOP_Y,
  WORLD_H,
  layerHeight,
  stalkX,
} from './timeline';

/** Seeded random so the art is identical on every render. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}
const W = 1920;

function Cloud({ x, y, s = 1, tone = '#ffffff', opacity = 1 }: { x: number; y: number; s?: number; tone?: string; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <ellipse cx="0" cy="20" rx="170" ry="44" fill={tone} />
      <circle cx="-80" cy="0" r="56" fill={tone} />
      <circle cx="10" cy="-26" r="78" fill={tone} />
      <circle cx="100" cy="4" r="54" fill={tone} />
      <ellipse cx="0" cy="34" rx="150" ry="20" fill="#dfe8ff" opacity="0.5" />
    </g>
  );
}

/** Distant hills at the bottom; high cloud banks and floating islands above. */
export const FarLayer = memo(function FarLayer() {
  const h = layerHeight(PARALLAX.far);
  const at = (screenY: number) => GROUND_VIEW * PARALLAX.far + screenY;
  const rnd = seeded(31);
  const banks = Array.from({ length: 9 }, (_, i) => ({
    x: rnd() * W,
    y: 120 + i * ((at(500) - 300) / 9),
    s: 1.4 + rnd() * 1.2,
  }));
  return (
    <svg viewBox={`0 0 ${W} ${h}`} width={W} height={h} aria-hidden="true">
      {banks.map((b, i) => (
        <Cloud key={i} x={b.x} y={b.y} s={b.s} tone="#eef3ff" opacity={0.55} />
      ))}
      {[
        [320, 260, 1],
        [1560, 420, 0.8],
      ].map(([x, y, s], i) => (
        <g key={i} className="bs-island" transform={`translate(${x} ${y}) scale(${s})`}>
          <path d="M-120 0Q0 30 120 0L40 120Q0 150 -40 120Z" fill="#a07a5a" />
          <ellipse cx="0" cy="0" rx="124" ry="20" fill="#8fd27a" />
          <circle cx="-40" cy="-30" r="30" fill="#6cbf63" />
          <rect x="-44" y="-10" width="8" height="14" fill="#7a5638" />
          <path d="M40 -20l14 -40 14 40Z" fill="#f4ecff" />
        </g>
      ))}
      <g transform={`translate(0 ${at(560)})`}>
        <path d={`M0 200Q240 40 520 160T1080 120T1560 170T${W} 110V600H0Z`} fill="#b6dcc0" />
        <path d={`M0 300Q300 170 640 260T1300 230T${W} 250V600H0Z`} fill="#9ccf9f" />
      </g>
    </svg>
  );
});

/** Mid-distance clouds at every altitude: the climb rushes past them. */
export const MidLayer = memo(function MidLayer() {
  const h = layerHeight(PARALLAX.mid);
  const rnd = seeded(77);
  const clouds = Array.from({ length: 22 }, (_, i) => ({
    x: (i % 2 ? 1500 : 300) + (rnd() - 0.5) * 600,
    y: 300 + i * ((h - 1500) / 22),
    s: 0.7 + rnd() * 0.9,
  }));
  return (
    <svg viewBox={`0 0 ${W} ${h}`} width={W} height={h} aria-hidden="true">
      {clouds.map((c, i) => (
        <g key={i} className={`bs-drift bs-drift--${i % 3}`}>
          <Cloud x={c.x} y={c.y} s={c.s} opacity={0.92} />
        </g>
      ))}
    </svg>
  );
});

function Cottage({ x }: { x: number }) {
  const base = GROUND_Y + 10;
  return (
    <g transform={`translate(${x} ${base})`}>
      <ellipse cx="0" cy="8" rx="260" ry="30" fill="#2f5d2c" opacity="0.25" />
      <rect x="-190" y="-250" width="380" height="250" rx="12" fill="#f3e0c0" />
      <path d="M-190 -250h380v250h-380Z" fill="none" stroke="#c9a27a" strokeWidth="6" />
      <path d="M-230 -240L0 -420 230 -240Z" fill="#b8664a" />
      <path d="M-230 -240L0 -420 230 -240" fill="none" stroke="#8f4a36" strokeWidth="10" strokeLinejoin="round" />
      {[-180, -120, -60, 0, 60, 120, 180].map((dx) => (
        <path key={dx} d={`M${dx - 40} -${250 + Math.max(0, 140 - Math.abs(dx) * 0.8)}l40 30`} stroke="#9e5640" strokeWidth="4" opacity="0.6" />
      ))}
      <rect x="110" y="-430" width="44" height="110" fill="#9a6e5a" />
      <g className="bs-smoke">
        <circle cx="132" cy="-460" r="18" fill="#fff" opacity="0.7" />
        <circle cx="146" cy="-500" r="24" fill="#fff" opacity="0.5" />
        <circle cx="128" cy="-548" r="30" fill="#fff" opacity="0.35" />
      </g>
      <rect x="-40" y="-150" width="80" height="150" rx="38" fill="#7a5638" />
      <circle cx="22" cy="-72" r="6" fill="#e8c35a" />
      <rect x="-160" y="-190" width="80" height="70" rx="8" fill="#ffe9a8" className="bs-window" />
      <path d="M-120 -190v70M-160 -155h80" stroke="#8a6142" strokeWidth="6" />
      <rect x="80" y="-190" width="80" height="70" rx="8" fill="#ffe9a8" className="bs-window" />
      <path d="M120 -190v70M80 -155h80" stroke="#8a6142" strokeWidth="6" />
      {[-150, -110, 100, 140].map((fx) => (
        <circle key={fx} cx={fx} cy={-110} r="10" fill={fx < 0 ? '#f4a3b5' : '#f7d26a'} />
      ))}
    </g>
  );
}

function Tree({ x, s = 1 }: { x: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${GROUND_Y + 10}) scale(${s})`} className="bs-tree">
      <rect x="-14" y="-200" width="28" height="200" rx="8" fill="#7a5638" />
      <circle cx="0" cy="-250" r="110" fill="#5fae5c" />
      <circle cx="-70" cy="-210" r="70" fill="#4f9a4e" />
      <circle cx="70" cy="-220" r="76" fill="#6cbf63" />
      <circle cx="-20" cy="-300" r="60" fill="#7cc46c" />
    </g>
  );
}

/** The world at scale 1: the garden at the bottom, the cloud kingdom at the top. */
export const GroundLayer = memo(function GroundLayer() {
  const h = WORLD_H + 40;
  const rnd = seeded(5);
  const flowers = Array.from({ length: 70 }, () => ({
    x: rnd() * W,
    y: GROUND_Y + 30 + rnd() * 160,
    c: ['#f4a3b5', '#ffffff', '#f7d26a', '#c7a7e8'][Math.floor(rnd() * 4)],
  }));
  let grass = '';
  for (let i = 0; i < 260; i++) {
    const x = rnd() * W;
    const y = GROUND_Y + 20 + rnd() * 200;
    grass += `M${x.toFixed(0)} ${y.toFixed(0)}q4 -12 ${(rnd() * 10 - 5).toFixed(1)} -${(14 + rnd() * 16).toFixed(0)}`;
  }
  return (
    <svg
      viewBox={`0 0 ${W} ${h}`}
      width={W}
      height={h}
      role="img"
      aria-label="Jack and the Beanstalk: a cottage garden far below a magic beanstalk and a castle in the clouds"
    >
      <defs>
        <linearGradient id="bs-meadow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd27a" />
          <stop offset="1" stopColor="#4f9a45" />
        </linearGradient>
        <radialGradient id="bs-castle-glow" cx="0.5" cy="0.6" r="0.55">
          <stop offset="0" stopColor="#fff2c2" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff2c2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bs-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2ecff" />
          <stop offset="1" stopColor="#c9bfe8" />
        </linearGradient>
      </defs>

      {/* ---------- Cloud kingdom ---------- */}
      <g className="bs-castle">
        <ellipse cx="1450" cy="620" rx="520" ry="420" fill="url(#bs-castle-glow)" />
        <g className="bs-rays" opacity="0.5">
          {[-50, -25, 0, 25, 50].map((r) => (
            <path key={r} d="M1450 520L1420 -200H1480Z" fill="#fff6d0" opacity="0.5" transform={`rotate(${r} 1450 520)`} />
          ))}
        </g>
        <rect x="1180" y="360" width="540" height="560" fill="url(#bs-stone)" />
        <rect x="1110" y="200" width="150" height="720" fill="url(#bs-stone)" />
        <rect x="1640" y="200" width="150" height="720" fill="url(#bs-stone)" />
        <rect x="1380" y="120" width="140" height="300" fill="url(#bs-stone)" />
        <path d="M1095 205L1185 60 1275 205ZM1625 205L1715 60 1805 205ZM1365 125L1450 -10 1535 125Z" fill="#9b7bdc" />
        {[1185, 1715, 1450].map((x, i) => (
          <g key={x} className="bs-flag" style={{ animationDelay: `${i * 0.4}s` }}>
            <path d={`M${x} ${i === 2 ? -10 : 60}v-60`} stroke="#7a5aa8" strokeWidth="5" />
            <path d={`M${x} ${i === 2 ? -70 : 0}l60 16 -60 16Z`} fill="#ffd36e" />
          </g>
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <rect key={i} x={1180 + i * 50} y="330" width="30" height="34" fill="url(#bs-stone)" />
        ))}
        <path d="M1380 920V720Q1450 640 1520 720V920Z" fill="#6a4fa0" />
        <path d="M1450 640V920" stroke="#523a86" strokeWidth="6" />
        {[
          [1160, 360],
          [1690, 360],
          [1160, 560],
          [1690, 560],
          [1420, 200],
          [1280, 520],
          [1590, 520],
        ].map(([x, y], i) => (
          <rect key={i} className="bs-window" x={x} y={y} width="44" height="64" rx="22" fill="#ffe08a" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </g>
      <g className="bs-cloud-floor">
        <rect x="0" y={CLOUD_Y + 40} width={W} height="380" fill="#ffffff" />
        {Array.from({ length: 13 }, (_, i) => (
          <circle key={i} cx={i * 160} cy={CLOUD_Y + 60 + (i % 2) * 30} r={110 + (i % 3) * 25} fill="#ffffff" />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={80 + i * 200} cy={CLOUD_Y + 260} r="120" fill="#eef2ff" />
        ))}
        <rect x="0" y={CLOUD_Y + 300} width={W} height="300" fill="#eef2ff" />
        <ellipse cx={stalkX(STALK_TOP_Y)} cy={CLOUD_Y + 60} rx="120" ry="26" fill="#dfe6ff" />
      </g>

      {/* ---------- The garden ---------- */}
      <path d={`M0 ${GROUND_Y - 30}Q480 ${GROUND_Y - 80} 960 ${GROUND_Y - 30}T${W} ${GROUND_Y - 40}V${h}H0Z`} fill="url(#bs-meadow)" />
      <Tree x={140} s={1.1} />
      <Tree x={1780} s={1.2} />
      <Tree x={1560} s={0.8} />
      <g>
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={1250 + i * 50} y={GROUND_Y - 70} width="14" height="80" rx="4" fill="#d9b48a" />
        ))}
        <path d={`M1240 ${GROUND_Y - 50}h460M1240 ${GROUND_Y - 20}h460`} stroke="#c9a27a" strokeWidth="8" />
      </g>
      <Cottage x={COTTAGE_X} />
      <path d={`M${COTTAGE_X - 30} ${GROUND_Y + 10}Q${COTTAGE_X + 200} ${GROUND_Y + 60} 1000 ${GROUND_Y + 40}`} stroke="#e8cf9e" strokeWidth="60" fill="none" strokeLinecap="round" />
      <ellipse cx={stalkX(GROUND_Y)} cy={GROUND_Y + 18} rx="110" ry="26" fill="#7a5638" />
      <ellipse cx={stalkX(GROUND_Y)} cy={GROUND_Y + 12} rx="90" ry="16" fill="#8d6646" />
      <path d={grass} stroke="#3f8a3a" strokeWidth="3" fill="none" strokeLinecap="round" className="bs-grass" />
      {flowers.map((f, i) => (
        <g key={i} transform={`translate(${f.x.toFixed(0)} ${f.y.toFixed(0)})`}>
          <circle r="7" fill={f.c} />
          <circle r="3" fill="#f7d26a" />
        </g>
      ))}
    </svg>
  );
});

/** Leaves rushing past the lens during the climb; tufts of grass at the bottom. */
export const ForeLayer = memo(function ForeLayer() {
  const h = layerHeight(PARALLAX.fore);
  const rnd = seeded(91);
  const leaves = Array.from({ length: 18 }, (_, i) => ({
    x: i % 2 ? 1800 + rnd() * 120 : rnd() * 120,
    y: 600 + i * ((h - 2200) / 18),
    r: (rnd() - 0.5) * 80,
    s: 0.7 + rnd() * 0.6,
    flip: i % 2 ? -1 : 1,
  }));
  return (
    <svg viewBox={`0 0 ${W} ${h}`} width={W} height={h} aria-hidden="true">
      {leaves.map((l, i) => (
        <g key={i} transform={`translate(${l.x.toFixed(0)} ${l.y.toFixed(0)}) rotate(${l.r.toFixed(0)}) scale(${l.flip * l.s} ${l.s})`}>
          <path d="M0 0C60 -90 200 -70 240 0C200 70 60 90 0 0Z" fill="#3f8a4c" opacity="0.75" />
          <path d="M0 0Q120 -6 236 0" stroke="#2f6d3a" strokeWidth="5" fill="none" />
        </g>
      ))}
      <g transform={`translate(0 ${GROUND_VIEW * PARALLAX.fore + 960})`}>
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M${i * 150} 140q20 -110 40 -120q-6 60 20 120Z`} fill="#2f6d3a" opacity="0.9" />
        ))}
      </g>
    </svg>
  );
});

/** Beanstalk path from the garden (start) to the clouds (end), so a dash draws it upward. */
const STALK_PATH = (() => {
  let d = `M${stalkX(GROUND_Y).toFixed(1)} ${GROUND_Y + 10}`;
  for (let y = GROUND_Y; y >= STALK_TOP_Y; y -= 40) d += `L${stalkX(y).toFixed(1)} ${y}`;
  return d;
})();
const VINE_PATH = (() => {
  let d = '';
  for (let y = GROUND_Y; y >= STALK_TOP_Y; y -= 30) {
    const x = stalkX(y) + 34 * Math.sin(y / 60);
    d += `${d ? 'L' : 'M'}${x.toFixed(1)} ${y}`;
  }
  return d;
})();
export const Beanstalk = memo(function Beanstalk() {
  const h = WORLD_H + 40;
  return (
    <svg viewBox={`0 0 ${W} ${h}`} width={W} height={h} aria-hidden="true">
      <defs>
        <linearGradient id="bs-stalk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2f7d3c" />
          <stop offset="0.5" stopColor="#5fbf5a" />
          <stop offset="1" stopColor="#2f7d3c" />
        </linearGradient>
      </defs>
      <path className="bs-stalk-glow" d={STALK_PATH} stroke="#b8ff8a" strokeWidth="90" fill="none" strokeLinecap="round" opacity="0" />
      <path className="bs-stalk" d={STALK_PATH} stroke="url(#bs-stalk)" strokeWidth="54" fill="none" strokeLinecap="round" />
      <path className="bs-stalk bs-stalk--light" d={STALK_PATH} stroke="#9be08a" strokeWidth="12" fill="none" strokeLinecap="round" transform="translate(-10 0)" />
      <path className="bs-vine" d={VINE_PATH} stroke="#3f9a4c" strokeWidth="12" fill="none" strokeLinecap="round" />
      {STALK_LEAVES.map((leaf, i) => (
        <g key={i} className="bs-leaf" transform={`translate(${leaf.x.toFixed(1)} ${leaf.y.toFixed(0)})`}>
          <g className="bs-leaf-inner" style={{ transform: 'scale(0)' }}>
            <g transform={`scale(${leaf.side * leaf.s} ${leaf.s}) rotate(-18)`}>
              <path d="M0 0C40 -70 150 -60 180 0C150 50 40 60 0 0Z" fill="#6cc45f" />
              <path d="M0 0Q90 -4 176 0" stroke="#3f8a4c" strokeWidth="5" fill="none" />
            </g>
          </g>
        </g>
      ))}
    </svg>
  );
});
