import type * as momoa from '@humanwhocodes/momoa';
import { getObjMember } from '@terrazzo/json-schema-tools';
import { TRANSITION_REQUIRED_PROPERTIES } from '@terrazzo/token-tools';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_TRANSITION = 'core/valid-transition';

const ERROR = 'ERROR';
const ERROR_INVALID_PROP = 'ERROR_INVALID_PROP';

const rule: LintRule<typeof ERROR | typeof ERROR_INVALID_PROP> = {
  meta: {
    messages: {
      [ERROR]: `Missing required properties: ${new Intl.ListFormat('en-us', { type: 'conjunction' }).format(TRANSITION_REQUIRED_PROPERTIES)}.`,
      [ERROR_INVALID_PROP]: 'Unknown property: {{ key }}.',
    },
    docs: {
      description: 'Require transition tokens to follow the format.',
      url: docsLink(VALID_TRANSITION),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || !t.originalValue || t.$type !== 'transition') {
        continue;
      }

      validateTransition(t.originalValue.$value, {
        node: getObjMember(t.source.node, '$value') as momoa.ObjectNode,
        filename: t.source.filename,
      });
    }

    // Note: we validate sub-properties using other checks like valid-dimension, valid-font-family, etc.
    // The only thing remaining is to check that all properties exist (since missing properties won’t appear as invalid)
    function validateTransition(value: unknown, { node, filename }: { node: momoa.ObjectNode; filename?: string }) {
      if (
        !value ||
        typeof value !== 'object' ||
        !TRANSITION_REQUIRED_PROPERTIES.every((property) => property in value)
      ) {
        report({ messageId: ERROR, node, filename });
      } else {
        for (const key of Object.keys(value)) {
          if (!TRANSITION_REQUIRED_PROPERTIES.includes(key as (typeof TRANSITION_REQUIRED_PROPERTIES)[number])) {
            report({
              messageId: ERROR_INVALID_PROP,
              data: { key: JSON.stringify(key) },
              node: getObjMember(node, key),
              filename,
            });
          }
        }
      }
    }
  },
};

export default rule;
