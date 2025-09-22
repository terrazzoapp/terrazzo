import wcmatch from 'wildcard-match';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const REQUIRED_TYPOGRAPHY_PROPERTIES = 'core/required-typography-properties';

export interface RuleRequiredTypographyPropertiesOptions {
  /**
   * Required typography properties.
   * @default ["fontFamily", "fontWeight", "fontSize", "letterSpacing", "lineHeight"]
   */
  properties: string[];
  /** Token globs to ignore */
  ignore?: string[];
}

/** @deprecated Use core/valid-typography instead */
const rule: LintRule<never, RuleRequiredTypographyPropertiesOptions> = {
  meta: {
    docs: {
      description: 'Enforce typography tokens have required properties.',
      url: docsLink(REQUIRED_TYPOGRAPHY_PROPERTIES),
    },
  },
  defaultOptions: {
    properties: ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight'],
  },
  create({ tokens, options, report }) {
    if (!options) {
      return;
    }

    if (!options.properties.length) {
      throw new Error(`"properties" can’t be empty`);
    }

    const shouldIgnore = options.ignore ? wcmatch(options.ignore) : null;

    for (const t of Object.values(tokens)) {
      if (shouldIgnore?.(t.id)) {
        continue;
      }

      if (t.$type !== 'typography') {
        continue;
      }

      if (t.aliasOf) {
        continue;
      }

      for (const p of options.properties) {
        if (!t.partialAliasOf?.[p] && !(p in t.$value)) {
          report({
            message: `This rule is deprecated. Use core/valid-typography. Missing required typographic property "${p}"`,
            node: t.source.node,
            filename: t.source.filename,
          });
        }
      }
    }
  },
};

export default rule;
