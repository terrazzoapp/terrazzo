import pluginCSS from '@cobalt-ui/plugin-css';
import pluginSass from '@cobalt-ui/plugin-sass';
import pluginJS from '@cobalt-ui/plugin-js';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [pluginCSS(), pluginSass(), pluginJS(), pluginTS()],
};
