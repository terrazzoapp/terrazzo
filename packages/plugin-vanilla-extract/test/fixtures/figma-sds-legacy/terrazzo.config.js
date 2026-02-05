import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import vanillaExtract from '../../../dist/index.js';

export default defineConfig({
  outDir: '.',
  tokens: ['figma-sds.tokens.json'],
  lint: {
    rules: {
      'core/consistent-naming': 'off',
    },
  },
  plugins: [
    css(),
    vanillaExtract({
      themes: {
        light: { selector: '[data-color-mode=light]', mode: ['.', 'light'] },
        dark: { selector: '[data-color-mode=dark]', mode:['.', 'dark'] },
      },
    }),
  ],
});
