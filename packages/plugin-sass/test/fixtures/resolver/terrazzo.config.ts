import { defineConfig } from "@terrazzo/cli";
import css from '@terrazzo/plugin-css';
import sass from '../../../src/index.js';

export default defineConfig({
  outDir: '.',
  tokens: ['resolver.json'],
  plugins: [
    css({
      filename: 'actual.css',
      permutations: [
        { input: { theme: 'light' }, prepare: css => `:root{\n  ${css}\n}\n` },
        { input: { theme: 'dark' }, prepare: css => `@media (prefers-color-scheme: dark) {\n  :root {\n    ${css}\n  }\n}\n` },
      ]
    }),
    sass({
      filename: 'actual.scss',
    }),
  ],
});
