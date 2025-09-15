import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig({
  input: {
    index: './src/index.ts',
  },
  plugins: [dts()],
  external: ['@humanwhocodes/momoa'],
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
});
