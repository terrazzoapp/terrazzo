import css from "../../../src/index.js";
import {defineConfig} from '@terrazzo/parser';
import {pathToFileURL} from 'node:url';
import {transformCSSValue} from "@terrazzo/token-tools/css";

/**
 * Simple transform to add mode & hex code to color token output
 */
export default defineConfig(
  {
    plugins: [
      css({
        filename: 'actual.css',
        exclude: ['primitives.**'],
        transform(token, options) {
          return `${transformCSSValue(token, options)} /* ${options.permutation.mode}: ${(token.$value as {hex: string}).hex} */`
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
