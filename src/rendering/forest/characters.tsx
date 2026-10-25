import { memo } from 'react';
import { FORK_BOX, HARE_BOX, TORTOISE_BOX } from './timeline';

/**
 * Original vector characters, facing right, with the feet/ground point at (0, 0).
 * Named groups are animated by forest.css according to the parent's mood class.
 */

export const Tortoise = memo(function Tortoise() {
  const { x, y, w, h } = TORTOISE_BOX;
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <defs>
        <radialGradient id="tt-shell" cx="0.38" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#9fd07a" />
          <stop offset="0.6" stopColor="#6ea84f" />
          <stop offset="1" stopColor="#4d8338" />
        </radialGradient>
        <linearGradient id="tt-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bfe08f" />
          <stop offset="1" stopColor="#93c46a" />
        </linearGradient>
        <radialGradient id="tt-glow" cx="0.35" cy="0.25" r="0.75">
          <stop offset="0" stopColor="#fffbe0" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#ffd36e" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffd36e" stopOpacity="0" />
        </radialGradient>
        <clipPath id="tt-dome">
          <path d="M-112 -50C-112 -150 -44 -192 0 -192C44 -192 112 -150 112 -50Z" />
        </clipPath>
      </defs>
      <ellipse className="char-shadow" cx="5" cy="4" rx="125" ry="15" fill="#2b1d10" opacity="0.2" />
      <g className="tt-body">
        <g className="tt-leg tt-leg--far-back">
          <rect x="-82" y="-58" width="42" height="58" rx="19" fill="#7aa654" />
        </g>
        <g className="tt-leg tt-leg--far-front">
          <rect x="44" y="-58" width="42" height="58" rx="19" fill="#7aa654" />
        </g>
        <path d="M-108 -46L-146 -30Q-128 -22 -104 -28Z" fill="#93c46a" />
        <g className="tt-head">
          <path d="M70 -62Q108 -78 124 -112L162 -86Q134 -44 84 -36Z" fill="url(#tt-skin)" />
          <ellipse cx="158" cy="-118" rx="46" ry="38" fill="url(#tt-skin)" />
          <path d="M120 -142Q150 -160 186 -140" stroke="#86b85f" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.6" />
          <ellipse cx="162" cy="-99" rx="11" ry="7" fill="#f29b9b" opacity="0.6" />
          <g className="char-eye">
            <ellipse cx="168" cy="-128" rx="11" ry="13" fill="#fff" />
            <circle cx="172" cy="-127" r="7.5" fill="#2b2117" />
            <circle cx="175" cy="-131" r="2.6" fill="#fff" />
          </g>
          <path className="tt-smile" d="M174 -104Q186 -96 196 -108" stroke="#3a5a28" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <circle cx="199" cy="-120" r="2.3" fill="#3a5a28" />
        </g>
        <g className="tt-leg tt-leg--back">
          <rect x="-92" y="-56" width="48" height="62" rx="21" fill="#98c96d" />
          <path d="M-88 0h40" stroke="#6f9a4c" strokeWidth="5" strokeLinecap="round" />
        </g>
        <g className="tt-leg tt-leg--front">
          <rect x="34" y="-56" width="48" height="62" rx="21" fill="#98c96d" />
          <path d="M38 0h40" stroke="#6f9a4c" strokeWidth="5" strokeLinecap="round" />
        </g>
        <g className="tt-shell">
          <path d="M-124 -40Q-122 -64 -100 -66H100Q122 -64 124 -40Q0 -18 -124 -40Z" fill="#e2c07f" />
          <path d="M-118 -44Q0 -26 118 -44" stroke="#c39b58" strokeWidth="4" fill="none" />
          <path d="M-112 -50C-112 -150 -44 -192 0 -192C44 -192 112 -150 112 -50Z" fill="url(#tt-shell)" />
          <g clipPath="url(#tt-dome)" fill="#8fc56b" stroke="#3f6e2c" strokeWidth="4" strokeLinejoin="round">
            <path d="M-30 -158L30 -158L48 -122L30 -86L-30 -86L-48 -122Z" />
            <path d="M-48 -122L-30 -86L-58 -56L-110 -56L-104 -112L-74 -150Z" />
            <path d="M48 -122L30 -86L58 -56L110 -56L104 -112L74 -150Z" />
            <path d="M-30 -158L30 -158L46 -196L-46 -196Z" />
            <path d="M-30 -86L30 -86L58 -56L-58 -56Z" />
          </g>
          <path d="M-112 -50C-112 -150 -44 -192 0 -192C44 -192 112 -150 112 -50Z" fill="none" stroke="#3f6e2c" strokeWidth="5" />
          <path d="M-74 -146Q-44 -176 -6 -180" stroke="#fff" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.32" />
        </g>
        {/* Magic light on the shell; invisible except in magic/energized states. */}
        <path className="tt-glow" d="M-112 -50C-112 -150 -44 -192 0 -192C44 -192 112 -150 112 -50Z" fill="url(#tt-glow)" />
      </g>
    </svg>
  );
});

