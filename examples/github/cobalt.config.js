import css from '@cobalt-ui/plugin-css';
import sass from '@cobalt-ui/plugin-sass';

export default {
  plugins: [
    css({
      modeSelectors: {
        color: {
          light: ['.theme--light'],
          light_colorblind: ['.theme--light-colorblind'],
          light_low_contrast: ['.theme--light-low-contrast'],
        },
        'type.size': {
          desktop: ['@media (min-width: 600px)'],
        },
      },
    }),
    sass(),
  ],
};
