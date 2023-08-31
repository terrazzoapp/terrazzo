import pluginSass from '@cobalt-ui/plugin-sass';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    pluginSass({
      pluginCSS: {
        modeSelectors: [
          {mode: 'light', tokens: ['color.ui.*'], selectors: ['body[data-color-mode="light"]']},
          {mode: 'dark', tokens: ['color.ui.*'], selectors: ['body[data-color-mode="dark"]', '@media(prefers-color-scheme:dark)']},
        ],
      },
    }),
  ],
};
