import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

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
});
