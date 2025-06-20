import { Code, Cross } from '@terrazzo/icons';
import { CopyButton } from '@terrazzo/tiles';
import clsx from 'clsx';
import { Suspense, lazy, useId, useState } from 'react';
import useTokensLoader from '../../hooks/tokens-loader.js';
import c from './CodePanel.module.css';

// lazy-load bc Monaco is heavy af
const CodeEditor = lazy(() => import('../CodeEditor/CodeEditor.js'));

export default function CodePanel() {
  const panelID = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [tokensLoader] = useTokensLoader();

  return (
    <div className={c.container}>
      <button
        className={c.btn}
        type='button'
        aria-label='Toggle code editor'
        aria-controls={panelID}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
      >
        <Code aria-hidden />
      </button>
      <div
        id={panelID}
        className={c.panel}
        hidden={!isOpen || undefined}
        onKeyDown={(ev) => {
          if (ev.key === 'Escape') {
            setIsOpen(false);
          }
        }}
      >
        <div role='menu' className={c.menu}>
          <span className={c.title}>tokens.json</span>
          <CopyButton clipboardText={tokensLoader.tokensRaw} />
          <button
            className={clsx(c.btn, c.btnClose)}
            type='button'
            aria-label='Close code editor'
            onClick={() => setIsOpen(false)}
          >
            <Cross aria-hidden />
          </button>
        </div>
        {isOpen && (
          <Suspense fallback={null}>
            <CodeEditor />
          </Suspense>
        )}
      </div>
    </div>
  );
}
