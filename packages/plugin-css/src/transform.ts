import type { TokenNormalized, TransformHookOptions } from '@terrazzo/parser';
import {
  transformBooleanValue,
  transformBorderValue,
  transformColorValue,
  transformCubicBezierValue,
  transformDimensionValue,
  transformDurationValue,
  transformFontFamilyValue,
  transformFontWeightValue,
  transformGradientValue,
  transformLinkValue,
  transformNumberValue,
  transformShadowValue,
  transformStringValue,
  transformStrokeStyleValue,
  transformTransitionValue,
  transformTypographyValue,
} from '@terrazzo/token-tools/css';
import { FORMAT_ID } from './lib.js';

export interface TransformValueOptions {
  transformAlias: (id: string) => string;
  id: string;
  localID: string;
  setTransform: TransformHookOptions['setTransform'];
}

export default function transformValue(
  token: TokenNormalized,
  { id, localID, transformAlias, setTransform }: TransformValueOptions,
): void {
  switch (token.$type) {
    case 'boolean': {
      for (const mode in token.mode) {
        const { $value, aliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformBooleanValue($value, { aliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
    case 'border': {
      for (const mode in token.mode) {
        const { $value, aliasOf, partialAliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformBorderValue($value, { aliasOf, partialAliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
    case 'color': {
      for (const mode in token.mode) {
        const { $value, aliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformColorValue($value, { aliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
    case 'cubicBezier': {
      for (const mode in token.mode) {
        const { $value, aliasOf, partialAliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformCubicBezierValue($value, { aliasOf, partialAliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
    case 'dimension': {
      for (const mode in token.mode) {
        const { $value, aliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformDimensionValue($value, { aliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
    case 'duration': {
      for (const mode in token.mode) {
        const { $value, aliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformDurationValue($value, { aliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
    case 'fontFamily': {
      for (const mode in token.mode) {
        const { $value, aliasOf, partialAliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformFontFamilyValue($value, { aliasOf, partialAliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
    case 'fontWeight': {
      for (const mode in token.mode) {
        const { $value, aliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformFontWeightValue($value, { aliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
    case 'gradient': {
      for (const mode in token.mode) {
        const { $value, aliasOf, partialAliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformGradientValue($value, { aliasOf, partialAliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
    case 'link': {
      for (const mode in token.mode) {
        const { $value, aliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformLinkValue($value, { aliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
    case 'number': {
      for (const mode in token.mode) {
        const { $value, aliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformNumberValue($value, { aliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
    case 'shadow': {
      for (const mode in token.mode) {
        const { $value, aliasOf, partialAliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformShadowValue($value, { aliasOf, partialAliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
    case 'string': {
      for (const mode in token.mode) {
        const { $value, aliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformStringValue($value, { aliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
    case 'strokeStyle': {
      for (const mode in token.mode) {
        const { $value, aliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformStrokeStyleValue($value, { aliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
    case 'transition': {
      for (const mode in token.mode) {
        const { $value, aliasOf, partialAliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformTransitionValue($value, { aliasOf, partialAliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
    case 'typography': {
      for (const mode in token.mode) {
        const { $value, aliasOf, partialAliasOf } = token.mode[mode]!;
        setTransform(id, {
          format: FORMAT_ID,
          localID,
          value: transformTypographyValue($value, { aliasOf, partialAliasOf, transformAlias }),
          mode,
        });
      }
      break;
    }
  }
}
