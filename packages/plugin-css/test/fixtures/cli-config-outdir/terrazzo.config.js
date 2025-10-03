import { defineConfig } from '@terrazzo/cli';
import css from '../../../dist/index.js';

export default defineConfig({
  tokens: ['./styles/tokens.json'],
  outDir: './styles/',
  rule: {
    'core/consistent-naming': 'off',
  },
  plugins: [
    css({
      filename: 'out/actual.css',
    }),
  ],
});
