import { defineConfig } from '@terrazzo/cli';
import css from '../../../dist/index.js';

/** @type {import("@terrazzo/cli").Config} */
export default defineConfig({
  lint: {
    rules: {
      'core/consistent-naming': 'off',
    },
  },
  tokens: ['./tokens.json'],
  plugins: [
    css({
      skipBuild: true,
    }),
  ],
});
