import type { Plugin } from '@terrazzo/parser';
import {
  makeCssVar,
  transformColorToken,
  tranformGradientValue,
  transformShadowValue,
} from '@terrazzo/token-tools/css';

export default function cssPlugin(): Plugin {
  return {
    name: '@terrazzo/plugin-css',
    async transform({ tokens, format }) {
      const css = format('css');
      for (const id in tokens) {
        const token = tokens[id]!;
        let value: string | Record<string, string>;
        switch (token.$type) {
          case 'color': {
            value = transformColorToken(token.$value);
            break;
          }
          case 'gradient': {
            value = transformGradientValue(token.$value);
            break;
          }
          case 'shadow': {
            value = transformShadowValue(token.$value);
            break;
          }
        }
        if (value) {
          css.setTokenValue(id, {
            value,
            formatID: makeCssVar(id),
          });
        }
      }
    },
  };
}
