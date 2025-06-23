import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';
import wcmatch from 'wildcard-match';

export const REQUIRED_CHILDREN = 'core/required-children';

export interface RequiredChildrenMatch {
  /** Glob of tokens/groups to match */
  match: string[];
  /** Required token IDs to match (this only looks at the very last segment of a token ID!) */
  requiredTokens?: string[];
  /** Required groups to match (this only looks at the beginning/middle segments of a token ID!) */
  requiredGroups?: string[];
}

export interface RuleRequiredChildrenOptions {
  matches: RequiredChildrenMatch[];
}

export const ERROR_EMPTY_MATCH = 'EMPTY_MATCH';
export const ERROR_MISSING_REQUIRED_TOKENS = 'MISSING_REQUIRED_TOKENS';
export const ERROR_MISSING_REQUIRED_GROUP = 'MISSING_REQUIRED_GROUP';

const rule: LintRule<
  typeof ERROR_EMPTY_MATCH | typeof ERROR_MISSING_REQUIRED_TOKENS | typeof ERROR_MISSING_REQUIRED_GROUP,
  RuleRequiredChildrenOptions
> = {
  meta: {
    messages: {
      [ERROR_EMPTY_MATCH]: 'No tokens matched {{ matcher }}',
      [ERROR_MISSING_REQUIRED_TOKENS]: 'Match {{ index }}: some groups missing required token "{{ token }}"',
      [ERROR_MISSING_REQUIRED_GROUP]: 'Match {{ index }}: some tokens missing required group "{{ group }}"',
    },
    docs: {
      description: 'Enforce token groups have specific children, whether tokens and/or groups.',
      url: docsLink(REQUIRED_CHILDREN),
    },
  },
  defaultOptions: { matches: [] },
  create({ tokens, options, report }) {
    if (!options.matches?.length) {
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

      const matcher = wcmatch(match);

      const matchGroups: string[] = [];
      const matchTokens: string[] = [];
      let tokensMatched = false;
      for (const t of Object.values(tokens)) {
        if (!matcher(t.id)) {
          continue;
        }
        tokensMatched = true;
        const groups = t.id.split('.');
        matchTokens.push(groups.pop()!);
        matchGroups.push(...groups);
      }

      if (!tokensMatched) {
        report({
          messageId: ERROR_EMPTY_MATCH,
          data: { matcher: JSON.stringify(match) },
        });
        continue;
      }

      if (requiredTokens) {
        for (const id of requiredTokens) {
          if (!matchTokens.includes(id)) {
            report({
              messageId: ERROR_MISSING_REQUIRED_TOKENS,
              data: { index: matchI, token: id },
            });
          }
        }
      }
      if (requiredGroups) {
        for (const groupName of requiredGroups) {
          if (!matchGroups.includes(groupName)) {
            report({
              messageId: ERROR_MISSING_REQUIRED_GROUP,
              data: { index: matchI, group: groupName },
            });
          }
        }
      }
    }
  },
};

export default rule;
