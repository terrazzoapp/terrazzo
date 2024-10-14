import ts from '@rollup/plugin-typescript';
import { cleandir } from 'rollup-plugin-cleandir';

/** @type {import("rollup").InputOptions} */
export default {
  plugins: [cleandir(), ts()],
  input: 'src/index.tsx',
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
