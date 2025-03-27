/**
 * DO NOT LOAD THIS SYNCHRONOUSLY!
 * This module is gigantic and must be codesplit
 */
import * as monaco from 'monaco-editor';
import { useEffect, useId, useLayoutEffect, useState } from 'react';
import useTokens from '../../hooks/tokens.js';

const MONACO_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  language: 'json',
  theme: 'vs-dark',
  fontFamily: 'Fragment Mono',
  fontSize: 11,
  formatOnType: true,
  minimap: { enabled: false },
  tabSize: 2,
};

export default function CodeEditor() {
  const id = useId();
  const { tokens, setTokens } = useTokens();
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();

  // initial setup
  // initialize AFTER first render (so container element exists)
  useLayoutEffect(() => {
    self.MonacoEnvironment = {
      getWorker(_workerId: string, label: string): Worker {
        switch (label) {
          case 'json': {
            return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url), {
              type: 'module',
            });
          }
          default: {
            return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), {
              type: 'module',
            });
          }
        }
      },
    };
    const editorEl = document.getElementById(id)!;
    setEditor(
      monaco.editor.create(document.getElementById(id)!, {
        value: tokens,
        ...MONACO_OPTIONS,
      }),
    );
    // once, on first render, focus on the editor
    editorEl.querySelector('textarea')?.focus();
  }, []);

  // on update, update Jotai atom (debounced; this will lock up the main thread every character)
  useEffect(() => {
    let t: number | undefined;
    editor?.getModel()?.onDidChangeContent(() => {
      const newCode = editor.getValue();
      clearTimeout(t);
      t = window.setTimeout(() => {
        setTokens(newCode);
      }, 1000);
    });
  }, [editor]);

  return <div id={id} />;
}
