import type { TokenNormalized } from '@terrazzo/token-tools';
import { useMemo } from 'react';
import useNavigation from '../../hooks/navigation.js';
import useTokensLoader from '../../hooks/tokens-loader.js';
import Group from './Group.js';

export default function TokensEditor() {
  const [tokensLoader] = useTokensLoader();
  const [navState] = useNavigation();

  const visibleGroups = useMemo<TokenNormalized['group'][]>(() => {
    const allGroups: Record<string, TokenNormalized['group']> = {};
    for (const token of Object.values(tokensLoader.tokens ?? {})) {
      if (!(token.group.id in allGroups)) {
        allGroups[token.group.id] = token.group;
      }
    }

    const groups: TokenNormalized['group'][] = [];
    for (const id of navState.selected) {
      // token
      const token = tokensLoader.tokens?.[id];
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
    return groups;
  }, [navState.selected.join(',')]);

  return visibleGroups.map((group) => (
    <Group key={group.id} group={group} tokens={group.tokens.map((id) => tokensLoader.tokens?.[id]!)} />
  ));
}
