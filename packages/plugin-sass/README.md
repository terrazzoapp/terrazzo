# @cobalt-ui/plugin-sass

Generate Sass output for [Cobalt](https://cobalt-ui.pages.dev) from design tokens.

## Setup

```
npm i -D @cobalt-ui/plugin-sass
```

```js
// cobalt.config.mjs
import sass from '@cobalt-ui/plugin-sass';

export default {
  plugins: [
    sass({
      /** set the filename inside outDir */
      fileName: './index.scss',
      /** use indented syntax? (.sass format) */
      indentedSyntax: false,
      /** modify values */
      transformValue(value, token) {
        return value;
      },
      /** rename variables */
      transformVariables(namespaces) {
        return namespaces.join('__');
      },
    }),
  ],
};
```

## Usage

After Cobalt has built your Sass tokens, import it into any file with:

```scss
@use '../tokens' as *; // update '../tokens' to match your location of tokens/index.scss

.heading {
  color: $color__blue;
  font-size: $type__size__lg;
}
```

If some token variables conflict with local variables, you can always [namespace them (Sass docs)](https://sass-lang.com/documentation/at-rules/use#choosing-a-namespace).

### Modes

To use modes, use `mode()` function that was generated with your tokens:

```scss
@use '../tokens' as *;

// "default" mode
.heading {
  color: $color__blue;
  font-size: $type__size__lg;

  // "light" mode
  body.theme--light & {
    color: mode($color__blue, light);
    font-size: mode($type__size__lg, light);
  }

  // "dark" mode
  body.theme--dark & {
    color: mode($color__blue, dark);
    font-size: mode($type__size__lg, dark);
  }
}
```

⚠️ Be warned that Sass will throw an error if that mode doesn’t exist for that token. This is done intentionally so that values aren’t silently falling back to their defaults.

To learn more about modes, [see the documentation](https://cobalt-ui.pages.dev/docs/modes).
