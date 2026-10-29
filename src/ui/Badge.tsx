import type { ReactNode } from 'react';

export type BadgeTone = 'gold' | 'cyan' | 'violet' | 'leaf' | 'glass';

/** Small pill label: story features, "New!", completed marks. */
export function Badge({
  tone = 'glass',
  icon,
  children,
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className={`ui-badge ui-badge--${tone}`}>
      {icon && (
        <span className="ui-badge__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}

/** A round glossy medal / sticker that swings in on its ribbon. */
export function Medal({
  symbol = '★',
  size = 120,
}: {
  symbol?: ReactNode;
  size?: number;
}) {
  return (
    <span
      className="ui-medal ui-pop-in"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <span className="ui-medal__ribbon" />
      <span className="ui-medal__disc">{symbol}</span>
    </span>
  );
}
