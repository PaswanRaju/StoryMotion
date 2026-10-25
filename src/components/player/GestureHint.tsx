import type { BodyGesture } from '../../vision/bodyGestures';

/**
 * A friendly animated figure that shows the child the move — no reading needed.
 * Pure SVG + CSS (automaticStory.css). Rotating groups are nested so each one
 * pivots around its own origin: the body leans from the feet, arms swing from
 * the shoulders.
 */
export function GestureHint({ gesture }: { gesture: BodyGesture }) {
  return (
    <svg
      className={`gesture-hint gesture-hint--${gesture.toLowerCase().replace('_', '-')}`}
      viewBox="-60 -70 120 130"
      width="92"
      height="100"
      aria-hidden="true"
    >
      <circle className="gesture-hint__halo" r="54" cy="-8" />
      <g transform="translate(0 44)">
        <g className="gesture-hint__body">
          <g transform="translate(0 -44)">
            <path d="M0 -24V12M0 12L-12 44M0 12L12 44" className="gesture-hint__limb" />
            <g transform="translate(0 -18)">
              <g className="gesture-hint__arm gesture-hint__arm--left">
                <path d="M0 0L-20 20" className="gesture-hint__limb" />
              </g>
              <g className="gesture-hint__arm gesture-hint__arm--right">
                <path d="M0 0L20 20" className="gesture-hint__limb" />
              </g>
            </g>
            <circle cx="0" cy="-38" r="13" className="gesture-hint__head" />
            <circle cx="-4.5" cy="-40" r="1.8" fill="#4a3728" />
            <circle cx="4.5" cy="-40" r="1.8" fill="#4a3728" />
            <path d="M-5 -34q5 4 10 0" stroke="#4a3728" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          </g>
        </g>
      </g>
      <g className="gesture-hint__sparkles">
        <path d="M-40 -46l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
        <path d="M40 -30l2.4 5.6 5.6 2.4-5.6 2.4-2.4 5.6-2.4-5.6-5.6-2.4 5.6-2.4z" />
      </g>
    </svg>
  );
}
