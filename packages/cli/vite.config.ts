import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/lab',
    rollupOptions: {
      external: ['@terrazzo/tiles', '@terrazzo/token-lab'],
    },
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2024',
  },
  test: {
    testTimeout: 15_000,
  },
});
