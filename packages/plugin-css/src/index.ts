import type { Plugin } from '@terrazzo/parser';
import { makeCssVar, transformColorToken } from '@terrazzo/token-tools/css';

export default function cssPlugin(): Plugin {
  return {
    name: '@terrazzo/plugin-css',
    async transform({ tokens, format }) {
      const css = format('css');
      for (const id in tokens) {
        const token = tokens[id];
        let value: string;
        switch (token.$type) {
          case 'color': {
            value = transformColorToken(token.$value);
            break;
          }
        }

        if (value) {
          css.setTokenValue(id, {
            value,
            alias: makeCssVar(id),
          });
        }
      }
    },
  };
}
