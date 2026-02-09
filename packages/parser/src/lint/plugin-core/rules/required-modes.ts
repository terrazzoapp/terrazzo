import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';
import { cachedLintMatcher } from '../lib/matchers.js';

export const REQUIRED_MODES = 'core/required-modes';

export type RequiredModesMatch = {
  /** Glob of tokens/groups to match */
  match: string[];
  /** Required modes */
  modes: string[];
};

export interface RuleRequiredModesOptions {
  matches: RequiredModesMatch[];
}

const rule: LintRule<never, RuleRequiredModesOptions> = {
  meta: {
    docs: {
      description: 'Enforce certain tokens have specific modes.',
      url: docsLink(REQUIRED_MODES),
    },
  },
  defaultOptions: { matches: [] },
  create({ tokens, options, report }) {
    if (!options?.matches?.length) {
      throw new Error('Invalid config. Missing `matches: […]`');
    }

    // note: in many other rules, the operation can be completed in one iteration through all tokens
    // in this rule, however, we have to scan all tokens every time per-match, because they may overlap
    for (let matchI = 0; matchI < options.matches.length; matchI++) {
      const { match, modes } = options.matches[matchI]!;

      // validate
      if (!match.length) {
        throw new Error(`Match ${matchI}: must declare \`match: […]\``);
      }
      if (!modes?.length) {
        throw new Error(`Match ${matchI}: must declare \`modes: […]\``);
      }

      const matcher = cachedLintMatcher.tokenIDMatch(match);

      let tokensMatched = false;
      for (const t of Object.values(tokens)) {
        if (!matcher(t.id)) {
          continue;
        }
        tokensMatched = true;

        for (const mode of modes) {
          if (!t.mode?.[mode]) {
            report({
              message: `Token ${t.id}: missing required mode "${mode}"`,
              node: t.source.node,
              filename: t.source.filename,
            });
          }
        }

        if (!tokensMatched) {
          report({
            message: `Match "${matchI}": no tokens matched ${JSON.stringify(match)}`,
            node: t.source.node,
            filename: t.source.filename,
          });
        }
      }
    }
  },
};

export default rule;
