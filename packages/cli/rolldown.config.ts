import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig({
  input: {
    index: './src/index.ts',
  },
  platform: 'node',
  plugins: [dts()],
  external: [
    '@clack/prompts',
    '@hono/node-server',
    '@humanwhocodes/momoa',
    '@terrazzo/json-schema-tools',
    '@terrazzo/parser',
    '@terrazzo/token-lab',
    '@terrazzo/token-tools',
    '@types/escodegen',
    'chokidar',
    'detect-package-manager',
    'dotenv',
    'escodegen',
    'fsevents',
    'merge-anything',
    'meriyah',
    'mime',
    'picocolors',
    'yaml-to-momoa',
    'vite',
    'vite-node',
  ],
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
});
