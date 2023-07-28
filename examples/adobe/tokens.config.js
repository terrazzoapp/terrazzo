import pluginCSS from '@cobalt-ui/plugin-css';
import pluginSass from '@cobalt-ui/plugin-sass';
import pluginJS from '@cobalt-ui/plugin-js';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    pluginCSS({
      prefix: 'spectrum',
      modeSelectors: {
        '#dark': ['body[data-color-mode="dark"]', '@media (prefers-color-scheme: dark)'],
        '#darkest': ['body[data-color-mode="darkest"]'],
        '#light': ['body[data-color-mode="light"]', '@media (prefers-color-scheme: light)'],
        '#lightest': ['body[data-color-mode="lightest"]'],
        '#middark': ['body[data-color-mode="middark"]'],
        '#midlight': ['body[data-color-mode="midlight"]'],
      },
    }),
    pluginJS(),
    pluginSass(),
  ],
};
