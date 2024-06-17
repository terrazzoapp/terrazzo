import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    restoreMocks: true,
  },
});
