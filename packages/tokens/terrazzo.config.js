import { defineConfig } from '@terrazzo/cli';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import css from '@terrazzo/plugin-css';

export default defineConfig({
  tokens: './tokens.json',
  outDir: './dist/',
  plugins: [
    css({
      variableName: (token) => makeCSSVar(token.id, { prefix: 'tz' }),
      modeSelectors: [
        {
          mode: 'light',
          selectors: ['@media (prefers-color-scheme: light)', '[data-color-mode="light"][data-color-mode="light"]'],
        },
        {
          mode: 'dark',
          selectors: ['@media (prefers-color-scheme: dark)', '[data-color-mode="dark"][data-color-mode="dark"]'],
        },
      ],
    }),
  ],
  lint: {
    rules: {
      'core/valid-color': ['error', { legacyFormat: true }],
    },
  },
});
