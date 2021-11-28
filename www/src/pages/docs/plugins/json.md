---
title: JSON Plugin for Cobalt
layout: ../../../layouts/docs.astro
---

# @cobalt-ui/plugin-json

Generate JSON output from design tokens.

```
npm i -D @cobalt-ui/plugin-json
```

```js
// cobalt.config.mjs
import json from '@cobalt-ui/plugin-json';

export default {
  plugins: [
    json({
      /** set the filename inside outDir */
      fileName: './tokens.json',
      /** modify values */
      transformValue(value, token) {
        return value;
      },
    }),
  ],
};
```
