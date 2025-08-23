import type { AnyNode, ArrayNode, ObjectNode } from '@humanwhocodes/momoa';
import {
  type BorderValue,
  COLORSPACE,
  type ColorSpaceDefinition,
  type ColorValueNormalized,
  type GradientStopNormalized,
  type GradientValueNormalized,
  parseColor,
  type ShadowValueNormalized,
} from '@terrazzo/token-tools';
import { getObjMember } from '../../../parse/json.js';
import type { LintRule } from '../../../types.js';
import { docsLink } from '../lib/docs.js';

export const VALID_COLOR = 'core/valid-color';

const ERROR_ALPHA = 'ERROR_ALPHA';
const ERROR_INVALID_COLOR = 'ERROR_INVALID_COLOR';
const ERROR_INVALID_COLOR_SPACE = 'ERROR_INVALID_COLOR_SPACE';
const ERROR_INVALID_COMPONENT_LENGTH = 'ERROR_INVALID_COMPONENT_LENGTH';
const ERROR_INVALID_HEX8 = 'ERROR_INVALID_HEX8';
const ERROR_MISSING_COMPONENTS = 'ERROR_MISSING_COMPONENTS';
const ERROR_OBJ_FORMAT = 'ERROR_OBJ_FORMAT';
const ERROR_OUT_OF_RANGE = 'ERROR_OUT_OF_RANGE';

export interface RuleValidColorOptions {
  /**
   * Allow the legacy format of only a string sRGB hex code
   * @default false
   */
  legacyFormat?: boolean;
  /**
   * Allow colors to be defined out of the expected ranges.
   * @default false
   */
  ignoreRanges?: boolean;
}

const rule: LintRule<
  | typeof ERROR_ALPHA
  | typeof ERROR_INVALID_COLOR
  | typeof ERROR_INVALID_COLOR_SPACE
  | typeof ERROR_INVALID_COMPONENT_LENGTH
  | typeof ERROR_INVALID_HEX8
  | typeof ERROR_MISSING_COMPONENTS
  | typeof ERROR_OBJ_FORMAT
  | typeof ERROR_OUT_OF_RANGE,
  RuleValidColorOptions
