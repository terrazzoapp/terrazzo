import { defineConfig } from '../../../../cli/dist/index.js';
import pluginCSS from '../../../dist/index.js';

export default defineConfig({
  plugins: [
    pluginCSS({
      modeSelectors: [
        { mode: 'Light', selectors: ['@media (prefers-color-scheme: light)'] },
        { mode: 'Dark', selectors: ['@media (prefers-color-scheme: dark)'] },
      ],
    }),
  ],
});
