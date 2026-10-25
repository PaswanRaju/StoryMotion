import { memo } from 'react';
import { JACK_BOX } from './timeline';

/**
 * Original vector Jack (or the Adventurer variant), facing the viewer, feet at
 * (0, 0). Every limb is its own group so beanstalk.css can animate story states
 * (walk, climb, sneak, glide…) by the parent's `is-<state>` class.
 */
export const Jack = memo(function Jack({
  variant = 'jack',
}: {
  variant?: 'jack' | 'adventurer';
}) {
  const { x, y, w, h } = JACK_BOX;
  const tunic = variant === 'jack' ? '#4fa35a' : '#e2674f';
  const tunicDark = variant === 'jack' ? '#3b8346' : '#b9493a';
  const id = variant;
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <defs>
        <linearGradient id={`jk-skin-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd9b8" />
          <stop offset="1" stopColor="#f3bb92" />
        </linearGradient>
        <linearGradient id={`jk-tunic-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tunic} />
          <stop offset="1" stopColor={tunicDark} />
        </linearGradient>
        <radialGradient id={`jk-bean-${id}`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#f4ffd0" />
          <stop offset="0.5" stopColor="#8ef06a" />
          <stop offset="1" stopColor="#2f8f3a" />
        </radialGradient>
      </defs>
      <ellipse className="jk-shadow" cx="0" cy="6" rx="62" ry="11" fill="#1d1408" opacity="0.22" />
      <g className="jk-glider">
        <path d="M-150 -300Q0 -400 150 -300Q0 -330 -150 -300Z" fill="#6fc35a" stroke="#3a7d35" strokeWidth="5" />
        <path d="M-150 -300Q0 -330 150 -300M0 -350V-300" stroke="#3a7d35" strokeWidth="4" fill="none" />
        <path d="M-120 -305L-40 -215M120 -305L40 -215" stroke="#c9a26a" strokeWidth="3" />
      </g>
      <g className="jk-body">
        <g className="jk-leg jk-leg--back">
          <rect x="-34" y="-112" width="26" height="100" rx="12" fill="#5a4636" />
          <path d="M-40 -6h36q4 0 4 6v4h-44q-2 -10 4 -10Z" fill="#7a4a2a" />
        </g>
        <g className="jk-leg jk-leg--front">
          <rect x="8" y="-112" width="26" height="100" rx="12" fill="#6a5442" />
          <path d="M4 -6h36q6 0 4 10h-44v-4q0 -6 4 -6Z" fill="#8a5a34" />
        </g>
        <g className="jk-arm jk-arm--back">
          <rect x="-66" y="-196" width="22" height="78" rx="11" fill={tunicDark} />
          <circle cx="-55" cy="-114" r="13" fill={`url(#jk-skin-${id})`} />
        </g>
        <path d="M-50 -200Q-54 -110 -46 -104H46Q54 -110 50 -200Q30 -212 0 -212Q-30 -212 -50 -200Z" fill={`url(#jk-tunic-${id})`} />
        <path d="M-48 -126H48" stroke="#7a4a2a" strokeWidth="10" />
        <rect x="-9" y="-133" width="18" height="14" rx="3" fill="#e8c35a" />
        <path d="M-22 -212L0 -184 22 -212" fill="#f3e6c8" />
        {variant === 'adventurer' && (
          <>
            <path d="M-46 -206Q0 -186 46 -206L40 -192Q0 -176 -40 -192Z" fill="#7fb8de" />
            <rect x="-74" y="-196" width="24" height="62" rx="10" fill="#a8711c" />
          </>
        )}
        <g className="jk-arm jk-arm--front">
          <rect x="44" y="-196" width="22" height="78" rx="11" fill={tunic} />
          <circle cx="55" cy="-114" r="13" fill={`url(#jk-skin-${id})`} />
          <g className="jk-beans">
            <circle className="jk-bean-glow" cx="56" cy="-104" r="34" fill="#c8ff9a" opacity="0.35" />
            <ellipse cx="48" cy="-106" rx="7" ry="9" fill={`url(#jk-bean-${id})`} />
            <ellipse cx="60" cy="-100" rx="7" ry="9" fill={`url(#jk-bean-${id})`} />
            <ellipse cx="62" cy="-112" rx="6" ry="8" fill={`url(#jk-bean-${id})`} />
          </g>
        </g>
        <g className="jk-head">
          <rect x="-12" y="-222" width="24" height="18" fill="#f3bb92" />
          <circle cx="-48" cy="-262" r="10" fill="#f3bb92" />
          <circle cx="48" cy="-262" r="10" fill="#f3bb92" />
          <circle cx="0" cy="-266" r="50" fill={`url(#jk-skin-${id})`} />
          {variant === 'jack' ? (
            <path d="M-52 -268Q-56 -322 -4 -322Q40 -324 52 -282Q46 -300 26 -300Q30 -288 14 -290Q14 -302 -6 -298Q-12 -290 -26 -292Q-30 -282 -52 -268Z" fill="#8a4f2a" />
          ) : (
            <>
              <path d="M-50 -282Q-46 -312 0 -314Q46 -312 50 -282Z" fill="#8a4f2a" />
              <ellipse cx="0" cy="-290" rx="70" ry="12" fill="#c9a26a" />
              <path d="M-38 -292Q-36 -330 0 -332Q36 -330 38 -292Z" fill="#c9a26a" />
              <rect x="-38" y="-300" width="76" height="8" fill="#8a5a3a" />
            </>
          )}
          <g className="jk-face">
            <g className="jk-brows" stroke="#6a3a1e" strokeWidth="4" strokeLinecap="round">
              <path d="M-28 -282q10 -6 20 0" />
              <path d="M8 -282q10 -6 20 0" />
            </g>
            <g className="jk-eyes">
              <ellipse cx="-18" cy="-264" rx="8" ry="10" fill="#fff" />
              <ellipse cx="18" cy="-264" rx="8" ry="10" fill="#fff" />
              <circle className="jk-pupil" cx="-17" cy="-263" r="5.5" fill="#2b2117" />
              <circle className="jk-pupil" cx="19" cy="-263" r="5.5" fill="#2b2117" />
              <circle cx="-15" cy="-266" r="2" fill="#fff" />
              <circle cx="21" cy="-266" r="2" fill="#fff" />
            </g>
            <ellipse cx="-30" cy="-244" rx="9" ry="5" fill="#f29b9b" opacity="0.55" />
            <ellipse cx="30" cy="-244" rx="9" ry="5" fill="#f29b9b" opacity="0.55" />
            <path d="M-3 -252q3 4 6 0" stroke="#d4885e" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path className="jk-mouth jk-mouth--smile" d="M-14 -238Q0 -226 14 -238" stroke="#6a3a1e" strokeWidth="4" fill="none" strokeLinecap="round" />
            <ellipse className="jk-mouth jk-mouth--o" cx="0" cy="-234" rx="8" ry="10" fill="#7a3b3b" />
            <path className="jk-mouth jk-mouth--worry" d="M-12 -232Q0 -240 12 -232" stroke="#6a3a1e" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path className="jk-mouth jk-mouth--grin" d="M-18 -240Q0 -218 18 -240Z" fill="#7a3b3b" stroke="#6a3a1e" strokeWidth="3" strokeLinejoin="round" />
          </g>
        </g>
      </g>
    </svg>
  );
});
