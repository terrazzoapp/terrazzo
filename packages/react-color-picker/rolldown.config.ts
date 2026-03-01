import { vanillaExtractPlugin } from '@vanilla-extract/rollup-plugin';
import { dts } from 'rolldown-plugin-dts';
import { defineConfig } from '../../rolldown.js';

export default defineConfig({
  input: 'src/index.ts',
  plugins: [
    dts(),
    vanillaExtractPlugin({
      extract: {
        name: 'styles.css',
      },
    }),
  ],
  output: {
    assetFileNames: '[name].[ext]',
    dir: './dist/',
    sourcemap: true,
    globals: {
      'react/jsx-runtime': 'jsxRuntime',
      'react-dom/client': 'ReactDOM',
      react: 'React',
    },
  },
});
