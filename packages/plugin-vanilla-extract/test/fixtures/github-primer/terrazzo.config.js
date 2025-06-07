import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import vanillaExtract from '../../../dist/index.js';

export default defineConfig({
  outDir: './test/fixtures/github-primer',
  tokens: ['dtcg-examples/github-primer.json'],
  plugins: [
    css(),
    vanillaExtract({
      globalThemeContract: false,
      themes: {
        light: { selector: '[data-color-mode=light]', mode: ['.', 'light'] },
        lightColorblind: { selector: '[data-color-mode=light-colorblind]', mode: ['.', 'light-colorblind'] },
        lightHC: { selector: '[data-color-mode=light-hc]', mode: ['.', 'light-high-contrast' ]},
        dark: { selector: '[data-color-mode=dark]', mode: ['.', 'dark'] },
        darkColorblind: { selector: '[data-color-mode=dark-colorblind]', mode: ['.', 'dark-colorblind'] },
        darkHC: { selector: '[data-color-mode=dark-hc]', mode: ['.', 'dark-high-contrast'] },
        darkDimmed: { selector: '[data-color-mode=dark-dimmed]', mode: ['.', 'dark-dimmed'] },
      },
    }),
  ],
});
