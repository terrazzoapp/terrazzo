import type * as momoa from '@humanwhocodes/momoa';
import { getObjMember } from '@terrazzo/json-schema-tools';
import { GRADIENT_REQUIRED_STOP_PROPERTIES, isAlias } from '@terrazzo/token-tools';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_GRADIENT = 'core/valid-gradient';

const ERROR_MISSING = 'ERROR_MISSING';
const ERROR_POSITION = 'ERROR_POSITION';
const ERROR_INVALID_PROP = 'ERROR_INVALID_PROP';

const rule: LintRule<typeof ERROR_MISSING | typeof ERROR_POSITION | typeof ERROR_INVALID_PROP> = {
  meta: {
    messages: {
      [ERROR_MISSING]: 'Must be an array of { color, position } objects.',
      [ERROR_POSITION]: 'Expected number 0-1, received {{ value }}.',
      [ERROR_INVALID_PROP]: 'Unknown property {{ key }}.',
    },
    docs: {
      description: 'Require gradient tokens to follow the format.',
      url: docsLink(VALID_GRADIENT),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || !t.originalValue || t.$type !== 'gradient') {
        continue;
      }

      validateGradient(t.originalValue.$value, {
        node: getObjMember(t.source.node, '$value') as momoa.ArrayNode,
        filename: t.source.filename,
      });

      function validateGradient(value: unknown, { node, filename }: { node: momoa.ArrayNode; filename?: string }) {
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            const stop = value[i]!;
            if (!stop || typeof stop !== 'object') {
              report({ messageId: ERROR_MISSING, node, filename });
              continue;
            }
            for (const property of GRADIENT_REQUIRED_STOP_PROPERTIES) {
              if (!(property in stop)) {
                report({ messageId: ERROR_MISSING, node: node.elements[i], filename });
              }
            }
            for (const key of Object.keys(stop)) {
              if (
                !GRADIENT_REQUIRED_STOP_PROPERTIES.includes(key as (typeof GRADIENT_REQUIRED_STOP_PROPERTIES)[number])
              ) {
                report({
                  messageId: ERROR_INVALID_PROP,
                  data: { key: JSON.stringify(key) },
                  node: node.elements[i],
                  filename,
                });
              }
            }
            if ('position' in stop && typeof stop.position !== 'number' && !isAlias(stop.position as string)) {
              report({
                messageId: ERROR_POSITION,
                data: { value: stop.position },
                node: getObjMember(node.elements[i]!.value as momoa.ObjectNode, 'position'),
                filename,
              });
            }
          }
        } else {
          report({ messageId: ERROR_MISSING, node, filename });
        }
      }
    }
  },
};

export default rule;
