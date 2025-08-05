import { defineConfig } from '@terrazzo/cli';
import css from '../../../dist/index.js';

export default defineConfig({
  tokens: ['./styles/tokens.json'],
  outDir: './styles/',
  plugins: [
    css({
      filename: 'out/actual.css',
    }),
  ],
});
