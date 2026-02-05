import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import vanillaExtract from '../../../dist/index.js';

export default defineConfig({
  outDir: '.',
  tokens: ['github-primer.tokens.json'],
  lint: {
    rules: {
      'core/consistent-naming': 'off',
      'core/valid-typography': ['error', { requiredProperties: ['fontFamily', 'fontSize'] }]
    }
  },
  plugins: [
    css(),
    vanillaExtract({
      globalThemeContract: false,
      themes: {
        light: { selector: '[data-color-mode=light]', mode:['.', 'light'] },
        lightHC: { selector: '[data-color-mode=light-hc]', mode: ['.', 'light-high-contrast'] },
        dark: { selector: '[data-color-mode=dark]', mode: ['.', 'dark'] },
        darkHC: { selector: '[data-color-mode=dark-hc]', mode: ['.', 'dark-high-contrast'] },
      },
    }),
  ],
});
