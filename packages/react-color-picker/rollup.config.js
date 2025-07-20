import ts from '@rollup/plugin-typescript';
import css from 'rollup-plugin-import-css';

/** @type {import("rollup").InputOptions} */
export default {
  plugins: [
    css({
      output: 'styles.css',
    }),
    ts({
      tsconfig: './tsconfig.build.json',
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
