import type { ObjectNode, StringNode } from '@humanwhocodes/momoa';
import {
  STROKE_STYLE_LINE_CAP_VALUES,
  STROKE_STYLE_OBJECT_REQUIRED_PROPERTIES,
  STROKE_STYLE_STRING_VALUES,
  TRANSITION_REQUIRED_PROPERTIES,
} from '@terrazzo/token-tools';
import { getObjMember } from '../../../parse/json.js';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_STROKE_STYLE = 'core/valid-stroke-style';

const ERROR_STR = 'ERROR_STR';
const ERROR_OBJ = 'ERROR_OBJ';
const ERROR_LINE_CAP = 'ERROR_LINE_CAP';

const rule: LintRule<typeof ERROR_STR | typeof ERROR_OBJ | typeof ERROR_LINE_CAP> = {
  meta: {
    messages: {
      [ERROR_STR]: `Value most be one of ${new Intl.ListFormat(undefined, { type: 'disjunction' }).format(STROKE_STYLE_STRING_VALUES)}.`,
      [ERROR_OBJ]: `Missing required properties: ${new Intl.ListFormat(undefined, { type: 'conjunction' }).format(TRANSITION_REQUIRED_PROPERTIES)}.`,
      [ERROR_LINE_CAP]: `lineCap must be one of ${new Intl.ListFormat(undefined, { type: 'disjunction' }).format(STROKE_STYLE_LINE_CAP_VALUES)}.`,
    },
    docs: {
      description: 'Require strokeStyle tokens to follow the format.',
      url: docsLink(VALID_STROKE_STYLE),
    },
  },
  defaultOptions: {},
  create({ tokens, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf) {
        continue;
      }

      switch (t.$type) {
        case 'strokeStyle': {
          validateStrokeStyle(t.originalValue.$value, {
            node: getObjMember(t.source.node, '$value') as ObjectNode,
            filename: t.source.filename,
          });
          break;
        }
        case 'border': {
          if (t.originalValue.$value && typeof t.originalValue.$value === 'object') {
            const $valueNode = getObjMember(t.source.node, '$value') as ObjectNode;
            if (t.originalValue.$value.style) {
              validateStrokeStyle(t.originalValue.$value.style, {
                node: getObjMember($valueNode, 'style') as ObjectNode,
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
        { node, filename }: { node: StringNode | ObjectNode; filename?: string },
      ) {
        if (typeof value === 'string') {
          if (!STROKE_STYLE_STRING_VALUES.includes(value as (typeof STROKE_STYLE_STRING_VALUES)[number])) {
            report({ messageId: ERROR_STR, node, filename });
            return;
          }
        } else if (value && typeof value === 'object') {
          if (!STROKE_STYLE_OBJECT_REQUIRED_PROPERTIES.every((property) => property in value)) {
            report({ messageId: ERROR_OBJ, node, filename });
          }
          if (!Array.isArray((value as any).dashArray)) {
            report({ messageId: ERROR_OBJ, node: getObjMember(node as ObjectNode, 'dashArray'), filename });
          }
          if (!STROKE_STYLE_LINE_CAP_VALUES.includes((value as any).lineCap)) {
            report({ messageId: ERROR_OBJ, node: getObjMember(node as ObjectNode, 'lineCap'), filename });
          }
        } else {
          report({ messageId: ERROR_OBJ, node, filename });
        }
      }
    }
  },
};

export default rule;
