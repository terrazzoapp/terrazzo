import { defineConfig } from 'rolldown';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig({
  input: {
    index: './src/index.ts',
    css: './src/css/index.ts',
    js: './src/js/index.ts',
  },
  plugins: [dts()],
  external: ['@humanwhocodes/momoa', 'culori', 'culori/css', 'culori/fn', 'wildcard-match'],
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
  },
});
