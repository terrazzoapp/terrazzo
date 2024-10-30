import type { TokenNormalized } from '@terrazzo/token-tools';
import EditableToken from '../EditableToken/EditableToken.js';
import c from './TokensEditor.module.css';

export interface TokensEditorGroupProps {
  group: TokenNormalized['group'];
  tokens: TokenNormalized[];
}

export default function TokensEditorGroup({ group, tokens }: TokensEditorGroupProps) {
  // TODO: clear callout that special features are only possible if all tokens in a group share the same $type

  const orderedModes = new Set<string>(['.']);
  for (const token of tokens) {
    for (const mode of Object.keys(token.mode)) {
      orderedModes.add(mode);
    }
  }

  return (
    <section className={c.group}>
      <h3 className={c.groupTitle}>{group.id}</h3>
      {group.$description && <p>{group.$description}</p>}
      <table className={c.tokenGrid}>
        <thead>
          <tr>
            <th scope='col' className={c.colheader}>
              Name
            </th>
            {[...orderedModes].map((mode) => (
              <th key={mode} scope='col' className={c.colheader}>
                {mode === '.' ? 'Default' : mode}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {group.tokens.map((tokenId) => (
            <EditableToken key={tokenId} token={tokens.find((t) => t.id === tokenId)!} modes={[...orderedModes]} />
          ))}
        </tbody>
      </table>
    </section>
  );
}
