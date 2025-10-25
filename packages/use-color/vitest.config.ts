import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({ devTarget: 'esnext' })],
  test: {
    environment: 'jsdom',
    restoreMocks: true,
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 15000,
  },
});
