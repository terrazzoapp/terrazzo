import type { ArrayNode } from '@humanwhocodes/momoa';
import { GRADIENT_REQUIRED_STOP_PROPERTIES } from '@terrazzo/token-tools';
import { getObjMember } from '../../../parse/json.js';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_GRADIENT = 'core/valid-gradient';

const ERROR = 'ERROR';

const rule: LintRule<typeof ERROR> = {
  meta: {
    messages: {
      [ERROR]: 'Must be an array of { color, position } objects.',
    },
    docs: {
      description: 'Require gradient tokens to follow the format.',
      url: docsLink(VALID_GRADIENT),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || t.$type !== 'gradient') {
        continue;
      }

      validateGradient(t.originalValue.$value, {
        node: getObjMember(t.source.node, '$value') as ArrayNode,
        filename: t.source.filename,
      });

      function validateGradient(value: unknown, { node, filename }: { node: ArrayNode; filename?: string }) {
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            const stop = value[i]!;
            if (!stop || typeof stop !== 'object') {
              report({ messageId: ERROR, node, filename });
              continue;
            }
            for (const property of GRADIENT_REQUIRED_STOP_PROPERTIES) {
              if (!(property in stop)) {
                report({ messageId: ERROR, node: node.elements[i], filename });
              }
            }
          }
        } else {
          report({ messageId: ERROR, node, filename });
        }
      }
    }
  },
};

export default rule;
