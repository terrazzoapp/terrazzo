import pluginCSS from '@cobalt-ui/plugin-css';
import pluginSass from '@cobalt-ui/plugin-sass';
import pluginJS from '@cobalt-ui/plugin-js';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  plugins: [
    pluginCSS({
      modeSelectors: [
        { mode: 'light', selectors: ['[data-color-theme="light"]'] },
        { mode: 'light_colorblind', selectors: ['[data-color-theme="light-colorblind"]'] },
        { mode: 'light_low_contrast', selectors: ['[data-color-theme="light-low-contrast"]'] },
        { mode: 'desktop', tokens: ['font.size.*'], selectors: ['@media (min-width: 600px)'] },
      ],
    }),
    pluginSass(),
    pluginJS(),
  ],
};
