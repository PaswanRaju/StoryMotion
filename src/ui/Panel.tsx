import type { ElementType, HTMLAttributes, ReactNode } from 'react';

export type PanelVariant = 'glass' | 'scroll' | 'glow';

type PanelProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  variant?: PanelVariant;
  /** Play the bouncy pop-in when the panel mounts. */
  entrance?: boolean;
  children: ReactNode;
};

/**
 * Glass: frosted night-sky glass with a rim light (app chrome).
 * Scroll: warm parchment for story text and grown-up reading.
 * Glow: glass with a soft magical aura for the one thing to look at.
 */
export function Panel({
  as: Tag = 'div',
  variant = 'glass',
  entrance = false,
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <Tag
      className={[
        'ui-panel',
        `ui-panel--${variant}`,
        entrance && 'ui-pop-in',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}
