import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const REQUIRED_TYPOGRAPHY_PROPERTIES = 'core/required-typography-properties';

export interface RuleRequiredTypographyPropertiesOptions {
  /** Required typography properties */
  properties: string[];
}

const rule: LintRule<never, RuleRequiredTypographyPropertiesOptions> = {
  meta: {
    docs: {
      description: 'Enforce typography tokens have required properties.',
      url: docsLink(REQUIRED_TYPOGRAPHY_PROPERTIES),
    },
  },
  defaultOptions: { properties: [] },
  create({ tokens, options, report }) {
    if (!options) {
      return;
    }

    if (!options.properties.length) {
      throw new Error(`"properties" can’t be empty`);
    }

    for (const t of Object.values(tokens)) {
      if (t.$type !== 'typography') {
        continue;
      }

      if (t.aliasOf) {
        continue;
      }

      for (const p of options.properties) {
        if (!t.partialAliasOf?.[p] && !(p in t.$value)) {
          report({ message: `${t.id} missing required typographic property "${p}"`, node: t.source.node });
        }
      }
    }
  },
};

export default rule;
