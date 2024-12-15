import type { TokenNormalized } from '@terrazzo/token-tools';
import { useMemo } from 'react';
import useNavigation from '../../hooks/navigation.js';
import useTokens from '../../hooks/tokens.js';
import Group from './Group.js';

export default function TokensEditor() {
  const { parseResult } = useTokens();
  const [navState] = useNavigation();

  const visibleGroups = useMemo<TokenNormalized['group'][]>(() => {
    console.time('visibleGroups hook');
    const allGroups: Record<string, TokenNormalized['group']> = {};
    for (const token of Object.values(parseResult.tokens)) {
      if (!(token.group.id in allGroups)) {
        allGroups[token.group.id] = token.group;
      }
    }

    const groups: TokenNormalized['group'][] = [];
    for (const id of navState.selection) {
      // token
      const token = parseResult.tokens[id];
      if (token) {
        if (!groups.some((group) => group.id === token.group.id)) {
          groups.push(token.group);
        }
      }
      // group
      else {
        if (id in allGroups && !groups.some((group) => group.id === id)) {
          groups.push(allGroups[id]!);
        }
      }
    }
    console.timeEnd('visibleGroups hook');
    return groups;
  }, [navState.selection.join(',')]);

  return visibleGroups.map((group) => (
    <Group key={group.id} group={group} tokens={group.tokens.map((id) => parseResult.tokens[id]!)} />
  ));
}
