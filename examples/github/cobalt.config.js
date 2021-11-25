import css from '@cobalt-ui/plugin-css';

export default {
  plugins: [
    css({
      modeSelectors: {
        color: {
          light: ['.theme--light'],
          light_colorblind: ['.theme--light-colorblind'],
          light_low_contrast: ['.theme--light-low-contrast'],
        },
        'text.size': {
          desktop: ['@media (min-width: 600px)'],
        },
      },
    }),
  ],
};
