import { Code, Cross } from '@terrazzo/icons';
import clsx from 'clsx';
import { Suspense, lazy, useId, useState } from 'react';
import c from './code-panel.module.css';

// lazy-load bc Monaco is heavy af
const CodeEditor = lazy(() => import('../code-editor/code-editor.js'));

export default function CodePanel() {
  const panelID = useId();
  const [isOpen, setIsOpen] = useState(false);

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
