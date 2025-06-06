import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import vanillaExtract from '../../../dist/index.js';

export default defineConfig({
  outDir: './test/fixtures/figma-sds',
  tokens: ['dtcg-examples/figma-sds.json'],
  plugins: [
    css(),
    vanillaExtract({
      themes: {
        light: { selector: '[data-color-mode=light]', mode: ['.', 'light'] },
        dark: { selector: '[data-color-mode=dark]', mode: ['.', 'dark'] },
      },
    }),
  ],
});