> = {
  meta: {
    messages: {
      [ERROR_ALPHA]: `Alpha {{ alpha }} not in range 0 – 1.`,
      [ERROR_INVALID_COLOR_SPACE]: `Invalid color space: {{ colorSpace }}. Expected ${new Intl.ListFormat(undefined, { type: 'disjunction' }).format(Object.keys(COLORSPACE))}`,
      [ERROR_INVALID_COLOR]: `Could not parse color {{ color }}.`,
      [ERROR_INVALID_COMPONENT_LENGTH]: 'Expected {{ expected }} components, received {{ got }}.',
      [ERROR_INVALID_HEX8]: `Hex value can’t be semi-transparent.`,
      [ERROR_MISSING_COMPONENTS]: 'Expected components to be array of numbers, received {{ got }}.',
      [ERROR_OBJ_FORMAT]:
        'Migrate to the new object format, e.g. "#ff0000" → { "colorSpace": "srgb", "components": [1, 0, 0] } }',
      [ERROR_OUT_OF_RANGE]: `Invalid range for color space {{ colorSpace }}. Expected {{ range }}.`,
    },
    docs: {
      description: 'Require color tokens to follow the format.',
      url: docsLink(VALID_COLOR),
    },
  },
  defaultOptions: {
    legacyFormat: false,
    ignoreRanges: false,
  },
  create({ tokens, options, report }) {
    for (const t of Object.values(tokens)) {
      if (t.aliasOf) {
        continue;
      }

      switch (t.$type) {
        case 'color': {
          validateColor(t.originalValue.$value, {
            node: getObjMember(t.source.node, '$value'),
            filename: t.source.filename,
          });
          break;
        }
        case 'border': {
          validateColor((t.originalValue.$value as BorderValue).color, {
            node: getObjMember(getObjMember(t.source.node, '$value') as ObjectNode, 'color'),
            filename: t.source.filename,
          });
          break;
        }
        case 'gradient': {
          const $valueNode = getObjMember(t.source.node, '$value') as ArrayNode;
          for (let i = 0; i < (t.originalValue.$value as GradientValueNormalized).length; i++) {
            const stop = t.originalValue.$value[i] as GradientStopNormalized;
            if (!stop.color) {
              continue;
            }
            validateColor(stop.color, {
              node: getObjMember($valueNode.elements[i]!.value as ObjectNode, 'color'),
              filename: t.source.filename,
            });
          }
          break;
        }
        case 'shadow': {
          const $value = (
            Array.isArray(t.originalValue.$value) ? t.originalValue.$value : [t.originalValue.$value]
          ) as ShadowValueNormalized[];
          const $valueNode = getObjMember(t.source.node, '$value') as ObjectNode | ArrayNode;
          for (let i = 0; i < $value.length; i++) {
            const layer = $value[i]!;
            if (!layer.color) {
              continue;
            }
            validateColor(layer.color, {
              node:
                $valueNode.type === 'Object'
                  ? getObjMember($valueNode, 'color')
                  : getObjMember($valueNode.elements[i]!.value as ObjectNode, 'color'),
              filename: t.source.filename,
            });
          }
          break;
        }
      }

      function validateColor(value: unknown, { node, filename }: { node?: AnyNode; filename?: string }) {
        if (value && typeof value === 'object') {
          // Color space
          const colorSpace =
            'colorSpace' in value && typeof value.colorSpace === 'string' ? value.colorSpace : undefined;
          const csData = (COLORSPACE as Record<string, ColorSpaceDefinition>)[colorSpace!] || undefined;
          if (!('colorSpace' in value) || !csData) {
            report({
              messageId: ERROR_INVALID_COLOR_SPACE,
              data: { colorSpace },
              node: getObjMember(node as ObjectNode, 'colorSpace') ?? node,
              filename,
            });
            return;
          }

          // Component ranges
          const components = 'components' in value && Array.isArray(value.components) ? value.components : undefined;
          if (components) {
            if (csData?.ranges && components?.length === csData.ranges.length) {
              for (let i = 0; i < components.length; i++) {
                if (
                  !Number.isFinite(components[i]) ||
                  components[i]! < csData.ranges[i]![0] ||
                  components[i]! > csData.ranges[i]![1]
                ) {
                  // special case for any hue-based components: allow null
                  if (
                    !(colorSpace === 'hsl' && components[0]! === null) &&
                    !(colorSpace === 'hwb' && components[0]! === null) &&
                    !(colorSpace === 'lch' && components[2]! === null) &&
                    !(colorSpace === 'oklch' && components[2]! === null)
                  ) {
                    report({
                      messageId: ERROR_OUT_OF_RANGE,
                      data: { colorSpace, range: `[${csData.ranges.map((r) => `${r[0]}–${r[1]}`).join(', ')}]` },
                      node: getObjMember(node as ObjectNode, 'components') ?? node,
                      filename,
                    });
                  }
                }
              }
            } else {
              report({
                messageId: ERROR_INVALID_COMPONENT_LENGTH,
                data: { expected: csData?.ranges.length, got: (components as number[] | undefined)?.length ?? 0 },
                node: getObjMember(node as ObjectNode, 'components') ?? node,
                filename,
              });
            }
          } else {
            report({ messageId: ERROR_MISSING_COMPONENTS, data: { got: JSON.stringify(components) }, node, filename });
          }

          // Alpha
          const alpha = 'alpha' in value ? value.alpha : undefined;
          if (typeof alpha !== 'number' || alpha < 0 || alpha > 1) {
            report({
              messageId: ERROR_ALPHA,
              data: { alpha },
              node: getObjMember(node as ObjectNode, 'alpha') ?? node,
              filename,
            });
          }

          // Hex
          const hex = 'hex' in value ? value.hex : undefined;
          if (hex) {
            let color: ColorValueNormalized;
            try {
              color = parseColor(hex as string);
            } catch {
              report({
                messageId: ERROR_INVALID_COLOR,
                data: { color: hex },
                node: getObjMember(node as ObjectNode, 'hex') ?? node,
                filename,
              });
              return;
            }
            // since we’re only parsing hex, this should always have alpha: 1
            if (color.alpha !== 1) {
              report({
                messageId: ERROR_INVALID_HEX8,
                data: { color: hex },
                node: getObjMember(node as ObjectNode, 'hex') ?? node,
                filename,
              });
            }
          }
        } else if (!options.legacyFormat) {
          // Legacy format
          try {
            parseColor(value as string);
          } catch {
            report({ messageId: ERROR_INVALID_COLOR, data: { color: JSON.stringify(value) }, node, filename });
          }
          return;
        } else {
          report({ messageId: ERROR_OBJ_FORMAT, node, filename });
        }
      }
    }
  },
};

export default rule;
