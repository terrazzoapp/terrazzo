# @cobalt-ui/plugin-ts

Generate TypeScript output from design tokens.

```
npm i -D @cobalt-ui/plugin-ts
```

```js
// cobalt.config.mjs
import ts from '@cobalt-ui/plugin-ts';

export default {
  plugins: [
    ts({
      /** set the filename inside outDir */
      fileName: './index.ts',
      /** modify values */
      transformValue(value, token) {
        return value;
      },
    }),
  ],
};
```
