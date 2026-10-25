import { Hare, Tortoise } from '../../rendering/forest/characters';
import { Jack } from '../../rendering/beanstalk/Jack';
import '../../rendering/beanstalk/beanstalk.css';
import type { StoryId } from '../../engine/types';
import '../../rendering/forest/forest.css';
import './storyArt.css';

/**
 * Original vector cover art and character portraits for the menus. The Tortoise and
 * Hare are the same animated characters as in the story; the others are drawn here
 * in the same rounded, soft-shaded style. No image files involved.
 */

function Clouds() {
  return (
    <g className="art-clouds" fill="#fffaf0">
      <g opacity="0.95">
        <ellipse cx="110" cy="70" rx="58" ry="20" />
        <ellipse cx="92" cy="58" rx="30" ry="20" />
        <ellipse cx="128" cy="56" rx="24" ry="17" />
      </g>
      <g opacity="0.85">
        <ellipse cx="470" cy="96" rx="50" ry="16" />
        <ellipse cx="452" cy="86" rx="24" ry="16" />
      </g>
    </g>
  );
}
function Sparkles({ color = '#fff4c2' }: { color?: string }) {
  return (
    <g className="art-sparkles" fill={color}>
      {[
        [80, 150, 1],
        [530, 60, 0.8],
        [330, 40, 0.6],
        [590, 190, 0.9],
      ].map(([x, y, s], i) => (
        <path
          key={i}
          className="art-sparkle"
          style={{ animationDelay: `${i * 0.6}s` }}
          transform={`translate(${x} ${y}) scale(${s})`}
          d="M0 -12l3.5 8.5 8.5 3.5-8.5 3.5-3.5 8.5-3.5-8.5-8.5-3.5 8.5-3.5z"
        />
      ))}
    </g>
  );
}

function ForestCover() {
  return (
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="cv-forest-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd0f0" />
          <stop offset="1" stopColor="#e9f7ef" />
        </linearGradient>
        <radialGradient id="cv-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6cf" />
          <stop offset="0.5" stopColor="#ffe08a" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ffe08a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="400" fill="url(#cv-forest-sky)" />
      <circle className="art-sun" cx="520" cy="80" r="90" fill="url(#cv-sun)" />
      <Clouds />
      <path d="M0 250Q120 190 250 236T520 222T640 240V400H0Z" fill="#a8d8a0" />
      <g className="art-trees-far" fill="#7cbf74">
        {[30, 110, 190, 270, 350, 430, 510, 590].map((x, i) => (
          <g key={x}>
            <rect x={x - 5} y={210 + (i % 2) * 8} width="10" height="40" fill="#8a6446" />
            <circle cx={x} cy={196 + (i % 2) * 8} r={34 + (i % 3) * 6} />
          </g>
        ))}
      </g>
      <path d="M0 290Q160 262 320 286T640 280V400H0Z" fill="#6cb663" />
      <path className="art-trail" d="M-20 352Q200 300 330 318T660 300V346Q470 352 330 362T-20 400Z" fill="#efd7a6" />
      <g transform="translate(560 262)">
        <rect x="-36" y="-70" width="8" height="72" rx="3" fill="#9a6e47" />
        <rect x="28" y="-70" width="8" height="72" rx="3" fill="#9a6e47" />
        <rect x="-40" y="-78" width="80" height="16" rx="4" fill="#c75c4a" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect key={i} x={-38 + i * 10} y={-76 + (i % 2) * 6} width="6" height="6" fill="#fffaf0" />
        ))}
      </g>
      <Sparkles />
    </svg>
  );
}

