import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    poolOptions: {
      threads: {
        minThreads: 0,
        maxThreads: 1,
      },
    },
    restoreMocks: true,
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 15000,
  },
});
