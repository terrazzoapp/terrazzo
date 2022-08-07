import pluginCSS from '@cobalt-ui/plugin-css';
import pluginSass from '@cobalt-ui/plugin-sass';
import pluginJSON from '@cobalt-ui/plugin-json';
import pluginTS from '@cobalt-ui/plugin-ts';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [pluginCSS(), pluginSass(), pluginJSON(), pluginTS()],
};
