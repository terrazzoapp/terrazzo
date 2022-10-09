# @cobalt-ui/plugin-ts

Generate TypeScript output from design tokens.

```
npm i -D @cobalt-ui/plugin-ts
```

```js
// tokens.config.mjs
import ts from '@cobalt-ui/plugin-ts';
import better from 'better-color-tools';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    ts({
      /** set the filename inside outDir */
      filename: './index.ts',
      /** modify values */
      transform(token, mode) {
        // convert colors to P3
        switch (token.$type) {
          case 'color': {
            return better.from(token.$value).p3;
          }
        }
      },
    }),
  ],
};
```
