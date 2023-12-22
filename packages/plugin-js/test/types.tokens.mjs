import pluginJS from '../dist/index.js';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: './types.tokens.json',
  outDir: './types/',
  plugins: [pluginJS()],
};
