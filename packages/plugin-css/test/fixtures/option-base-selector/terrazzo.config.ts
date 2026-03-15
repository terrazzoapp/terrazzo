import { defineConfig } from '@terrazzo/cli';
import css from '../../../src/index.js';

export default defineConfig({
  outDir: '.',
  lint: { rules: { 'core/consistent-naming': 'off' } },
  plugins: [
    css({
      filename: 'index.css',
      baseSelector: ':host',
    }),
  ],
})
