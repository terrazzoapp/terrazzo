import type { ArrayNode, ObjectNode } from '@humanwhocodes/momoa';
import { isAlias } from '@terrazzo/token-tools';
import { getObjMember, isPure$ref } from '../../../parse/json.js';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_CUBIC_BEZIER = 'core/valid-cubic-bezier';

const ERROR = 'ERROR';
const ERROR_X = 'ERROR_X';
const ERROR_Y = 'ERROR_Y';

const rule: LintRule<typeof ERROR | typeof ERROR_X | typeof ERROR_Y> = {
  meta: {
    messages: {
      [ERROR]: 'Expected [number, number, number, number].',
      [ERROR_X]: 'x values must be between 0-1.',
      [ERROR_Y]: 'y values must be a valid number.',
    },
    docs: {
      description: 'Require cubicBezier tokens to follow the format.',
      url: docsLink(VALID_CUBIC_BEZIER),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || !t.originalValue) {
        continue;
      }

      switch (t.$type) {
        case 'cubicBezier': {
          validateCubicBezier(t.originalValue.$value, {
            node: getObjMember(t.source.node, '$value') as ArrayNode,
            filename: t.source.filename,
          });
          break;
        }
        case 'transition': {
          if (
            typeof t.originalValue.$value === 'object' &&
            t.originalValue.$value.timingFunction &&
            !isAlias(t.originalValue.$value.timingFunction as string)
          ) {
            const $valueNode = getObjMember(t.source.node, '$value') as ObjectNode;
            validateCubicBezier(t.originalValue.$value.timingFunction, {
              node: getObjMember($valueNode, 'timingFunction') as ArrayNode,
              filename: t.source.filename,
            });
          }
        }
      }

      function validateCubicBezier(value: unknown, { node, filename }: { node: ArrayNode; filename?: string }) {
        if (Array.isArray(value) && value.length === 4) {
          // validate x values
          for (const pos of [0, 2]) {
            if (isAlias(value[pos]) || isPure$ref(value[pos])) {
              continue;
            }
            if (!(value[pos] >= 0 && value[pos] <= 1)) {
              report({ messageId: ERROR_X, node: (node as ArrayNode).elements[pos], filename });
            }
          }
          // validate y values
          for (const pos of [1, 3]) {
            if (isAlias(value[pos]) || isPure$ref(value[pos])) {
              continue;
            }
            if (typeof value[pos] !== 'number') {
              report({ messageId: ERROR_Y, node: (node as ArrayNode).elements[pos], filename });
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