export const Hare = memo(function Hare() {
  const { x, y, w, h } = HARE_BOX;
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <defs>
        <radialGradient id="hr-fur" cx="0.4" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#e8bf8e" />
          <stop offset="1" stopColor="#c48b57" />
        </radialGradient>
      </defs>
      <ellipse className="char-shadow" cx="0" cy="4" rx="100" ry="14" fill="#2b1d10" opacity="0.2" />
      <g className="hr-body">
        <g className="hr-leg-far">
          <rect x="52" y="-74" width="20" height="74" rx="10" fill="#b07a4a" />
        </g>
        <circle cx="-92" cy="-92" r="22" fill="#fff8ee" />
        <g className="hr-leg-back">
          <ellipse cx="-46" cy="-56" rx="52" ry="46" fill="url(#hr-fur)" />
          <ellipse cx="-16" cy="-9" rx="58" ry="13" fill="#b07a4a" />
        </g>
        <ellipse cx="4" cy="-96" rx="66" ry="56" fill="url(#hr-fur)" transform="rotate(-24 4 -96)" />
        <ellipse cx="34" cy="-84" rx="30" ry="42" fill="#f7e6cb" transform="rotate(-24 34 -84)" />
        <g className="hr-leg-front">
          <rect x="34" y="-76" width="24" height="76" rx="12" fill="url(#hr-fur)" />
          <ellipse cx="52" cy="-4" rx="18" ry="8" fill="#b07a4a" />
        </g>
        <g className="hr-head">
          <g className="hr-ears">
            <ellipse cx="44" cy="-246" rx="15" ry="58" fill="#b07a4a" transform="rotate(-14 44 -246)" />
            <g className="hr-ear">
              <ellipse cx="72" cy="-252" rx="18" ry="62" fill="url(#hr-fur)" transform="rotate(8 72 -252)" />
              <ellipse cx="73" cy="-248" rx="8" ry="44" fill="#f2b5bd" transform="rotate(8 73 -248)" />
            </g>
          </g>
          <circle cx="74" cy="-168" r="48" fill="url(#hr-fur)" />
          <ellipse cx="106" cy="-150" rx="26" ry="20" fill="#f7e6cb" />
          <ellipse cx="80" cy="-146" rx="11" ry="7" fill="#f29b9b" opacity="0.55" />
          <g className="char-eye hr-eye-open">
            <ellipse cx="92" cy="-180" rx="11" ry="14" fill="#fff" />
            <circle cx="96" cy="-179" r="7.5" fill="#2b2117" />
            <circle cx="99" cy="-183" r="2.6" fill="#fff" />
          </g>
          <path className="hr-eye-closed" d="M82 -178Q93 -170 104 -178" stroke="#2b2117" strokeWidth="4" fill="none" strokeLinecap="round" />
          <ellipse cx="126" cy="-158" rx="8" ry="6" fill="#e17f90" />
          <path className="hr-mouth" d="M118 -142Q112 -134 104 -138" stroke="#6a4630" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <ellipse className="hr-mouth-open" cx="112" cy="-138" rx="7" ry="9" fill="#7a3b3b" />
          <path d="M112 -154l30 -6M112 -150l30 4" stroke="#8b6a4a" strokeWidth="2" opacity="0.6" />
        </g>
      </g>
      <g className="hr-zzz" fill="none" stroke="#5a6fa8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path className="hr-z hr-z1" d="M100 -200h18l-18 18h18" />
        <path className="hr-z hr-z2" d="M124 -236h24l-24 24h24" />
        <path className="hr-z hr-z3" d="M150 -280h30l-30 30h30" />
      </g>
      <g className="hr-surprise" stroke="#e8775f" strokeWidth="6" strokeLinecap="round">
        <path d="M140 -250l18 -22M150 -214l28 -6M132 -280l2 -28" />
      </g>
    </svg>
  );
});

/** Small cheering audience of forest friends. */
export const Crowd = memo(function Crowd() {
  return (
    <svg viewBox="-170 -120 340 130" width="340" height="130" aria-hidden="true">
      <g className="crowd-friend">
        <ellipse cx="-120" cy="-30" rx="38" ry="30" fill="#8a6446" />
        <path d="M-156 -36l-14 -18 16 4-4-20 16 12 2-22 12 18 8-20 6 22 14-14-2 22" fill="#6e4d33" />
        <circle cx="-88" cy="-34" r="16" fill="#e8c9a4" />
        <circle cx="-82" cy="-38" r="3" fill="#2b2117" />
        <circle cx="-74" cy="-32" r="3" fill="#2b2117" />
      </g>
      <g className="crowd-friend crowd-friend--2">
        <path d="M-10 -12Q-60 -40 -40 -100Q-20 -60 -8 -40Z" fill="#e48b3f" />
        <ellipse cx="0" cy="-36" rx="22" ry="30" fill="#ef9a4c" />
        <circle cx="6" cy="-74" r="18" fill="#ef9a4c" />
        <path d="M-4 -88l-2 -14 10 8M12 -88l6 -12 2 12" fill="#ef9a4c" />
        <circle cx="12" cy="-76" r="3" fill="#2b2117" />
        <ellipse cx="4" cy="-30" rx="12" ry="18" fill="#fbe1c3" />
      </g>
      <g className="crowd-friend crowd-friend--3">
        <ellipse cx="80" cy="-30" rx="24" ry="22" fill="#7fb8de" />
        <circle cx="94" cy="-50" r="14" fill="#7fb8de" />
        <path d="M106 -52l12 4-12 4Z" fill="#f5bf72" />
        <circle cx="98" cy="-54" r="2.8" fill="#2b2117" />
        <path d="M60 -34q-14 -10 -6 -24q10 8 18 14Z" fill="#5e9cc4" />
        <path d="M76 -8v8M86 -8v8" stroke="#f5bf72" strokeWidth="3" />
      </g>
      <g className="crowd-friend crowd-friend--4">
        <ellipse cx="140" cy="-28" rx="22" ry="26" fill="#f1ece4" />
        <circle cx="146" cy="-60" r="16" fill="#f1ece4" />
        <ellipse cx="140" cy="-92" rx="5" ry="18" fill="#f1ece4" />
        <ellipse cx="152" cy="-92" rx="5" ry="18" fill="#f1ece4" />
        <circle cx="151" cy="-62" r="2.8" fill="#2b2117" />
        <ellipse cx="160" cy="-56" rx="3" ry="2.4" fill="#e17f90" />
      </g>
    </svg>
  );
});

