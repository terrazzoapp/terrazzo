# @cobalt-ui/plugin-sass

Generate Sass output from design tokens.

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
