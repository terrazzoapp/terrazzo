import { isTokenMatch } from '@cobalt-ui/utils';
import type { ParsedToken } from '../../token.js';

export type RequiredModesMatch = {
  /** Glob of tokens/groups to match */
  match: string[];
  /** Required modes */
  modes: string[];
};

export interface RuleRequiredModesOptions {
  matches: RequiredModesMatch[];
}

export default function ruleRequiredModes(tokens: ParsedToken[], options?: RuleRequiredModesOptions): string[] {
  const notices: string[] = [];

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

    let tokensMatched = false;
    for (const t of tokens) {
      if (!isTokenMatch(t.id, match)) {
        continue;
      }
      tokensMatched = true;

      for (const mode of modes) {
        if (!t.$extensions?.mode?.[mode]) {
          notices.push(`Token ${t.id}: missing required mode "${mode}"`);
        }
      }

      if (!tokensMatched) {
        notices.push(`Match "${matchI}": no tokens matched ${JSON.stringify(match)}`);
      }
    }
  }

  return notices;
}
