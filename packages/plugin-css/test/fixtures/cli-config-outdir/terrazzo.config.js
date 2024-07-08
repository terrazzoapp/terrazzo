import css from '../../../dist/index.js';

/** @type {import("@terrazzo/cli").Config} */
export default {
  tokens: ['./styles/tokens.json'],
  outDir: './styles/',
  plugins: [
    css({
      filename: 'out/actual.css',
    }),
  ],
};
