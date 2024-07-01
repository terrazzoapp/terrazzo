import { useEffect, useState, type ComponentProps } from 'react';
import type { CodeOptionsSingleTheme, CodeToHastOptions } from 'shiki';
import './Demo.css';
import CopyButton from '../CopyButton/CopyButton';

const shiki = import('shiki');

export interface DemoProps extends Omit<ComponentProps<'div'>, 'lang'> {
  /** Code to Highlight */
  code: string;
  lang?: CodeToHastOptions['lang'];
  theme?: CodeOptionsSingleTheme['theme'];
}

export default function Demo({ children, code, lang = 'tsx', theme = 'houston', ...rest }: DemoProps) {
  const [codeFormatted, setCodeFormatted] = useState<string>('');

  useEffect(() => {
    shiki.then(async ({ codeToHtml }) => {
      const formatted = await codeToHtml(code, { lang, theme });
      setCodeFormatted(formatted);
    });
  }, [code, lang, theme]);

  return (
    <div className='tz-demo' {...rest}>
      <div className='tz-demo-canvas'>{children}</div>
      <div className='tz-demo-code'>
        <menu className='tz-demo-code-copy-wrapper'>
          <CopyButton clipboardText={code} />
        </menu>
        <div
          className='tz-demo-code-overflow'
          // biome-ignore lint/security/noDangerouslySetInnerHtml: This is necessary, and user-controlled
          dangerouslySetInnerHTML={{ __html: codeFormatted }}
        />
      </div>
    </div>
  );
}
