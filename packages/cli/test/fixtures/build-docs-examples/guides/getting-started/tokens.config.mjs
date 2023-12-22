import pluginCSS from '../../../../../../plugin-css/dist/index.js';
import pluginJS from '../../../../../../plugin-js/dist/index.js';

/** @type {import('../../../../../../core').Config} */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [pluginCSS(/* options */), pluginJS(/* options */)],
};
