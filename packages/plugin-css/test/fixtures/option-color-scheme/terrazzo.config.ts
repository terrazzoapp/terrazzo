import { defineConfig } from '@terrazzo/cli';
import css from '../../../src/index.js';

export default defineConfig({
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'index.css',
      baseScheme: 'light dark',
      modeSelectors: [
        {
          selectors: ['[data-color-theme="light"]'],
          mode: 'light',
          scheme: 'light',
        },
        {
          selectors: ['[data-color-theme="dark"]'],
          mode: 'dark',
          scheme: 'dark',
        },
      ],
    }),
  ],
})
