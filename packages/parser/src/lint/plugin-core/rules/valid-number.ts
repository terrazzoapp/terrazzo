import type { NumberNode, ObjectNode } from '@humanwhocodes/momoa';
import { getObjMember } from '../../../parse/json.js';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_NUMBER = 'core/valid-number';

const ERROR_NAN = 'ERROR_NAN';

const rule: LintRule<typeof ERROR_NAN> = {
  meta: {
    messages: {
      [ERROR_NAN]: 'Must be a number.',
    },
    docs: {
      description: 'Require number tokens to follow the format.',
      url: docsLink(VALID_NUMBER),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf) {
        continue;
      }

      switch (t.$type) {
        case 'number': {
          validateNumber(t.originalValue.$value, {
            node: getObjMember(t.source.node, '$value') as NumberNode,
            filename: t.source.filename,
          });
          break;
        }
        // Note: gradient not needed, validated in gradient
        case 'typography': {
          const $valueNode = getObjMember(t.source.node, '$value') as ObjectNode;
          if (typeof t.originalValue.$value === 'object') {
            if (t.originalValue.$value.lineHeight && typeof t.originalValue.$value.lineHeight !== 'object') {
              validateNumber(t.originalValue.$value.lineHeight, {
                node: getObjMember($valueNode, 'lineHeight') as NumberNode,
                filename: t.source.filename,
              });
            }
          }
        }
      }

      function validateNumber(value: unknown, { node, filename }: { node: NumberNode; filename?: string }) {
        if (typeof value !== 'number' || Number.isNaN(value)) {
          report({ messageId: ERROR_NAN, node, filename });
        }
      }
    }
  },
};

export default rule;
