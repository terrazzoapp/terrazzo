import { defineConfig } from '@terrazzo/cli';
import listing from '../../../dist/index.js';

export default defineConfig({
  tokens: ['./tokens.json'],
  plugins: [
    listing({
      skipBuild: true,
    }),
  ],
});
