/**
 * DO NOT LOAD THIS SYNCHRONOUSLY!
 * This module is gigantic and must be codesplit
 */
import { useAtom } from 'jotai';
import * as monaco from 'monaco-editor';
import { useId, useLayoutEffect } from 'react';
import dtcg, { loadTokens } from '../../atoms/dtcg';

export default function CodeEditor() {
  const id = useId();

  const [, setTokens] = useAtom(dtcg);

  useLayoutEffect(() => {
    (async () => {
      self.MonacoEnvironment = {
        getWorker(workerId, label) {
          const getWorkerModule = (moduleUrl: string, label: string) => {
            return new Worker(self.MonacoEnvironment!.getWorkerUrl!(moduleUrl, label), {
              name: label,
              type: 'module',
            });
          };

          return getWorkerModule('/monaco-editor/esm/vs/language/json/json.worker?worker', label);
        },
      };

      // 1. create editor and load saved tokens
      const editorEl = document.getElementById(id)!;
      const editor = monaco.editor.create(editorEl, {
        value: '{}',
        language: 'jsonc',
        fontFamily: 'Fragment Mono',
        fontSize: 11,
        minimap: { enabled: false },
        theme: 'vs-dark',
      });
      let code = await loadTokens();
      if (!code || code.trim() === '{}') {
        code = JSON.stringify(radix, null, 2);
      }
      editor.setValue(code);
      setTokens(code);
      editorEl.querySelector('textarea')?.focus();

      // 2. on update, update Jotai atom
      editor.getModel()!.onDidChangeContent(() => {
        setTokens(editor.getValue());
      });
    })();
  }, []);

  return <div id={id} />;
}
