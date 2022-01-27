import css from '@cobalt-ui/plugin-css';
import sass from '@cobalt-ui/plugin-sass';

export default {
  plugins: [
    css({
      modeSelectors: {
        'color#light': ['[data-color-theme="light"]'],
        'color#light_colorblind': ['[data-color-theme="light-colorblind"]'],
        'color#light_low_contrast': ['[data-color-theme="light-low-contrast"]'],
        'font.size#desktop': ['@media (min-width: 600px)'],
      },
    }),
    sass(),
  ],
};
