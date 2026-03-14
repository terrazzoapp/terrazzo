import { defineConfig } from '@terrazzo/cli';
import { transformCSSValue } from "@terrazzo/token-tools/css";
import css from "../../../src/index.js";

/**
 * Simple transform to add mode & hex code to color token output
 */
export default defineConfig({
  tokens: ['./resolver.json'],
  outDir: '.',
  plugins: [
    css({
      filename: 'actual.css',
      exclude: ['primitives.**'],
      transform(token, options) {
        return `${transformCSSValue(token, options)} /* ${options.permutation.mode}: ${(token.$value as { hex: string }).hex} */`
      },
      permutations: [
        {
          input: { mode: 'light' },
          prepare: (contents) => `.light {\n  ${contents}\n}`,
        },
        {
          input: { mode: 'dark' },
          prepare: (contents) => `.dark {\n  ${contents}\n}`,
        },
      ],
    }),
  ],
});
