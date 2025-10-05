import type * as momoa from '@humanwhocodes/momoa';
import { getObjMember } from '@terrazzo/json-schema-tools';
import {
  isAlias,
  STROKE_STYLE_LINE_CAP_VALUES,
  STROKE_STYLE_OBJECT_REQUIRED_PROPERTIES,
  STROKE_STYLE_STRING_VALUES,
  TRANSITION_REQUIRED_PROPERTIES,
} from '@terrazzo/token-tools';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_STROKE_STYLE = 'core/valid-stroke-style';

const ERROR_STR = 'ERROR_STR';
const ERROR_OBJ = 'ERROR_OBJ';
const ERROR_LINE_CAP = 'ERROR_LINE_CAP';
const ERROR_INVALID_PROP = 'ERROR_INVALID_PROP';

const rule: LintRule<typeof ERROR_STR | typeof ERROR_OBJ | typeof ERROR_LINE_CAP | typeof ERROR_INVALID_PROP> = {
  meta: {
    messages: {
      [ERROR_STR]: `Value most be one of ${new Intl.ListFormat(undefined, { type: 'disjunction' }).format(STROKE_STYLE_STRING_VALUES)}.`,
      [ERROR_OBJ]: `Missing required properties: ${new Intl.ListFormat(undefined, { type: 'conjunction' }).format(TRANSITION_REQUIRED_PROPERTIES)}.`,
      [ERROR_LINE_CAP]: `lineCap must be one of ${new Intl.ListFormat(undefined, { type: 'disjunction' }).format(STROKE_STYLE_LINE_CAP_VALUES)}.`,
      [ERROR_INVALID_PROP]: 'Unknown property: {{ key }}.',
    },
    docs: {
      description: 'Require strokeStyle tokens to follow the format.',
      url: docsLink(VALID_STROKE_STYLE),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || !t.originalValue) {
        continue;
      }

      switch (t.$type) {
        case 'strokeStyle': {
          validateStrokeStyle(t.originalValue.$value, {
            node: getObjMember(t.source.node, '$value') as momoa.ObjectNode,
            filename: t.source.filename,
          });
          break;
        }
        case 'border': {
          if (t.originalValue.$value && typeof t.originalValue.$value === 'object') {
            const $valueNode = getObjMember(t.source.node, '$value') as momoa.ObjectNode;
            if (t.originalValue.$value.style) {
              validateStrokeStyle(t.originalValue.$value.style, {
                node: getObjMember($valueNode, 'style') as momoa.ObjectNode,
                filename: t.source.filename,
              });
            }
          }
          break;
        }
      }

      // Note: we validate sub-properties using other checks like valid-dimension, valid-font-family, etc.
      // The only thing remaining is to check that all properties exist (since missing properties won’t appear as invalid)
      function validateStrokeStyle(
        value: unknown,
        { node, filename }: { node: momoa.StringNode | momoa.ObjectNode; filename?: string },
      ) {
        if (typeof value === 'string') {
          if (
            !isAlias(value) &&
            !STROKE_STYLE_STRING_VALUES.includes(value as (typeof STROKE_STYLE_STRING_VALUES)[number])
          ) {
            report({ messageId: ERROR_STR, node, filename });
            return;
          }
        } else if (value && typeof value === 'object') {
          if (!STROKE_STYLE_OBJECT_REQUIRED_PROPERTIES.every((property) => property in value)) {
            report({ messageId: ERROR_OBJ, node, filename });
          }
          if (!Array.isArray((value as any).dashArray)) {
            report({ messageId: ERROR_OBJ, node: getObjMember(node as momoa.ObjectNode, 'dashArray'), filename });
          }
          if (!STROKE_STYLE_LINE_CAP_VALUES.includes((value as any).lineCap)) {
            report({ messageId: ERROR_OBJ, node: getObjMember(node as momoa.ObjectNode, 'lineCap'), filename });
          }
          for (const key of Object.keys(value)) {
            if (!['dashArray', 'lineCap'].includes(key)) {
              report({
                messageId: ERROR_INVALID_PROP,
                data: { key: JSON.stringify(key) },
                node: getObjMember(node as momoa.ObjectNode, key),
                filename,
              });
            }
          }
        } else {
          report({ messageId: ERROR_OBJ, node, filename });
        }
      }
    }
  },
};

export default rule;
