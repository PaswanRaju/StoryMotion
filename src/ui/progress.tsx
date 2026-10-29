import type { ReactNode } from 'react';

type ProgressProps = {
  value: number;
  max: number;
  label: string;
};

function clamp(value: number, max: number) {
  return Math.min(Math.max(value, 0), max);
}

/** Glossy candy progress bar; the fill scales on X (transform only). */
export function ProgressBar({ value, max, label }: ProgressProps) {
  const clamped = clamp(value, max);
  const ratio = max > 0 ? clamped / max : 0;
  return (
    <div className="ui-progress">
      <div
        className="ui-progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clamped}
        aria-valuetext={`${clamped} of ${max}`}
      >
        <div
          className="ui-progress__fill"
          style={{ transform: `scaleX(${ratio})` }}
        />
      </div>
      <span className="sr-only" aria-live="polite">
        {label}: {clamped} of {max} complete
      </span>
    </div>
  );
}

type RingProps = ProgressProps & {
  size?: number;
  /** Content in the middle (icon or count). */
  children?: ReactNode;
};

/** Circular progress (hold-to-open gate, gesture timers, chapter dots). */
export function ProgressRing({
  value,
  max,
  label,
  size = 72,
  children,
}: RingProps) {
  const clamped = clamp(value, max);
  const ratio = max > 0 ? clamped / max : 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  return (
    <div
      className="ui-ring"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle className="ui-ring__track" cx="50" cy="50" r={radius} />
        <circle
          className="ui-ring__fill"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
        />
      </svg>
      {children && <span className="ui-ring__center">{children}</span>}
    </div>
  );
}
