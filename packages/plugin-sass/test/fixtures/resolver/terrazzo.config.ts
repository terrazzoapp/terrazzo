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
        { input: { theme: 'light' }, prepare: (contents) => `:root{\n  ${contents}\n}\n` },
        { input: { theme: 'dark' }, prepare: (contents) => `@media (prefers-color-scheme: dark) {\n  :root {\n    ${contents}\n  }\n}\n` },
      ]
    }),
    sass({
      filename: 'actual.scss',
    }),
  ],
});
