import type * as momoa from '@humanwhocodes/momoa';
import { getObjMember } from '@terrazzo/json-schema-tools';
import { SHADOW_REQUIRED_PROPERTIES } from '@terrazzo/token-tools';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_SHADOW = 'core/valid-shadow';

const ERROR = 'ERROR';
const ERROR_INVALID_PROP = 'ERROR_INVALID_PROP';

const rule: LintRule<typeof ERROR | typeof ERROR_INVALID_PROP> = {
  meta: {
    messages: {
      [ERROR]: `Missing required properties: ${new Intl.ListFormat('en-us', { type: 'conjunction' }).format(SHADOW_REQUIRED_PROPERTIES)}.`,
      [ERROR_INVALID_PROP]: 'Unknown property {{ key }}.',
    },
    docs: {
      description: 'Require shadow tokens to follow the format.',
      url: docsLink(VALID_SHADOW),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || !t.originalValue || t.$type !== 'shadow') {
        continue;
      }

      validateShadow(t.originalValue.$value, {
        node: getObjMember(t.source.node, '$value') as momoa.ObjectNode,
        filename: t.source.filename,
      });

      // Note: we validate sub-properties using other checks like valid-dimension, valid-font-family, etc.
      // The only thing remaining is to check that all properties exist (since missing properties won’t appear as invalid)
      function validateShadow(
        value: unknown,
        { node, filename }: { node: momoa.ObjectNode | momoa.ArrayNode; filename?: string },
      ) {
        const wrappedValue = Array.isArray(value) ? value : [value];
        for (let i = 0; i < wrappedValue.length; i++) {
          if (
            !wrappedValue[i] ||
            typeof wrappedValue[i] !== 'object' ||
            !SHADOW_REQUIRED_PROPERTIES.every((property) => property in wrappedValue[i])
          ) {
            report({ messageId: ERROR, node, filename });
          } else {
            for (const key of Object.keys(wrappedValue[i])) {
              if (![...SHADOW_REQUIRED_PROPERTIES, 'inset'].includes(key)) {
                report({
                  messageId: ERROR_INVALID_PROP,
                  data: { key: JSON.stringify(key) },
                  node: getObjMember(node.type === 'Array' ? (node.elements[i]!.value as momoa.ObjectNode) : node, key),
                  filename,
                });
              }
            }
          }
        }
      }
    }
  },
};

export default rule;
