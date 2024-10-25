import clsx from 'clsx';
import { type ComponentProps, type ReactNode, useId } from 'react';
import './Switch.css';

export interface SwitchProps extends ComponentProps<'input'> {
  /** Accessible label for this toggle switch */
  label: ReactNode;
}

export default function Switch({ className, id: userID, label, ref, ...rest }: SwitchProps) {
  const randomID = useId();
  const id = userID ?? randomID;

  return (
    <div className={clsx('tz-switch', className)}>
      <input
        ref={ref}
        id={id}
        className='tz-switch-field'
        // biome-ignore lint/a11y/useAriaPropsForRole: we are OK without JS-controlled aria labels here
        role='switch'
        type='checkbox'
        {...rest}
      />
      <label className='tz-switch-label' htmlFor={id}>
        <span className='tz-switch-label-text'>{label}</span>
      </label>
    </div>
  );
}
