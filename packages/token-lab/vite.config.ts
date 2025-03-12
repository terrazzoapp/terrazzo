import react from '@vitejs/plugin-react-swc';
import sassDts from 'vite-plugin-sass-dts';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), sassDts({ esmExport: true })],
});
