import { defineConfig } from "@terrazzo/cli";
import css from '@terrazzo/plugin-css';
import { makeCSSVar } from "@terrazzo/token-tools/css";
import sass from '../../../src/index.js';

export default defineConfig({
  outDir: '.',
  tokens: ['tokens.json'],
  plugins: [
    css({
      filename: 'actual.css',
      variableName: (token) => makeCSSVar(token.id, { prefix: 'ds' })
    }),
    sass({
      filename: 'actual.scss',
    }),
  ],
});
