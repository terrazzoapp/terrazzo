import { defineConfig } from '@terrazzo/cli';
import css from '../../../src/index.js';

export default defineConfig({
  tokens: ['tokens.json'],
  outDir: '.',
  plugins: [
    css({
      filename: 'index.css',
      // variableName() that doesn’t add the `--` prefix itself
      variableName: (token) => token.id.replace(/\./g, '-'),
    }),
  ],
});
