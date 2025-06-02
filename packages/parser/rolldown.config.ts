import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig({
  input: {
    index: './src/index.ts',
  },
  plugins: [dts()],
  external: [
    '@humanwhocodes/mamoa',
    '@terrazzo/token-tools',
    'culori',
    'merge-anything',
    'picocolors',
    'wildcard-match',
    'yaml-to-momoa',
    'yaml',
  ],
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
});
