import '../Button/Button.css'; // note: a component should NEVER import another’s styles, but this is a special case

import clsx from 'clsx';
import type { ComponentProps } from 'react';

export interface ButtonLinkProps extends ComponentProps<'a'> {
  /** default: "m" */
  size?: 's' | 'm';
  /** default: "secondary" */
  variant?: 'lime' | 'blue' | 'orange' | 'secondary' | 'tertiary';
}

export default function ButtonLink({
  className,
  children,
  size = 'm',
  variant = 'secondary',
  ref,
  ...rest
}: ButtonLinkProps) {
  return (
    <a
      className={clsx('tz-button', className)}
      ref={ref}
      data-size={size}
      data-variant={variant}
      {...rest}
    >
      {children}
    </a>
  );
}
