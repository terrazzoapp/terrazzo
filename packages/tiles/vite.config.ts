import fs from 'node:fs';

import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

const PKG_JSON = JSON.parse(fs.readFileSync('package.json', 'utf8'));

/** @see https://vitejs.dev/config/ */
export default defineConfig({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: '@terrazzo/tiles',
      fileName: 'index',
    },
    rolldownOptions: {
      external: [
        'react/jsx-runtime',
        ...Object.keys(PKG_JSON.dependencies),
        ...Object.keys(PKG_JSON.devDependencies),
      ],
    },
  },
  test: {
    environment: 'jsdom',
    restoreMocks: true,
  },
});
