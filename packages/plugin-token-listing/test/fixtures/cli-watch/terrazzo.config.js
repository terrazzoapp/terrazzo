import { defineConfig } from '@terrazzo/cli';
import listing from '../../../dist/index.js';

export default defineConfig({
  lint: {
    rules: {
      'core/consistent-naming': 'off',
    },
  },
  plugins: [
    listing({}),
  ],
});
