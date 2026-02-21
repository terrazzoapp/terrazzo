import css from "../../../src/index.js";
import {defineConfig} from '@terrazzo/parser';
import {pathToFileURL} from 'node:url';
import {transformCSSValue} from "@terrazzo/token-tools/css";

/**
 * Simple transform to test per-permutation transforms
 */
export default defineConfig(
  {
    plugins: [
      css({
        filename: 'actual.css',
        exclude: ['primitives.**'],
        permutations: [
          {
            input: {mode: 'light'},
            prepare(css: string): string {
              return `.light {\n  ${css}\n}`;
            },
            transform(token, options) {
              return `${transformCSSValue(token, options)} /* light mode rocks */`
            }
          },
          {
            input: {mode: 'dark'},
            prepare(css: string): string {
              return `.dark {\n  ${css}\n}`;
            },
             transform(token, options) {
              return `${transformCSSValue(token, options)} /* no dark is better */`
            }
          },
        ],
      }),
    ],
  },
  {cwd: pathToFileURL(import.meta.url)}
);