/** Shimmering protective bubble for ARMS_WIDE. */
export function Shield({ rx, ry }: { rx: number; ry: number }) {
  return (
    <svg viewBox={`${-rx - 10} ${-ry - 10} ${rx * 2 + 20} ${ry * 2 + 20}`} width={rx * 2 + 20} height={ry * 2 + 20} aria-hidden="true">
      <defs>
        <radialGradient id={`shield-${rx}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0.6" stopColor="#bfe6ff" stopOpacity="0.08" />
          <stop offset="0.92" stopColor="#8fd0ff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.9" />
        </radialGradient>
      </defs>
      <ellipse rx={rx} ry={ry} fill={`url(#shield-${rx})`} stroke="#e6f6ff" strokeWidth="4" />
      <ellipse className="shield-orbit" rx={rx - 6} ry={ry - 6} fill="none" stroke="#ffd36e" strokeWidth="5" strokeDasharray="3 26" strokeLinecap="round" />
      <ellipse className="shield-rim" rx={rx} ry={ry} fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
      <path d={`M${-rx * 0.55} ${-ry * 0.55}Q${-rx * 0.2} ${-ry * 0.85} ${rx * 0.2} ${-ry * 0.8}`} stroke="#fff" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  );
}

/**
 * The fork in the trail: a signpost (left board → shady woods, right board → sunny
 * meadow) and two glowing branch ribbons. forest.css highlights the chosen side.
 * Local origin: (0, 0) is the post's foot; ribbons start under the approaching Tortoise.
 */
export const ForkSign = memo(function ForkSign() {
  const { x, y, w, h } = FORK_BOX;
  // Trail-relative lanes (see LANES/actor-lane): shady −38 px, sunny +26 px.
  const lane = 105; // tortoise feet below the post foot
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <defs>
        <linearGradient id="fork-fade" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.15" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.8" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="fork-mask">
          <rect x={x} y={y} width={w} height={h} fill="url(#fork-fade)" />
        </mask>
      </defs>
      <g mask="url(#fork-mask)" fill="none" strokeLinecap="round">
        <path className="fork-ribbon fork-ribbon--shady" d={`M-660 ${lane}C-260 ${lane} -60 ${lane - 38} 300 ${lane - 38}L960 ${lane - 38}`} stroke="#9fe08a" strokeWidth="34" />
        <path className="fork-ribbon fork-ribbon--sunny" d={`M-660 ${lane}C-260 ${lane} -60 ${lane + 26} 300 ${lane + 26}L960 ${lane + 26}`} stroke="#ffd36e" strokeWidth="34" />
      </g>
      <g className="fork-post">
        <rect x="-10" y="-250" width="20" height="252" rx="6" fill="#8a6142" />
        <rect x="-10" y="-250" width="8" height="252" rx="4" fill="#a87a52" />
        <g className="fork-board fork-board--shady">
          <path d="M-12 -232H-176L-212 -196L-176 -160H-12Z" fill="#4f8f4a" stroke="#2f5d2c" strokeWidth="5" strokeLinejoin="round" />
          <path d="M-112 -176l-22 -38-22 38Z M-104 -184l-14 -26-14 26Z" fill="#c3e69a" transform="translate(20 4)" />
          <rect x="-98" y="-178" width="6" height="12" fill="#c3e69a" />
        </g>
        <g className="fork-board fork-board--sunny">
          <path d="M12 -142H176L212 -106L176 -70H12Z" fill="#e8a93c" stroke="#a8711c" strokeWidth="5" strokeLinejoin="round" />
          <circle cx="94" cy="-106" r="16" fill="#fff4c2" />
          <path d="M94 -136v8M94 -84v8M64 -106h8M116 -106h8M73 -127l6 6M109 -91l6 6M73 -85l6 -6M109 -121l6 -6" stroke="#fff4c2" strokeWidth="5" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
});
