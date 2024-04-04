import pluginJS from '../../../../../packages/plugin-js/dist/index.js';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: [
    'https://www.figma.com/file/OkPWSU0cusQTumCNno7dm8/Variable-Export?type=design&node-id=0%3A1&mode=design&t=zxhnYAf1FASSHySQ-1',
  ],
  outDir: '.',
  plugins: [
    pluginJS({
      json: './given.json',
    }),
  ],
};
