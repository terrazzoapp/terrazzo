import { defineConfig } from '../../rolldown';

export default defineConfig({
  input: {
    index: './src/index.ts',
    css: './src/css/index.ts',
    js: './src/js/index.ts',
  },
});
