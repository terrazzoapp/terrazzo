import { defineConfig } from "@terrazzo/cli";
import { makeCSSVar } from "@terrazzo/token-tools/css";
import css from '../../../src/index.js';

export default defineConfig({
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'index.css',
      variableName: (token) => makeCSSVar(token.id, { prefix: 'ds' }),
      modeSelectors: [
        { mode: 'light', selectors: ['@media (prefers-color-scheme: light)', '[data-color-theme="light"]'] },
        { mode: 'dark', selectors: ['@media (prefers-color-scheme: dark)', '[data-color-theme="dark"]'] },
        { mode: 'light-colorblind', selectors: ['[data-color-theme="light-colorblind"]'] },
        { mode: 'light-high-contrast', selectors: ['[data-color-theme="light-high-contrast"]'] },
        { mode: 'dark-dimmed', selectors: ['[data-color-theme="dark-dimmed"]'] },
        { mode: 'dark-high-contrast', selectors: ['[data-color-theme="dark-high-contrast"]'] },
        { mode: 'dark-colorblind', selectors: ['[data-color-theme="dark-colorblind"]'] },
        { mode: 'desktop', selectors: ['@media (width >= 600px)'] },
      ],
    })
  ]
})
