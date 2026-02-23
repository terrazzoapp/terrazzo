import ts from '@rollup/plugin-typescript';
import css from 'rollup-plugin-import-css';

/** @type {import("rollup").InputOptions} */
export default {
  plugins: [
    css({
      output: 'all-components.css',
    }),
    ts({
      tsconfig: './tsconfig.build.json',
    }),
  ],
  input: 'src/index.ts',
  external: [
    '@radix-ui/react-select',
    '@radix-ui/react-tooltip',
    '@terrazzo/icons',
    '@use-gesture/react',
    'clsx',
    'react',
    'react/jsx-runtime',
    'shiki',
  ],
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
