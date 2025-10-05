import { defineConfig } from '@terrazzo/cli';
import css from '../../../dist/index.js';

export default defineConfig({
  rule: {
    'core/consistent-naming': 'off',
  },
  tokens: ['./tokens.json'],
  plugins: [
    css({
      skipBuild: true,
    }),
  ],
});
