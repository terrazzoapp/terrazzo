import pluginCSS from '@cobalt-ui/plugin-css';
import pluginSass from '@cobalt-ui/plugin-sass';
import pluginJS from '@cobalt-ui/plugin-js';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  plugins: [
    pluginCSS({
      prefix: 'spectrum',
      modeSelectors: [
        {mode: 'dark', selectors: ['body[data-color-mode="dark"]', '@media (prefers-color-scheme: dark)']},
        {mode: 'darkest', selectors: ['body[data-color-mode="darkest"]']},
        {mode: 'light', selectors: ['body[data-color-mode="light"]', '@media (prefers-color-scheme: light)']},
        {mode: 'lightest', selectors: ['body[data-color-mode="lightest"]']},
        {mode: 'middark', selectors: ['body[data-color-mode="middark"]']},
        {mode: 'midlight', selectors: ['body[data-color-mode="midlight"]']},
      ],
    }),
    pluginJS(),
    pluginSass(),
  ],
};
