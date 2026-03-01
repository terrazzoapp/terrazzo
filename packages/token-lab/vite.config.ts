import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsConfigPaths(), react(), tailwindcss()],
  build: {
    lib: {
      entry: 'src/index.tsx',
      formats: ['es'],
      name: '@terrazzo/token-lab',
    },
    rolldownOptions: {
      external: ['@base-ui/react', '@base-ui/react/button', '@terrazzo/icons', 'react', 'react/jsx-runtime'],
    },
  },
});
