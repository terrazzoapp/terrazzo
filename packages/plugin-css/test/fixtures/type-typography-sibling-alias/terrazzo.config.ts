import { defineConfig } from '@terrazzo/cli';
import css from '../../../src/index.js';

export default defineConfig({
  tokens: ['typography.resolver.json'],
  outDir: '.',
  plugins: [
    css({
      filename: 'index.css',
      permutations: [{ input: {}, prepare: (contents) => `:root {\n  ${contents}\n}` }],
    }),
  ],
});
