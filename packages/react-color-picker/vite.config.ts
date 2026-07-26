import fs from 'node:fs';

import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { defineConfig } from 'vitest/config';

const PKG_JSON = JSON.parse(fs.readFileSync('package.json', 'utf8'));

export default defineConfig({
  plugins: [react(), dts(), vanillaExtractPlugin()],
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
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    restoreMocks: true,
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 15000,
  },
});
