import clsx from 'clsx';
import type { ComponentProps } from 'react';
import './SubtleInput.css';

const INPUT_MODE: Record<SubtleInputProps['type'], ComponentProps<'input'>['inputMode']> = {
  text: 'text',
  number: 'decimal',
  email: 'email',
  search: 'search',
  tel: 'tel',
  url: 'url',
};

export interface SubtleInputProps extends ComponentProps<'input'> {
  type: 'text' | 'number' | 'email' | 'search' | 'tel' | 'url';
  suffix?: string;
}

export default function SubtleInput({ className, suffix, ref, ...rest }: SubtleInputProps) {
  return (
    <div className={clsx('tz-subtle-input', className)}>
      <input ref={ref} className='tz-subtle-input-field' inputMode={INPUT_MODE[rest.type]} {...rest} />
      <span className='tz-subtle-input-suffix'>{suffix}</span>
    </div>
  );
}
