import { memo } from 'react';
import { INSIDE_FLOOR } from './timeline';

/**
 * The giant's hall, drawn at stage scale (1920×1080). Everything is oversized next
 * to Jack (who is drawn at half size here): a towering door, a table whose top is
 * above the frame, a spoon taller than Jack, a candle, footprints, a treasure chest
 * with the golden harp, and the friendly sleeping giant's boots on a stool.
 * Animated parts (flame, Zzz, harp notes, stirring boots) are classes in beanstalk.css.
 */
export const CastleInterior = memo(function CastleInterior() {
  const F = INSIDE_FLOOR;
  return (
    <svg viewBox="0 0 1920 1080" width="1920" height="1080" aria-hidden="true">
      <defs>
        <linearGradient id="ci-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a5a9a" />
          <stop offset="1" stopColor="#4a3f78" />
        </linearGradient>
        <linearGradient id="ci-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8774f" />
          <stop offset="1" stopColor="#7a5236" />
        </linearGradient>
        <radialGradient id="ci-fire" cx="0.5" cy="0.8" r="0.7">
          <stop offset="0" stopColor="#fff2b0" />
          <stop offset="0.4" stopColor="#ffb04a" />
          <stop offset="1" stopColor="#ff7a3a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ci-gold" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6c8" />
          <stop offset="1" stopColor="#ffd36e" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ci-wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6a4428" />
          <stop offset="0.5" stopColor="#8a5a34" />
          <stop offset="1" stopColor="#5a3820" />
        </linearGradient>
      </defs>
      {/* Wall of huge stones */}
      <rect width="1920" height={F} fill="url(#ci-wall)" />
      {Array.from({ length: 6 }, (_, row) =>
        Array.from({ length: 6 }, (_, col) => (
          <rect
            key={`${row}-${col}`}
            x={col * 360 - (row % 2) * 180}
            y={row * 170}
            width="352"
            height="162"
            rx="18"
            fill="#5d4f8c"
            opacity="0.55"
          />
        )),
      )}
      {/* Window to the cloud kingdom */}
      <g>
        <path d="M820 120Q960 -20 1100 120V420H820Z" fill="#bfe6ff" />
        <circle cx="900" cy="300" r="60" fill="#ffffff" opacity="0.9" />
        <circle cx="1010" cy="330" r="46" fill="#ffffff" opacity="0.8" />
        <path d="M960 40V420M820 260H1100" stroke="#3a2f60" strokeWidth="16" />
        <path d="M820 120Q960 -20 1100 120V420H820Z" fill="none" stroke="#3a2f60" strokeWidth="20" />
      </g>
      {/* Towering door, slightly open, light spilling in */}
      <g>
        <path d={`M40 ${F}V160Q230 -60 420 160V${F}Z`} fill="#3a2a1a" />
        <path d={`M70 ${F}V180Q230 0 390 180V${F}Z`} fill="url(#ci-wood)" />
        <path d={`M300 ${F}V200L390 180V${F}Z`} fill="#fff3c8" opacity="0.85" className="ci-doorlight" />
        <circle cx="270" cy="600" r="22" fill="#e8c35a" />
        {[260, 420, 580, 740, 900].map((y) => (
          <path key={y} d={`M70 ${y}H300`} stroke="#5a3820" strokeWidth="10" />
        ))}
      </g>
      {/* Floor and giant footprints */}
      <rect y={F} width="1920" height={1080 - F} fill="url(#ci-floor)" />
      {Array.from({ length: 10 }, (_, i) => (
        <path key={i} d={`M${i * 200} ${F}l-30 80`} stroke="#6a4428" strokeWidth="4" opacity="0.6" />
      ))}
      {[
        [560, F + 30, -8],
        [880, F + 52, 6],
      ].map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`} opacity="0.35">
          <ellipse rx="120" ry="20" fill="#4a2f1c" />
          <ellipse cx="150" rx="40" ry="16" fill="#4a2f1c" />
        </g>
      ))}
      {/* Enormous table: only the legs fit in the frame */}
      <g>
        <rect x="560" y="0" width="120" height={F} fill="url(#ci-wood)" />
        <rect x="1060" y="0" width="120" height={F} fill="url(#ci-wood)" />
        <rect x="500" y="0" width="760" height="70" fill="#5a3820" />
        <path d={`M560 ${F - 40}h120M1060 ${F - 40}h120`} stroke="#4a2f1c" strokeWidth="14" />
      </g>
      {/* Giant spoon leaning on the table leg */}
      <g transform={`translate(700 ${F}) rotate(-14)`}>
        <rect x="-14" y="-560" width="28" height="520" rx="12" fill="#c9cfe0" />
        <ellipse cx="0" cy="-620" rx="70" ry="100" fill="#dfe4f2" />
        <ellipse cx="-14" cy="-640" rx="26" ry="50" fill="#ffffff" opacity="0.6" />
      </g>
      {/* Huge candle with a flickering flame */}
      <g transform={`translate(460 ${F})`}>
        <rect x="-60" y="-300" width="120" height="300" rx="12" fill="#fff4dc" />
        <path d="M-60 -300q30 30 60 0q30 30 60 0" fill="#fff4dc" stroke="#f1d9a8" strokeWidth="4" />
        <circle cx="0" cy="-380" r="90" fill="url(#ci-gold)" className="ci-candle-glow" />
        <path className="ci-flame" d="M0 -310C-30 -340 -16 -390 0 -420C16 -390 30 -340 0 -310Z" fill="#ffb04a" />
        <path className="ci-flame" d="M0 -318C-14 -336 -8 -366 0 -384C8 -366 14 -336 0 -318Z" fill="#fff2b0" />
      </g>
      {/* Fireplace glow on the right */}
      <g>
        <rect x="1500" y="420" width="420" height={F - 420} fill="#3a2a1a" />
        <path d={`M1540 ${F}V520Q1710 400 1880 520V${F}Z`} fill="#1d140c" />
        <ellipse className="ci-fire" cx="1710" cy={F - 60} rx="160" ry="150" fill="url(#ci-fire)" />
      </g>
      {/* Treasure chest with the golden harp */}
      <g transform={`translate(1250 ${F})`}>
        <circle cx="70" cy="-330" r="200" fill="url(#ci-gold)" className="ci-harp-glow" />
        <rect x="-110" y="-170" width="360" height="170" rx="16" fill="#8a5a34" />
        <path d="M-110 -170Q70 -270 250 -170Z" fill="#a8774f" />
        <rect x="50" y="-150" width="40" height="50" rx="8" fill="#e8c35a" />
        <path d="M-110 -110H250M-110 -60H250" stroke="#5a3820" strokeWidth="10" />
        <g className="ci-harp" transform="translate(70 -230)">
          <path d="M-60 0Q-70 -170 20 -210Q70 -170 60 0Z" fill="none" stroke="#ffcc4d" strokeWidth="16" strokeLinejoin="round" />
          {[-40, -20, 0, 20, 40].map((x) => (
            <path key={x} d={`M${x} -6V${-150 + Math.abs(x) * 0.6}`} stroke="#fff2b0" strokeWidth="3" />
          ))}
          <circle cx="20" cy="-210" r="14" fill="#ffcc4d" />
        </g>
        <g className="ci-notes" fill="#fff2b0">
          <path className="ci-note" d="M150 -300v-40l20 -6v34a10 10 0 1 1 -6 -8v-20l-8 2v32a10 10 0 1 1 -6 -6Z" />
          <path className="ci-note ci-note--2" d="M-20 -330v-40l20 -6v34a10 10 0 1 1 -6 -8v-20l-8 2v32a10 10 0 1 1 -6 -6Z" />
          <path className="ci-note ci-note--3" d="M80 -400v-40l20 -6v34a10 10 0 1 1 -6 -8v-20l-8 2v32a10 10 0 1 1 -6 -6Z" />
        </g>
      </g>
      {/* The friendly sleeping giant: just his boots on a footstool, and his snores */}
      <g className="ci-giant">
        <rect x="1600" y={F - 220} width="300" height="220" rx="30" fill="#7a5aa8" />
        <g className="ci-boots">
          {/* Cushioned footstool */}
          <rect x="1380" y={F - 210} width="420" height="60" rx="30" fill="#c79bff" />
          <rect x="1400" y={F - 160} width="30" height="160" rx="10" fill="#6a4428" />
          <rect x="1750" y={F - 160} width="30" height="160" rx="10" fill="#6a4428" />
          {/* Trouser legs coming in from the right edge */}
          <rect x="1660" y={F - 560} width="300" height="150" rx="40" fill="#3f5f94" />
          <rect x="1700" y={F - 400} width="260" height="140" rx="40" fill="#4a6fa8" />
          {/* Two giant boots, toes up, resting on the stool */}
          {[
            [F - 520, '#7a4e30', '#5a3820'],
            [F - 360, '#8a5a34', '#6a4428'],
          ].map(([y, upper, sole], i) => (
            <g key={i} transform={`translate(0 ${y})`}>
              <path d="M1720 -10H1560Q1430 -10 1420 70Q1416 120 1470 130H1720Z" fill={String(upper)} />
              <path d="M1470 130Q1410 126 1412 70Q1414 40 1430 20" fill="none" stroke={String(sole)} strokeWidth="26" strokeLinecap="round" />
              <path d="M1560 20l40 30M1590 10l40 30M1620 0l40 30" stroke="#e8d2a8" strokeWidth="6" strokeLinecap="round" />
              <ellipse cx="1500" cy="40" rx="28" ry="14" fill="#ffffff" opacity="0.18" />
            </g>
          ))}
        </g>
        <g className="ci-zzz" fill="none" stroke="#e6ecff" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
          <path className="ci-z ci-z1" d="M1580 300h50l-50 50h50" />
          <path className="ci-z ci-z2" d="M1640 200h70l-70 70h70" />
          <path className="ci-z ci-z3" d="M1720 80h90l-90 90h90" />
        </g>
        <g className="ci-stir">
          <circle cx="1640" cy="250" r="70" fill="#fffaf0" />
          <text x="1640" y="275" textAnchor="middle" fontSize="80" fontFamily="var(--font-heading)" fill="#6a4fa0">
            ?!
          </text>
        </g>
      </g>
      {/* Warm vignette */}
      <rect width="1920" height="1080" fill="url(#ci-gold)" opacity="0.12" />
    </svg>
  );
});
