---
title: TypeScript Plugin for Cobalt
layout: ../../../layouts/docs.astro
---

# @cobalt-ui/plugin-ts

Generate TypeScript output from design tokens.

```
npm i -D @cobalt-ui/plugin-ts
```

```js
// tokens.config.mjs
import ts from '@cobalt-ui/plugin-ts';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    ts({
      /** set the filename inside outDir */
      filename: './index.ts',
      /** modify values */
      transformValue(value, token) {
        return value;
      },
    }),
  ],
};
```

## Tools

When you import your generated TypeScript, you’ll find more than just your tokens—you’ll find some handy utilities in there as well.

### Color

TODO
