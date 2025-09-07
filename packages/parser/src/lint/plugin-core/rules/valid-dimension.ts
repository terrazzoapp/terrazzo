import type { AnyNode, ArrayNode, ObjectNode } from '@humanwhocodes/momoa';
import { isAlias } from '@terrazzo/token-tools';
import { getObjMember } from '../../../parse/json.js';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_DIMENSION = 'core/valid-dimension';

const ERROR_FORMAT = 'ERROR_FORMAT';
const ERROR_LEGACY = 'ERROR_LEGACY';
const ERROR_UNIT = 'ERROR_UNIT';
const ERROR_VALUE = 'ERROR_VALUE';

export interface RuleValidDimension {
  /**
   * Allow the use of unknown "unit" values
   * @default false
   */
  legacyFormat?: boolean;
  /**
   * Allow the use of unknown "unit" values
   * @default false
   */
  unknownUnits?: boolean;
}

const rule: LintRule<
  typeof ERROR_FORMAT | typeof ERROR_LEGACY | typeof ERROR_UNIT | typeof ERROR_VALUE,
  RuleValidDimension
> = {
  meta: {
    messages: {
      [ERROR_FORMAT]: 'Invalid dimension: {{ value }}. Expected object with "value" and "unit".',
      [ERROR_LEGACY]: 'Migrate to the new object format: { "value": 10, "unit": "px" }.',
      [ERROR_UNIT]: 'Unknown unit {{ unit }}. Expected "px" or "rem".',
      [ERROR_VALUE]: 'Expected number, received {{ value }}.',
    },
    docs: {
      description: 'Require dimension tokens to follow the format',
      url: docsLink(VALID_DIMENSION),
    },
  },
  defaultOptions: {
    legacyFormat: false,
    unknownUnits: false,
  },
  create({ tokens, options, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf || !t.originalValue) {
        continue;
      }

      switch (t.$type) {
        case 'dimension': {
          validateDimension(t.originalValue.$value, {
            node: getObjMember(t.source.node, '$value'),
            filename: t.source.filename,
          });
          break;
        }
        case 'strokeStyle': {
          if (typeof t.originalValue.$value === 'object' && Array.isArray(t.originalValue.$value.dashArray)) {
            const $valueNode = getObjMember(t.source.node, '$value') as ObjectNode;
            const dashArray = getObjMember($valueNode, 'dashArray') as ArrayNode;
            for (let i = 0; i < t.originalValue.$value.dashArray.length; i++) {
              validateDimension(t.originalValue.$value.dashArray[i], {
                node: dashArray.elements[i]!.value,
                filename: t.source.filename,
              });
            }
          }
          break;
        }
        case 'border': {
          const $valueNode = getObjMember(t.source.node, '$value') as ObjectNode;
          if (typeof t.originalValue.$value === 'object') {
            if (t.originalValue.$value.width && !isAlias(t.originalValue.$value.width as string)) {
              validateDimension(t.originalValue.$value.width, {
                node: getObjMember($valueNode, 'width'),
                filename: t.source.filename,
              });
            }
            if (
              typeof t.originalValue.$value.style === 'object' &&
              Array.isArray(t.originalValue.$value.style.dashArray)
            ) {
              const style = getObjMember($valueNode, 'style') as ObjectNode;
              const dashArray = getObjMember(style, 'dashArray') as ArrayNode;
              for (let i = 0; i < t.originalValue.$value.style.dashArray.length; i++) {
                if (isAlias(t.originalValue.$value.style.dashArray[i] as string)) {
                  continue;
                }
                validateDimension(t.originalValue.$value.style.dashArray[i], {
                  node: dashArray.elements[i]!.value,
                  filename: t.source.filename,
                });
              }
            }
          }
          break;
        }
        case 'shadow': {
          if (t.originalValue.$value && typeof t.originalValue.$value === 'object') {
            const $valueNode = getObjMember(t.source.node, '$value') as ObjectNode | ArrayNode;
            const valueArray = Array.isArray(t.originalValue.$value)
              ? t.originalValue.$value
              : [t.originalValue.$value];
            for (let i = 0; i < valueArray.length; i++) {
              const node = $valueNode.type === 'Array' ? ($valueNode.elements[i]!.value as ObjectNode) : $valueNode;
              for (const property of ['offsetX', 'offsetY', 'blur', 'spread'] as const) {
                if (isAlias(valueArray[i]![property] as string)) {
                  continue;
                }
                validateDimension(valueArray[i]![property], {
                  node: getObjMember(node, property),
                  filename: t.source.filename,
                });
              }
            }
          }
          break;
        }
        case 'typography': {
          const $valueNode = getObjMember(t.source.node, '$value') as ObjectNode;
          if (typeof t.originalValue.$value === 'object') {
            for (const property of ['fontSize', 'lineHeight', 'letterSpacing'] as const) {
              if (property in t.originalValue.$value) {
                // special case: lineHeight may be a number
                if (property === 'lineHeight' && typeof t.originalValue.$value[property] === 'number') {
                  continue;
                }
                validateDimension(t.originalValue.$value[property], {
                  node: getObjMember($valueNode, property),
                  filename: t.source.filename,
                });
              }
            }
          }
          break;
        }
      }

      function validateDimension(value: unknown, { node, filename }: { node?: AnyNode; filename?: string }) {
        if (value && typeof value === 'object') {
          const { unit, value: numValue } = value as Record<string, any>;
          if (!('value' in value || 'unit' in value)) {
            report({ messageId: ERROR_FORMAT, data: { value }, node, filename });
            return;
          }
          if (!options.unknownUnits && !['rem', 'px'].includes(unit)) {
            report({
              messageId: ERROR_UNIT,
              data: { unit },
              node: getObjMember(node as ObjectNode, 'unit') ?? node,
              filename,
            });
          }
          if (!Number.isFinite(numValue)) {
            report({
              messageId: ERROR_VALUE,
              data: { value },
              node: getObjMember(node as ObjectNode, 'value') ?? node,
              filename,
            });
          }
        } else if (typeof value === 'string' && !options.legacyFormat) {
          report({ messageId: ERROR_LEGACY, node, filename });
        } else {
          report({ messageId: ERROR_FORMAT, data: { value }, node, filename });
        }
      }
    }
  },
};

export default rule;
