import { kebabCase } from 'scule';
import type { AliasValue, DimensionValue } from '../types.js';
import { transformFontFamilyValue } from './font-family.js';
import { transformFontWeightValue } from './font-weight.js';
import { type IDGenerator, defaultAliasTransform, transformCompositeAlias } from './lib.js';
import { transformStringValue } from './string.js';
import { transformDimensionValue } from './dimension.js';

/** Convert typography value to multiple CSS values */
export function transformTypographyValue(
  value: Record<string, string | string[]>,
  {
    aliasOf,
    partialAliasOf,
    transformAlias = defaultAliasTransform,
  }: { aliasOf?: string; partialAliasOf?: Record<keyof typeof value, string>; transformAlias?: IDGenerator } = {},
): Record<string, string> {
  const output: Record<string, string> = {};
  if (aliasOf) {
    return transformCompositeAlias(value, { aliasOf, transformAlias });
  }
  for (const [property, subvalue] of Object.entries(value)) {
    let transformedValue: string;
    if (partialAliasOf?.[property]) {
      transformedValue = transformAlias(partialAliasOf[property]!);
    } else {
      switch (property) {
        case 'fontFamily': {
          transformedValue = transformFontFamilyValue(subvalue as string[], { transformAlias });
          break;
        }
        case 'fontSize': {
          transformedValue = transformDimensionValue(subvalue as DimensionValue | AliasValue, { transformAlias });
          break;
        }
        case 'fontWeight': {
          transformedValue = transformFontWeightValue(subvalue as string, { transformAlias });
          break;
        }
        default: {
          transformedValue = transformStringValue(subvalue as string, { transformAlias });
          break;
        }
      }
    }
    output[kebabCase(property)] = transformedValue;
  }
  return output;
}
