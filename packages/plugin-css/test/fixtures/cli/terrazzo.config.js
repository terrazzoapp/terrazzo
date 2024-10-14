import pluginCSS from '../../../../plugin-css/dist/index.js';
import { defineConfig } from '../../../../cli/dist/index.js';

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