function BeanstalkCover() {
  // A poster: the cottage far below, a giant twisting beanstalk, a glowing castle
  // on a cloud island, drifting clouds, light rays and glowing magic beans.
  let stalk = 'M300 420';
  for (let y = 400; y >= -20; y -= 20)
    stalk += `L${(300 + 34 * Math.sin(y / 60) + 14 * Math.sin(y / 23)).toFixed(1)} ${y}`;
  let vine = '';
  for (let y = 410; y >= -10; y -= 12)
    vine += `${vine ? 'L' : 'M'}${(300 + 34 * Math.sin(y / 60) + 14 * Math.sin(y / 23) + 16 * Math.sin(y / 14)).toFixed(1)} ${y}`;
  return (
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="cv-bean-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a5fd0" />
          <stop offset="0.45" stopColor="#9a8cf0" />
          <stop offset="0.8" stopColor="#ffd6b8" />
          <stop offset="1" stopColor="#ffe9c8" />
        </linearGradient>
        <radialGradient id="cv-castle-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff2c2" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff2c2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cv-stalk" x1="0" x2="1">
          <stop offset="0" stopColor="#2f7d3c" />
          <stop offset="0.5" stopColor="#6cc45f" />
          <stop offset="1" stopColor="#2f7d3c" />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#cv-bean-sky)" />
      <g className="art-rays" opacity="0.55">
        {[-30, -15, 0, 15, 30].map((r) => (
          <path key={r} d="M480 120L465 -200H495Z" fill="#fff6d0" opacity="0.5" transform={`rotate(${r} 480 120)`} />
        ))}
      </g>
      <circle className="art-sun" cx="480" cy="110" r="120" fill="url(#cv-castle-glow)" />
      <g className="art-castle" transform="translate(480 120)">
        <ellipse cx="0" cy="44" rx="150" ry="30" fill="#ffffff" />
        <ellipse cx="-70" cy="36" rx="60" ry="24" fill="#f4f6ff" />
        <ellipse cx="80" cy="38" rx="70" ry="24" fill="#f4f6ff" />
        <rect x="-50" y="-40" width="100" height="80" fill="#f2ecff" />
        <rect x="-74" y="-70" width="30" height="110" fill="#e8e0ff" />
        <rect x="44" y="-70" width="30" height="110" fill="#e8e0ff" />
        <rect x="-14" y="-96" width="28" height="70" fill="#f2ecff" />
        <path d="M-78 -70l19 -34 19 34ZM40 -70l19 -34 19 34ZM-18 -96l18 -32 18 32Z" fill="#9b7bdc" />
        {[-60, 58, 0, -26, 26].map((x, i) => (
          <rect key={i} className="art-window" x={x - 6} y={i < 2 ? -50 : i === 2 ? -80 : -10} width="12" height="18" rx="6" fill="#ffe08a" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
        <path d="M-12 40V14Q0 2 12 14V40Z" fill="#6a4fa0" />
      </g>
      <g className="art-clouds" fill="#fffaf0">
        <g opacity="0.9">
          <ellipse cx="90" cy="70" rx="64" ry="20" />
          <ellipse cx="70" cy="58" rx="32" ry="20" />
          <ellipse cx="110" cy="54" rx="26" ry="18" />
        </g>
        <g opacity="0.75">
          <ellipse cx="200" cy="200" rx="50" ry="14" />
          <ellipse cx="610" cy="240" rx="56" ry="16" />
        </g>
      </g>
      <path d="M0 360Q160 330 320 352T640 346V400H0Z" fill="#7cc46c" />
      <g transform="translate(70 352) scale(0.7)">
        <rect x="0" y="-40" width="90" height="60" rx="6" fill="#f3e0c0" />
        <path d="M-12 -38L45 -82 102 -38Z" fill="#b8664a" />
        <rect x="34" y="-14" width="22" height="34" rx="10" fill="#7a5638" />
        <rect x="8" y="-28" width="18" height="16" rx="3" fill="#ffe9a8" />
      </g>
      <g className="art-vine">
        <path d={stalk} stroke="url(#cv-stalk)" strokeWidth="30" fill="none" strokeLinecap="round" />
        <path d={stalk} stroke="#a8e58a" strokeWidth="6" fill="none" strokeLinecap="round" transform="translate(-6 0)" />
        <path d={vine} stroke="#3f9a4c" strokeWidth="6" fill="none" strokeLinecap="round" />
        {[
          [270, 350, -30],
          [340, 300, 30],
          [262, 240, -40],
          [336, 180, 35],
          [270, 120, -30],
          [330, 60, 30],
          [276, 10, -25],
        ].map(([x, y, r], i) => (
          <ellipse key={i} className="art-leaf" style={{ animationDelay: `${i * 0.35}s` }} cx={x} cy={y} rx="40" ry="14" fill={i % 2 ? '#6cc45f' : '#93d27a'} transform={`rotate(${r} ${x} ${y})`} />
        ))}
      </g>
      <g className="art-beans" transform="translate(520 360)">
        <circle className="art-bean-glow" r="34" fill="#c8ff9a" opacity="0.5" />
        <ellipse cx="-12" cy="0" rx="9" ry="12" fill="#6ee05a" />
        <ellipse cx="6" cy="4" rx="9" ry="12" fill="#8ef06a" />
        <ellipse cx="14" cy="-8" rx="8" ry="11" fill="#6ee05a" />
      </g>
      <Sparkles color="#fff9e0" />
    </svg>
  );
}

function PigsCover() {
  return (
    <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="cv-pig-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd59a" />
          <stop offset="0.7" stopColor="#ffeccf" />
          <stop offset="1" stopColor="#fff6e6" />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill="url(#cv-pig-sky)" />
      <circle className="art-sun" cx="110" cy="80" r="46" fill="#fff4c2" />
      <Clouds />
      <path d="M0 270Q160 230 330 262T640 250V400H0Z" fill="#a9d7a0" />
      <g transform="translate(430 160)">
        <rect x="0" y="40" width="160" height="120" fill="#cf896b" stroke="#8f5e4b" strokeWidth="4" />
        {[62, 84, 106, 128, 150].map((y) => (
          <path key={y} d={`M0 ${y}h160`} stroke="#f4c5a5" strokeWidth="3" />
        ))}
        {[20, 60, 100, 140].map((x, i) => (
          <path key={x} d={`M${x + (i % 2) * 10} 40v120`} stroke="#f4c5a5" strokeWidth="2" opacity="0.5" />
        ))}
        <path d="M-16 42L80 -30 176 42Z" fill="#9d5f57" />
        <rect x="60" y="100" width="40" height="60" rx="18" fill="#735446" />
        <rect x="18" y="64" width="28" height="28" fill="#cde9ed" stroke="#8f5e4b" strokeWidth="3" />
        <path className="art-smoke" d="M128 -10q-10 -20 6 -34q-12 -20 4 -34" stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.8" />
      </g>
      <g className="art-wind" stroke="#ffffff" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.8">
        <path d="M20 170q60 -16 120 0" />
        <path d="M40 200q50 -12 100 0" />
      </g>
      <Sparkles color="#ffffff" />
    </svg>
  );
}

const PIG_HATS: Record<string, string> = {
  'pig-one': '#f2cf63', // straw
  'pig-two': '#a8774f', // wood
  'pig-three': '#e8775f', // brick
};
/** A friendly pig; each sibling has their own building hat. */
function Pig({ id }: { id: string }) {
  return (
    <svg className="art-pig" viewBox="-60 -120 120 130" aria-hidden="true">
      <ellipse cy="4" rx="42" ry="7" fill="#2b1d10" opacity="0.18" />
      <g className="art-pig__body">
        <rect x="-26" y="-22" width="14" height="24" rx="7" fill="#e58f9e" />
        <rect x="12" y="-22" width="14" height="24" rx="7" fill="#e58f9e" />
        <ellipse cy="-38" rx="38" ry="34" fill="#f4b3bd" />
        <path d="M-30 -86l-8 -22 22 12Z M30 -86l8 -22 -22 12Z" fill="#e58f9e" />
        <circle cy="-76" r="28" fill="#f7c2ca" />
        <ellipse cy="-68" rx="13" ry="9" fill="#e58f9e" />
        <circle cx="-5" cy="-68" r="2.4" fill="#8a4a5a" />
        <circle cx="5" cy="-68" r="2.4" fill="#8a4a5a" />
        <g className="char-eye">
          <circle cx="-11" cy="-84" r="3.2" fill="#2b2117" />
          <circle cx="11" cy="-84" r="3.2" fill="#2b2117" />
        </g>
        <path d="M-6 -56Q0 -52 6 -56" stroke="#8a4a5a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <g fill={PIG_HATS[id] ?? '#f2cf63'}>
          <ellipse cy="-100" rx="30" ry="6" />
          <path d="M-18 -102Q-16 -120 0 -120Q16 -120 18 -102Z" />
        </g>
      </g>
    </svg>
  );
}

/** Portrait of one character, animated by CSS (idle bob, blinking). */
export function CharacterArt({
  storyId,
  characterId,
}: {
  storyId: StoryId;
  characterId: string;
}) {
  if (storyId === 'hare')
    return (
      <div className="forest-scene art-stage" aria-hidden="true">
        <div className={`forest-actor ${characterId === 'hare' ? 'hare is-confident' : 'tortoise is-idle'}`}>
          {characterId === 'hare' ? <Hare /> : <Tortoise />}
        </div>
      </div>
    );
  if (storyId === 'beanstalk')
    return (
      <div className="forest-scene art-stage" aria-hidden="true">
        <div className="jack is-idle">
          <Jack variant={characterId === 'adventurer' ? 'adventurer' : 'jack'} />
        </div>
      </div>
    );
  return (
    <div className="forest-scene art-stage" aria-hidden="true">
      <Pig id={characterId} />
    </div>
  );
}

/** Full illustrated cover: scene plus the story's main characters. */
export function StoryCover({ storyId }: { storyId: StoryId }) {
  return (
    <div className={`story-cover story-cover--${storyId}`} aria-hidden="true">
      <div className="story-cover__scene">
        {storyId === 'hare' ? (
          <ForestCover />
        ) : storyId === 'beanstalk' ? (
          <BeanstalkCover />
        ) : (
          <PigsCover />
        )}
      </div>
      <div className="forest-scene story-cover__cast">
        {storyId === 'hare' && (
          <>
            <div className="forest-actor tortoise is-walk cast-a">
              <Tortoise />
            </div>
            <div className="forest-actor hare is-laugh cast-b">
              <Hare />
            </div>
          </>
        )}
        {storyId === 'beanstalk' && (
          <div className="cast-a jack is-climb">
            <Jack />
          </div>
        )}
        {storyId === 'pigs' && (
          <>
            <div className="cast-a">
              <Pig id="pig-one" />
            </div>
            <div className="cast-b">
              <Pig id="pig-two" />
            </div>
            <div className="cast-c">
              <Pig id="pig-three" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
