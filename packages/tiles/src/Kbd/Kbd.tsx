import clsx from 'clsx';
import type { ComponentProps } from 'react';
import './Kbd.css';

export type KbdProps = ComponentProps<'kbd'>;

export default function Kbd({ className, children, ...rest }: KbdProps) {
  return (
    <kbd className={clsx('tz-kbd', className)} {...rest}>
      {children}
    </kbd>
  );
}
