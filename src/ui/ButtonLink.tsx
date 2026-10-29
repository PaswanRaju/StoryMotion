import type { ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import type { ButtonSize, ButtonVariant } from './Button';

type ButtonLinkProps = LinkProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  children: ReactNode;
};

/** Navigation that looks like a candy button but stays a real link. */
export function ButtonLink({
  variant = 'primary',
  size = 'lg',
  icon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={['ui-btn', `ui-btn--${variant}`, `ui-btn--${size}`, className]
        .filter(Boolean)
        .join(' ')}
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
      </span>
    </Link>
  );
}
