import type {
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  ButtonHTMLAttributes,
} from 'react';

export type CardTone = 'night' | 'hare' | 'beanstalk' | 'pigs';

type CardProps = HTMLAttributes<HTMLElement> & {
  /** Illustration area at the top of the card. */
  art?: ReactNode;
  tone?: CardTone;
  children: ReactNode;
};

/**
 * A story-world card: an illustrated "window" on top, glass body below. Lifts
 * and tilts towards the pointer (CSS variables, no re-render).
 */
export function Card({
  art,
  tone = 'night',
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <article
      className={['ui-card', `ui-card--${tone}`, className]
        .filter(Boolean)
        .join(' ')}
      onPointerMove={tilt}
      onPointerLeave={untilt}
      {...rest}
    >
      {art && <div className="ui-card__art">{art}</div>}
      <div className="ui-card__body">{children}</div>
    </article>
  );
}

type SelectCardProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected: boolean;
  art?: ReactNode;
  tone?: CardTone;
  children: ReactNode;
};

/** A whole card that is one big toggle button (mode, character, companion…). */
export function SelectCard({
  selected,
  art,
  tone = 'night',
  className,
  children,
  type = 'button',
  ...rest
}: SelectCardProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      data-sfx="select"
      className={[
        'ui-card',
        'ui-card--select',
        `ui-card--${tone}`,
        selected && 'is-selected',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {art && <span className="ui-card__art">{art}</span>}
      <span className="ui-card__body">{children}</span>
      <span className="ui-card__check" aria-hidden="true">
        ✓
      </span>
    </button>
  );
}

function tilt(event: MouseEvent<HTMLElement>) {
  const el = event.currentTarget;
  const box = el.getBoundingClientRect();
  if (!box.width || !box.height) return;
  el.style.setProperty(
    '--tilt-x',
    `${((event.clientY - box.top) / box.height - 0.5) * -5}deg`,
  );
  el.style.setProperty(
    '--tilt-y',
    `${((event.clientX - box.left) / box.width - 0.5) * 7}deg`,
  );
}
function untilt(event: MouseEvent<HTMLElement>) {
  event.currentTarget.style.setProperty('--tilt-x', '0deg');
  event.currentTarget.style.setProperty('--tilt-y', '0deg');
}
