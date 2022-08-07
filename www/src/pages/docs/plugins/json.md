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
// tokens.config.mjs
import json from '@cobalt-ui/plugin-json';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    json({
      /** set the filename inside outDir */
      filename: './tokens.json',
    }),
  ],
};
```

It’s worth noting that this JSON output differs from your source `tokens.json` in a number of ways:

- It’s one flat array, making iterating over all your tokens easy without deep-crawling objects
- All values are normalized, so you won’t get unexpected missing values
- All shared properties are filled in, e.g. if a group has a default `type` it will be applied to all children tokens
- All aliases are resolved, so you don’t have to recursively crawl `tokens.json` yourself
- The original token value can be found in `_original`
- Information about a token’s parent group can be found in `_group`

So if you have need for any of the above, this format can be much friendlier to iterate over than the original schema.
