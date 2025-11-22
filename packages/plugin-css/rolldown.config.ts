import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

import pkg from './package.json';

export default defineConfig({
  input: {
    index: './src/index.ts',
  },
  platform: 'browser',
  plugins: [dts({resolve: true})],
  external: Object.keys(pkg.dependencies).flatMap(k => [k, new RegExp(`^${k}\/.*`)]),
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
});
