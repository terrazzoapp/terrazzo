import { Check, Copy } from '@terrazzo/icons';
import clsx from 'clsx';
import { type ComponentProps, useRef, useState } from 'react';
import './CopyButton.css';

export interface CopyButtonProps extends Omit<ComponentProps<'button'>, 'children' | 'onClick'> {
  /** The text to copy to the clipboard */
  clipboardText: string;
  /** Amount of time, in milliseconds, to show the checkmark. (default: 1000) */
  timeoutMS?: number;
}

export default function CopyButton({ className, clipboardText, timeoutMS = 1000, ...rest }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const copiedTO = useRef<number | undefined>(undefined);

  return (
    <button
      type='button'
      className={clsx('tz-copy-button', className)}
      onClick={async () => {
        await navigator.clipboard.writeText(clipboardText);
        clearTimeout(copiedTO.current);
        setCopied(true);
        copiedTO.current = window.setTimeout(() => {
          setCopied(false);
        }, timeoutMS);
      }}
      {...rest}
    >
      {copied ? <Check /> : <Copy aria-label='Copy value' />}
    </button>
  );
}
