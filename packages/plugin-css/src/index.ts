import type { Plugin } from '@terrazzo/parser';
import { isTokenMatch } from '@terrazzo/token-tools';
import {
  makeCSSVar,
  transformBooleanValue,
  transformBorderValue,
  transformColorValue,
  transformCubicBezierValue,
  transformDimensionValue,
  transformDurationValue,
  transformGradientValue,
  transformNumberValue,
  transformShadowValue,
  transformStringValue,
  transformTransitionValue,
  transformTypographyValue,
} from '@terrazzo/token-tools/css';

export interface ModeSelector {
  /** The name of the mode to match */
  mode: string;
  /** (optional) Provide token IDs to match. Globs are allowed (e.g: `["color.*", "shadow.dark"]`) */
  tokens?: string[];
  /** Provide CSS selectors to generate. (e.g.: `["@media (prefers-color-scheme: dark)", "[data-color-theme='dark']"]` ) */
  selectors: string[];
}

export interface CSSPluginOptions {
  /** Where to output CSS */
  filename?: string;
  /** Glob patterns to exclude tokens from output */
  exclude?: string[];
  /** Define mode selectors as media queries or CSS classes */
  modeSelectors?: ModeSelector[];
}

export default function cssPlugin({ filename = './index.css', exclude }: CSSPluginOptions = {}): Plugin {
  return {
    name: '@terrazzo/plugin-css',
    async transform({ tokens, format }) {
      const css = format('css');
      for (const id in tokens) {
        const token = tokens[id]!;
        let value: string | Record<string, string>;
        switch (token.$type) {
          case 'border': {
            value = transformBorderValue(token.$value);
            break;
          }
          case 'boolean': {
            value = transformBooleanValue(token.$value);
            break;
          }
          case 'color': {
            value = transformColorValue(token.$value);
            break;
          }
          case 'cubicBezier': {
            value = transformCubicBezierValue(token.$value);
            break;
          }
          case 'dimension': {
            value = transformDimensionValue(token.$value);
            break;
          }
          case 'duration': {
            value = transformDurationValue(token.$value);
            break;
          }
          case 'gradient': {
            value = transformGradientValue(token.$value);
            break;
          }
          case 'number': {
            value = transformNumberValue(token.$value);
            break;
          }
          case 'shadow': {
            value = transformShadowValue(token.$value);
            break;
          }
          case 'string': {
            value = transformStringValue(token.$value);
            break;
          }
          case 'transition': {
            value = transformTransitionValue(token.$value);
            break;
          }
          case 'typography': {
            value = transformTypographyValue(token.$value);
            break;
          }
        }
        if (value) {
          css.setTokenValue(id, {
            value,
            formatID: makeCSSVar(id),
          });
        }
      }
    },
    async build({ tokens, format, outputFile }) {
      const output: string[] = [];

      const css = format('css');
      for (const [id, token] of Object.entries(css.getAllTokens())) {
        if (isTokenMatch(id, exclude ?? [])) {
          continue;
        }

        output.push(`${token.formatID}: ${token.value};`);
      }

      if (output.length) {
        outputFile(filename, output.join('\n'));
      }
    },
  };
}
