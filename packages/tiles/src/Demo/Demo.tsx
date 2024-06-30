import { useEffect, useState, type ComponentProps } from 'react';
import type { CodeOptionsSingleTheme, CodeToHastOptions } from 'shiki';
import './Demo.css';

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
      <div
        className='tz-demo-code'
        // biome-ignore lint/security/noDangerouslySetInnerHtml: This is necessary, and user-controlled
        dangerouslySetInnerHTML={{ __html: codeFormatted }}
      />
    </div>
  );
}
