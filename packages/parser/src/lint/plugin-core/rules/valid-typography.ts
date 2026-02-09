import type * as momoa from '@humanwhocodes/momoa';
import { getObjMember } from '@terrazzo/json-schema-tools';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';
import { cachedLintMatcher } from '../lib/matchers.js';

export const VALID_TYPOGRAPHY = 'core/valid-typography';

const ERROR = 'ERROR';
const ERROR_MISSING = 'ERROR_MISSING';

export interface RuleValidTypographyOptions {
  /** Required typography properties */
  requiredProperties: string[];
  /** Token globs to ignore */
  ignore?: string[];
}

const rule: LintRule<typeof ERROR | typeof ERROR_MISSING, RuleValidTypographyOptions> = {
  meta: {
    messages: {
      [ERROR]: `Expected object, received {{ value }}.`,
      [ERROR_MISSING]: `Missing required property "{{ property }}".`,
    },
    docs: {
      description: 'Require typography tokens to follow the format.',
      url: docsLink(VALID_TYPOGRAPHY),
    },
  },
  defaultOptions: {
    requiredProperties: ['fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight'],
  },
  create({ tokens, options, report }) {
    const isIgnored = options.ignore ? cachedLintMatcher.tokenIDMatch(options.ignore) : () => false;
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || !t.originalValue || t.$type !== 'typography' || isIgnored(t.id)) {
        continue;
      }

      validateTypography(t.originalValue.$value, {
        node: getObjMember(t.source.node, '$value') as momoa.ObjectNode,
        filename: t.source.filename,
      });

      // Note: we validate sub-properties using other checks like valid-dimension, valid-font-family, etc.
      // The only thing remaining is to check that all properties exist (since missing properties won’t appear as invalid)
      function validateTypography(value: unknown, { node, filename }: { node: momoa.ObjectNode; filename?: string }) {
        if (value && typeof value === 'object') {
          for (const property of options.requiredProperties) {
            if (!(property in value)) {
              report({ messageId: ERROR_MISSING, data: { property }, node, filename });
            }
          }
        } else {
          report({
            messageId: ERROR,
            data: { value: JSON.stringify(value) },
            node,
            filename,
          });
        }
      }
    }
  },
};

export default rule;
