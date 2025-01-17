import { defineConfig } from '@terrazzo/cli';
import css from '../../../dist/index.js';

export default defineConfig({
  tokens: ['./tokens.json'],
  plugins: [
    css({
      skipBuild: true,
    }),
  ],
});
