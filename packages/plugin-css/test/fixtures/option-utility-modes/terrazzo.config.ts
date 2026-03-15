import { defineConfig } from '@terrazzo/cli';
import { makeCSSVar } from '@terrazzo/token-tools/css';
import css from '../../../src/index.js';

export default defineConfig({
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'utility.css',
      variableName: (token) => makeCSSVar(token.id, { prefix: 'ds' }),
      utility: {
        bg: ['color.semantic.**', 'color.gradient.**'],
        border: ['border.**'],
        font: ['typography.**'],
        layout: ['space.**'],
        shadow: ['shadow.**'],
        text: ['color.semantic.**', 'color.gradient.**'],
      },
      modeSelectors: [{ mode: 'desktop', selectors: ['@media (width >= 600px)'] }],
    }),
  ],
});
