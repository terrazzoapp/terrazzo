/**
 * DO NOT LOAD THIS SYNCHRONOUSLY!
 * This module is gigantic and must be codesplit
 */
import { defineConfig, parse } from '@terrazzo/parser';
import { useAtom } from 'jotai';
import * as monaco from 'monaco-editor';
import { useEffect, useId, useLayoutEffect, useState } from 'react';
import dtcg, { saveTokens } from '../../atoms/dtcg.js';

const MONACO_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  language: 'json',
  theme: 'vs-dark',
  fontFamily: 'Fragment Mono',
  fontSize: 11,
  formatOnType: true,
  minimap: { enabled: false },
  tabSize: 2,
};

const TZ_CONFIG = defineConfig({}, { cwd: new URL(window.location.href) });

export default function CodeEditor() {
  const id = useId();
  const [tokens, setTokens] = useAtom(dtcg);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor>();

  // initial setup
  // initialize AFTER first render
  useLayoutEffect(() => {
    self.MonacoEnvironment = {
      getWorker(_workerId: string, label: string): Worker {
        switch (label) {
          case 'json': {
            return new Worker(new URL('/monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url), {
              type: 'module',
            });
          }
          default: {
            return new Worker(new URL('/monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), {
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

  // on update, update Jotai atom
  useEffect(() => {
    editor?.getModel()?.onDidChangeContent(async () => {
      const newCode = editor.getValue();
      setTokens(newCode);
      saveTokens(newCode);
      try {
        await parse([{ filename: new URL('file:///tokens.json'), src: newCode }], {
          config: TZ_CONFIG,
        });
      } catch (err) {
        if ((err as Error).name === 'TokensJSONError') {
          console.error(err);
        }
      }
    });
  }, [editor]);

  // update code remotely if tokens change
  useEffect(() => {
    if (editor?.getValue() !== tokens) {
      editor?.setValue(tokens);
    }
  }, [editor, tokens]);

  return <div id={id} />;
}
