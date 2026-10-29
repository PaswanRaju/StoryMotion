import {
  useState,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
} from 'react';
import { MAX_BURST_PARTICLES } from './tokens';
import { useReducedMotion } from './useReducedMotion';

export type ButtonVariant = 'primary' | 'secondary' | 'magic' | 'ghost';
/** sm/md are for grown-up screens only; anything a child taps uses lg or xl. */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
/** UI cue played by the app-wide listener in hooks/useUiSounds. */
export type ButtonSfx = 'click' | 'select' | 'start' | 'toggle' | 'none';

type BaseProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  sfx?: ButtonSfx;
  ref?: Ref<HTMLButtonElement>;
};

const SPARKS = Array.from(
  { length: Math.min(6, MAX_BURST_PARTICLES) },
  (_, i) => i,
);

/** Six tiny stars that fly out of the press point; skipped for reduced motion. */
function useSparkleBurst(
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void,
) {
  const reduced = useReducedMotion();
  const [burst, setBurst] = useState(0);
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!reduced) setBurst((n) => n + 1);
    onClick?.(event);
  };
  const sparkles =
    burst > 0 && !reduced ? (
      <span key={burst} className="ui-sparkles" aria-hidden="true">
        {SPARKS.map((i) => (
          <i key={i} style={{ ['--i' as string]: i }} />
        ))}
      </span>
    ) : null;
  return { handleClick, sparkles };
}

function classes(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(' ');
}

export type ButtonProps = BaseProps & {
  children: ReactNode;
  icon?: ReactNode;
  iconEnd?: ReactNode;
  /** Stretch to the container width. */
  block?: boolean;
};

/**
 * The "candy" button: a glossy face sitting on a raised edge. Pressing pushes
 * the face down onto the edge and squashes it; releasing springs it back.
 * Only transform and opacity animate.
 */
export function Button({
  children,
  icon,
  iconEnd,
  variant = 'primary',
  size = 'lg',
  block = false,
  sfx,
  className,
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  const { handleClick, sparkles } = useSparkleBurst(onClick);
  return (
    <button
      type={type}
      className={classes(
        'ui-btn',
        `ui-btn--${variant}`,
        `ui-btn--${size}`,
        block && 'ui-btn--block',
        className,
      )}
      data-sfx={sfx}
      onClick={handleClick}
      {...rest}
    >
      <span className="ui-btn__edge" aria-hidden="true" />
      <span className="ui-btn__face">
        {icon && (
          <span className="ui-btn__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="ui-btn__label">{children}</span>
        {iconEnd && (
          <span className="ui-btn__icon" aria-hidden="true">
            {iconEnd}
          </span>
        )}
      </span>
      {sparkles}
    </button>
  );
}

export type IconButtonProps = BaseProps & {
  icon: ReactNode;
  /** Accessible name; also shown as a caption when showLabel is set. */
  label: string;
  shape?: 'round' | 'squircle';
  showLabel?: boolean;
};

/** Same candy family, sized as a square/circle around one icon. */
export function IconButton({
  icon,
  label,
  shape = 'round',
  showLabel = false,
  variant = 'ghost',
  size = 'lg',
  sfx,
  className,
  onClick,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const { handleClick, sparkles } = useSparkleBurst(onClick);
  return (
    <button
      type={type}
      className={classes(
        'ui-btn',
        'ui-btn--icon',
        `ui-btn--${shape}`,
        `ui-btn--${variant}`,
        `ui-btn--${size}`,
        showLabel && 'ui-btn--captioned',
        className,
      )}
      aria-label={rest['aria-label'] ?? label}
      title={rest.title ?? label}
      data-sfx={sfx}
      onClick={handleClick}
      {...rest}
    >
      <span className="ui-btn__edge" aria-hidden="true" />
      <span className="ui-btn__face">
        <span className="ui-btn__icon" aria-hidden="true">
          {icon}
        </span>
      </span>
      {showLabel && (
        <span className="ui-btn__caption" aria-hidden="true">
          {label}
        </span>
      )}
      {sparkles}
    </button>
  );
}
