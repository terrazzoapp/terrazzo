import ts from '@rollup/plugin-typescript';

/** @type {import("rolldown").InputOptions} */
export default {
  plugins: [ts()],
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
