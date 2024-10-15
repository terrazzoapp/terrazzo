import ts from '@rollup/plugin-typescript';
import css from 'rollup-plugin-import-css';
import { cleandir } from 'rollup-plugin-cleandir';
import { fileURLToPath } from 'node:url';

/** @type {import("rollup").InputOptions} */
export default {
  plugins: [
    cleandir(),
    css({
      output: 'all-components.css',
    }),
    ts({
      tsconfig: fileURLToPath(new URL('./tsconfig.build.json', import.meta.url)),
    }),
  ],
  input: 'src/index.ts',
  external: ['*'],
  output: {
    dir: './dist/',
    sourcemap: true,
    globals: {
      'react/jsx-runtime': 'jsxRuntime',
      'react-dom/client': 'ReactDOM',
      react: 'React',
    },
  },
};
