import clsx from 'clsx';
import type { ComponentProps } from 'react';
import './Button.css';

export interface ButtonProps extends Omit<ComponentProps<'button'>, 'size'> {
  /** default: "m" */
  size?: 's' | 'm';
  /** default: "primary" */
  variant?: 'primary' | 'secondary' | 'teritary';
}

export default function Button({
  className,
  children,
  size = 'm',
  type = 'button',
  variant = 'primary',
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      className={clsx('tz-button', className)}
      type={type}
      data-size={size}
      data-variant={variant}
      {...rest}
    >
      {children}
    </button>
  );
}
