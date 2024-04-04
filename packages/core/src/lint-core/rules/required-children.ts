import { isTokenMatch } from '@cobalt-ui/utils';
import type { ParsedToken } from '../../token.js';

export type RequiredChildrenMatch = {
  /** Glob of tokens/groups to match */
  match: string[];
} & ( // type helper (enforces at least 1 exists)
  | {
      /** Required token IDs to match (this only looks at the very last segment of a token ID!) */
      requiredTokens: string[];
      /** Required groups to match (this only looks at the beginning/middle segments of a token ID!) */
      requiredGroups?: never;
    }
  | {
      /** Required token IDs to match (this only looks at the very last segment of a token ID!) */
      requiredTokens?: never;
      /** Required groups to match (this only looks at the beginning/middle segments of a token ID!) */
      requiredGroups: string[];
    }
  | {
      /** Required token IDs to match (this only looks at the very last segment of a token ID!) */
      requiredTokens: string[];
      /** Required groups to match (this only looks at the beginning/middle segments of a token ID!) */
      requiredGroups: string[];
    }
);

export interface RuleRequiredChildrenOptions {
  matches: RequiredChildrenMatch[];
}

export default function ruleRequiredChildren(tokens: ParsedToken[], options?: RuleRequiredChildrenOptions): string[] {
  const notices: string[] = [];

  if (!options?.matches?.length) {
    throw new Error('Invalid config. Missing `matches: […]`');
  }

  // note: in many other rules, the operation can be completed in one iteration through all tokens
  // in this rule, however, we have to scan all tokens every time per-match, because they may overlap

  for (let matchI = 0; matchI < options.matches.length; matchI++) {
    const { match, requiredTokens, requiredGroups } = options.matches[matchI]!;

    // validate
    if (!match.length) {
      throw new Error(`Match ${matchI}: must declare \`match: […]\``);
    }
    if (!requiredTokens?.length && !requiredGroups?.length) {
      throw new Error(`Match ${matchI}: must declare either \`requiredTokens: […]\` or \`requiredGroups: […]\``);
    }

    const matchGroups: string[] = [];
    const matchTokens: string[] = [];
    let tokensMatched = false;
    for (const t of tokens) {
      if (!isTokenMatch(t.id, match)) {
        continue;
      }
      tokensMatched = true;
      const groups = t.id.split('.');
      matchTokens.push(groups.pop()!);
      matchGroups.push(...groups);
    }

    if (!tokensMatched) {
      notices.push(`Match "${matchI}": no tokens matched ${JSON.stringify(match)}`);
      continue;
    }

    if (requiredTokens) {
      for (const id of requiredTokens) {
        if (!matchTokens.includes(id)) {
          notices.push(`Match ${matchI}: some groups missing required token "${id}"`);
        }
      }
    }
    if (requiredGroups) {
      for (const groupName of requiredGroups) {
        if (!matchGroups.includes(groupName)) {
          notices.push(`Match ${matchI}: some tokens missing required group "${groupName}"`);
        }
      }
    }
  }

  return notices;
}
