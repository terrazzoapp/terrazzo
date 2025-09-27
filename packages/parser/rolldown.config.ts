import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig({
  input: {
    index: './src/index.ts',
  },
  platform: 'browser',
  plugins: [dts()],
  external: [
    '@humanwhocodes/momoa',
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
