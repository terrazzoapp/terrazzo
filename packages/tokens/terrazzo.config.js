import { defineConfig } from '@terrazzo/cli';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import css from '@terrazzo/plugin-css';

const DOT_RE = /\./g;

export default defineConfig({
  tokens: './tokens.json',
  outDir: './dist/',
  plugins: [
    css({
      variableName: (name) => makeCSSVar(name, { prefix: 'tz' }),
      modeSelectors: [
        { mode: 'light', selectors: ['@media (prefers-color-scheme: light)', '[data-color-mode="light"]'] },
        { mode: 'dark', selectors: ['@media (prefers-color-scheme: dark)', '[data-color-mode="dark"]'] },
      ],
    }),
  ],
});
