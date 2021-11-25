# @cobalt-ui/plugin-css

Generate CSS output from design tokens.

```
npm i -D @cobalt-ui/plugin-css
```

```js
// cobalt.config.mjs
import css from '@cobalt-ui/plugin-css';

export default {
  plugins: [
    css({
      /** set the filename inside outDir */
      fileName: './tokens.css',
      /** create selector wrappers around modes */
      modeSelectors: {
        color: {
          light: ['.theme--light'],
          light_colorblind: ['.theme--light-colorblind'],
          light_high_contrast: ['.theme--light-high-contrast'],
          dark: ['.theme--dark'],
          dark_colorblind: ['.theme--dark-colorblind'],
          dark_high_contrast: ['.theme--dark-high-contrast'],
        },
        text_size: {
          desktop: ['@media (min-width: 600px)'],
        },
      },
      /** modify values */
      transformValue(value, token) {
        return value.default;
      },
      /** don’t like the name of CSS variables? change ’em! */
      transformVariableNames(name, group) {
        return `--${name.replace(/[._]/g, '-')}`;
      },
    }),
  ],
};
```
