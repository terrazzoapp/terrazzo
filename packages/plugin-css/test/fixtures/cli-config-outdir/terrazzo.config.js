import { defineConfig } from '@terrazzo/cli';
import css from '../../../dist/index.js';

/** @type {import("@terrazzo/cli").Config} */
export default defineConfig({
  tokens: ['./styles/tokens.json'],
  outDir: './styles/',
  lint: {
    rules: {
      'core/consistent-naming': 'off',
    },
  },
  plugins: [
    css({
      filename: 'out/actual.css',
    }),
  ],
});
