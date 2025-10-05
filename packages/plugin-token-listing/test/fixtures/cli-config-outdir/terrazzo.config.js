import { defineConfig } from '@terrazzo/cli';
import listing from '../../../dist/index.js';

export default defineConfig({
  lint: {
    rules: {
      'core/consistent-naming': 'off',
    },
  },
  tokens: ['./styles/tokens.json'],
  outDir: './styles/',
  plugins: [
    listing({
      filename: 'out/actual.listing.json',
    }),
  ],
});
