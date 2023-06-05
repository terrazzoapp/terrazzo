import pluginCSS from '@cobalt-ui/plugin-css';
import pluginSass from '@cobalt-ui/plugin-sass';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    pluginCSS({
      modeSelectors: {
        'ui#light': ['body[data-color-mode="light"]'],
        'ui#dark': ['body[data-color-mode="dark"]', '@media(prefers-color-scheme:dark)'],
      },
    }),
    pluginSass(),
  ],
};
