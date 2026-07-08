import './Fieldset.css';

import clsx from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

export interface FieldsetProps extends ComponentProps<'fieldset'> {
  label: ReactNode;
}

export default function Fieldset({ children, className, label, ref, ...rest }: FieldsetProps) {
  return (
    <fieldset ref={ref} className={clsx('tz-fieldset', className)} {...rest}>
      <legend className="tz-fieldset-legend">{label}</legend>
      {children}
    </fieldset>
  );
}
