import { defineConfig } from '@terrazzo/cli';
import css from '../../../dist/index.js';

/** @type {import("@terrazzo/cli").Config} */
export default defineConfig({
  tokens: ['tokens.yaml'],
  outDir: '.',
  lint: {
    rules: {
      'core/consistent-naming': 'off',
    },
  },
  // expect Terrazzo to automatically pick up on "tokens.yaml" filename
  plugins: [
    css({
      filename: 'index.css',
      modeSelectors: [
        { mode: 'Light', selectors: ['@media (prefers-color-scheme: light)'] },
        { mode: 'Dark', selectors: ['@media (prefers-color-scheme: dark)'] },
      ],
    }),
  ],
});
