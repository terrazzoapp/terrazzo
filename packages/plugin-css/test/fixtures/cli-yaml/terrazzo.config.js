import { defineConfig } from '../../../../cli/dist/index.js';
import pluginCSS from '../../../dist/index.js';

export default defineConfig({
  // expect Terrazzo to automatically pick up on "tokens.yaml" filename
  plugins: [
    pluginCSS({
      modeSelectors: [
        { mode: 'Light', selectors: ['@media (prefers-color-scheme: light)'] },
        { mode: 'Dark', selectors: ['@media (prefers-color-scheme: dark)'] },
      ],
    }),
  ],
});
