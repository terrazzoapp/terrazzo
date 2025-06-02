import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig({
  input: {
    index: './src/index.ts',
  },
  plugins: [dts()],
  external: [
    '@clack/prompts',
    '@hono/node-server',
    '@humanwhocodes/momoa',
    '@terrazzo/parser',
    '@terrazzo/token-lab',
    '@terrazzo/token-tools',
    '@types/escodegen',
    'chokidar',
    'detect-package-manager',
    'dotenv',
    'escodegen',
    'merge-anything',
    'meriyah',
    'mime',
    'picocolors',
    'yaml-to-momoa',
  ],
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
});
