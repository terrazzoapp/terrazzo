import { defineConfig } from '@terrazzo/cli';
import { type TokenNormalized } from '@terrazzo/parser';
import { defaultAliasTransform, transformCSSValue } from "@terrazzo/token-tools/css";
import css from "../../../src/index.js";

/**
 * This config excludes primitives from the output and resolves at build time
 * any aliases pointing at primitives
 */
export default defineConfig({
  tokens: ['./resolver.json'],
  outDir: '.',
  plugins: [
    css({
      filename: 'actual.css',
      exclude: ['primitives.**'],
      transform(token, options) {
        const transformAlias = (token: TokenNormalized) => {
          const defaultAlias = (options.transformAlias ?? defaultAliasTransform)(token);
          if (token.id.startsWith('primitives.')) {
            const resolved = options.tokensSet[token.id];
            if (!resolved) {
              return defaultAlias;
            }
            const transformed = transformCSSValue(resolved, {
              ...options,
              transformAlias,
            });
            return typeof transformed === 'string' ? transformed : defaultAlias;
          }
          return defaultAlias;
        };
        return transformCSSValue(token, {...options, transformAlias});
      },
      permutations: [
        {
          input: { mode: 'light' },
          prepare: (css) => `.light {\n  ${css}\n}`,
        },
        {
          input: {mode: 'dark'},
          prepare: (css) => `.dark {\n  ${css}\n}`,
        },
      ],
    }),
  ],
});
