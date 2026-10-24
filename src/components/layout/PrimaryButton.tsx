import type { ButtonHTMLAttributes, ReactNode } from 'react';

type PrimaryButtonVariant = 'primary' | 'secondary' | 'ghost';

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: PrimaryButtonVariant;
  size?: 'default' | 'small';
};

export function PrimaryButton({
  children,
  variant = 'primary',
  size = 'default',
  className,
  ...rest
}: PrimaryButtonProps) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size === 'small' ? 'btn--small' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
