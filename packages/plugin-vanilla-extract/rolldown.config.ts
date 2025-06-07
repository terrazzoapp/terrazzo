import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig({
  input: {
    index: './src/index.ts',
  },
  platform: 'node',
  plugins: [dts()],
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
});
