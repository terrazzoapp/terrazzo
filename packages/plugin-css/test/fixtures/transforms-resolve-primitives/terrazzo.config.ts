import css from "../../../src/index.js";
import {defineConfig, type TokenNormalized} from '@terrazzo/parser';
import {pathToFileURL} from 'node:url';
import {defaultAliasTransform, transformCSSValue} from "@terrazzo/token-tools/css";

/**
 * This config excludes primitives from the output and resolves at build time
 * any aliases pointing at primitives
 */
export default defineConfig(
  {
    plugins: [
      css({
        filename: 'actual.css',
        exclude: ['primitives.**'],
        transform(token, options) {
          const transformAlias = (token: TokenNormalized): string => {
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
            input: {mode: 'light'},
            prepare(css: string): string {
              return `.light {\n  ${css}\n}`;
            },
          },
          {
            input: {mode: 'dark'},
            prepare(css: string): string {
              return `.dark {\n  ${css}\n}`;
            },
          },
        ],
      }),
    ],
  },
  {cwd: pathToFileURL(import.meta.url)}
);
