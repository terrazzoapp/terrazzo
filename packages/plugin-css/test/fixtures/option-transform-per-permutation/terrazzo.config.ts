import { defineConfig } from '@terrazzo/cli';
import { transformCSSValue } from "@terrazzo/token-tools/css";
import css from "../../../src/index.js";

/**
 * Simple transform to test per-permutation transforms
 */
export default defineConfig({
  tokens: ['./resolver.json'],
  outDir: '.',
  plugins: [
    css({
      filename: 'index.css',
      exclude: ['primitives.**'],
      permutations: [
        {
          input: { mode: 'light' },
          prepare: (contents) => `.light {\n  ${contents}\n}`,
          transform(token, options) {
            return `${transformCSSValue(token, options)} /* light mode rocks */`
          }
        },
        {
          input: { mode: 'dark' },
          prepare: (contents) => `.dark {\n  ${contents}\n}`,
          transform(token, options) {
            return `${transformCSSValue(token, options)} /* no dark is better */`
          }
        },
      ],
    }),
  ],
});
