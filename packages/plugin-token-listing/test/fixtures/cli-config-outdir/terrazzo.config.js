import { defineConfig } from '@terrazzo/cli';
import listing from '../../../dist/index.js';

export default defineConfig({
  tokens: ['./styles/tokens.json'],
  outDir: './styles/',
  plugins: [
    listing({
      filename: 'out/actual.listing.json',
    }),
  ],
});
