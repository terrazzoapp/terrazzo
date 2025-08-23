import type { NumberNode, ObjectNode, StringNode } from '@humanwhocodes/momoa';
import { FONT_WEIGHTS } from '@terrazzo/token-tools';
import { getObjMember, getObjMembers } from '../../../parse/json.js';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_FONT_WEIGHT = 'core/valid-font-weight';

const ERROR = 'ERROR';
const ERROR_STYLE = 'ERROR_STYLE';

export interface RuleFontWeightOptions {
  /**
   * Enforce either:
   * - "numbers" (0-999)
   * - "names" ("light", "medium", "bold", etc.)
   */
  style?: 'numbers' | 'names';
}

const rule: LintRule<typeof ERROR | typeof ERROR_STYLE, RuleFontWeightOptions> = {
  meta: {
    messages: {
      [ERROR]: `Must either be a valid number (0 - 999) or a valid font weight: ${new Intl.ListFormat(undefined, { type: 'disjunction' }).format(Object.keys(FONT_WEIGHTS))}.`,
      [ERROR_STYLE]: 'Expected style {{ style }}, received {{ value }}.',
    },
    docs: {
      description: 'Require number tokens to follow the format.',
      url: docsLink(VALID_FONT_WEIGHT),
    },
  },
  defaultOptions: {
    style: undefined,
  },
  create({ tokens, options, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf) {
        continue;
      }

      switch (t.$type) {
        case 'fontWeight': {
          validateFontWeight(t.originalValue.$value, {
            node: getObjMember(t.source.node, '$value') as StringNode,
            filename: t.source.filename,
          });
          break;
        }
        case 'typography': {
          if (typeof t.originalValue.$value === 'object' && t.originalValue.$value.fontWeight) {
            if (t.partialAliasOf?.fontWeight) {
              continue;
            }
            const $value = getObjMember(t.source.node, '$value');
            const properties = getObjMembers($value as ObjectNode);
            validateFontWeight(t.originalValue.$value.fontWeight, {
              node: properties.fontWeight as StringNode,
              filename: t.source.filename,
            });
          }
          break;
        }
      }

      function validateFontWeight(
        value: unknown,
        { node, filename }: { node: StringNode | NumberNode; filename?: string },
      ) {
        if (typeof value === 'string') {
          if (options.style === 'numbers') {
            report({ messageId: ERROR_STYLE, data: { style: 'numbers', value }, node, filename });
          } else if (!(value in FONT_WEIGHTS)) {
            report({ messageId: ERROR, node, filename });
          }
        } else if (typeof value === 'number') {
          if (options.style === 'names') {
            report({ messageId: ERROR_STYLE, data: { style: 'names', value }, node, filename });
          } else if (!(value >= 0 && value < 1000)) {
            report({ messageId: ERROR, node, filename });
          }
        } else {
          report({ messageId: ERROR, node, filename });
        }
      }
    }
  },
};

export default rule;
