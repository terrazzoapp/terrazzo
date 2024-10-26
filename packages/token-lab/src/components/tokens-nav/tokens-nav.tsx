import type { Group } from '@terrazzo/token-tools';
import radix from 'dtcg-examples/radix/tokens.json';
import { useAtom } from 'jotai';
import { useEffect, useMemo } from 'react';
import dtcg, { loadTokens } from '../../atoms/dtcg';

export default function TokensNav() {
  const [tokensRaw, setTokensRaw] = useAtom(dtcg);
  const tokens = useMemo<Group>(() => JSON.parse(tokensRaw), [tokensRaw]);

  // TODO:
  // 1. determine where/how DTCG tokens load
  // 2. prevent race conditions with code-editor.tsx

  useEffect(() => {
    (async () => {
      let code = await loadTokens();
      if (!code || code.trim() === '{}') {
        code = JSON.stringify(radix, null, 2);
      }
      setTokensRaw(code);
    })();
  }, []);

  return (
    <div role='treegrid'>
      {Object.entries(tokens).map(([group, tokens]) => (
        <div key={group} role='rowgroup'>
          <div role='row' tabIndex={0}>
            <div role='cell'>{group}</div>
          </div>
          {tokens.map((token) => (
            <div key={token.id} role='row'>
              <div role='cell'>{token.name}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
