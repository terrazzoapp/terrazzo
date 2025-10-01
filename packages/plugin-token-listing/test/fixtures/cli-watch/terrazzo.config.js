import { defineConfig } from '@terrazzo/cli';
import listing from '../../../dist/index.js';

export default defineConfig({
  plugins: [
    listing({}),
  ],
});
