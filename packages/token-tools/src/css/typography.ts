import { kebabCase } from '../string.js';
import type {
  DimensionTokenNormalized,
  FontFamilyTokenNormalized,
  FontWeightTokenNormalized,
  NumberTokenNormalized,
  StringTokenNormalized,
  TokenNormalized,
  TokenTransformedMultiValue,
  TypographyTokenNormalized,
} from '../types.js';
import type { TransformCSSValueOptions } from './css-types.js';
import { transformDimension } from './dimension.js';
import { transformFontFamily } from './font-family.js';
import { transformFontWeight } from './font-weight.js';
import { defaultAliasTransform } from './lib.js';
import { transformNumber } from './number.js';
import { transformString } from './string.js';

/** Convert typography value to multiple CSS values */
export function transformTypography(
  token: TypographyTokenNormalized,
  options: TransformCSSValueOptions,
): TokenTransformedMultiValue['value'] {
  const { tokensSet, transformAlias = defaultAliasTransform } = options;
  const output: Record<string, string> = {};
  for (const [property, subvalue] of Object.entries(token.$value)) {
    let transformedValue: string;
    const aliasedID = token.aliasChain?.[0] ?? token.partialAliasOf?.[property];
    if (aliasedID) {
      const resolvedToken = tokensSet[aliasedID] as TypographyTokenNormalized;
      transformedValue = transformAlias(
        // When aliasing a typography token we reference a single sub-property,
        // so hand `transformAlias` a complete token for that sub-value rather
        // than a bare `{ id }` stub. The default id-generator reads only `id`
        // (CSS var output is unchanged), while consumers that recursively
        // transform the alias — e.g. preview-value computation — get a real
        // `$type` / `$value` / `mode` instead of dereferencing an undefined
        // `mode`.
        resolvedToken.$type === 'typography'
          ? ({
              id: `${aliasedID}-${property}`,
              $type: typographySubValueType(property, subvalue),
              $value: subvalue,
              mode: { '.': { $value: subvalue } },
            } as TokenNormalized)
          : resolvedToken,
      );
    } else {
      switch (property) {
        case 'fontFamily': {
          transformedValue = transformFontFamily({ $value: subvalue } as FontFamilyTokenNormalized, options);
          break;
        }
        case 'fontSize':
        case 'letterSpacing': {
          transformedValue = transformDimension({ $value: subvalue } as DimensionTokenNormalized, options);
          break;
        }
        case 'fontWeight': {
          transformedValue = transformFontWeight({ $value: subvalue } as FontWeightTokenNormalized, options);
          break;
        }
        case 'lineHeight': {
          if (typeof subvalue === 'number') {
            transformedValue = transformNumber({ $value: subvalue } as NumberTokenNormalized, options);
          } else {
            transformedValue = transformDimension({ $value: subvalue } as DimensionTokenNormalized, options);
          }
          break;
        }
        default: {
          // For other typography properties, dimensions are the only other likely token type
          if (subvalue && typeof subvalue === 'object' && 'value' in subvalue) {
            transformedValue = transformDimension({ $value: subvalue } as DimensionTokenNormalized, options);
          } else if (typeof subvalue === 'number') {
            // number is technically allowed for things like `paragraph-spacing: 0`
            transformedValue = transformNumber({ $value: subvalue } as NumberTokenNormalized, options);
          } else {
            transformedValue = transformString({ $value: subvalue } as StringTokenNormalized, options);
          }
          break;
        }
      }
    }
    output[kebabCase(property)] = transformedValue;
  }
  return output;
}

/** Map a typography sub-property to the `$type` its value transforms as. Mirrors the per-property switch above. */
function typographySubValueType(property: string, subvalue: unknown): string {
  switch (property) {
    case 'fontFamily':
      return 'fontFamily';
    case 'fontWeight':
      return 'fontWeight';
    case 'fontSize':
    case 'letterSpacing':
      return 'dimension';
    case 'lineHeight':
      return typeof subvalue === 'number' ? 'number' : 'dimension';
    default: {
      if (subvalue && typeof subvalue === 'object' && 'value' in subvalue) {
        return 'dimension';
      }
      if (typeof subvalue === 'number') {
        return 'number';
      }
      return 'string';
    }
  }
}
