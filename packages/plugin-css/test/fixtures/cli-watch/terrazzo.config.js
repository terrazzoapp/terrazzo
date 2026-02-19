import { defineConfig } from '@terrazzo/cli';
import pluginCSS from '../../../dist/index.js';

/** @type {import("@terrazzo/cli").Config} */
export default defineConfig({
  lint: {
    rules: {
      'core/consistent-naming': 'off',
    },
  },
  plugins: [
    pluginCSS({
      modeSelectors: [
        { mode: 'Light', selectors: ['@media (prefers-color-scheme: light)'] },
        { mode: 'Dark', selectors: ['@media (prefers-color-scheme: dark)'] },
      ],
    }),
  ],
});
