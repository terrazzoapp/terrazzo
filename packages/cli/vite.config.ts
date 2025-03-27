import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/lab',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2024',
  },
});
