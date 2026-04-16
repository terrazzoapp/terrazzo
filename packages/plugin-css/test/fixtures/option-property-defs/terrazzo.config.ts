import { defineConfig } from '@terrazzo/cli';
import css from '../../../dist/index.js';

export default defineConfig({
  lint: { rules: { 'core/consistent-naming': 'off' } },
  tokens: ['./tokens.json'],
  outDir: '.',
  plugins: [
    css({
      propertyDefinitions: true,
      filename: 'index.css',
    }),
  ],
});
