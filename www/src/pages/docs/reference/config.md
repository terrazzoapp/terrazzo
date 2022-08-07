---
title: Config
layout: ../../../layouts/docs.astro
---

# Config

Customizing Cobalt and managing plugins requires you to add a `tokens.config.mjs` file in the root of your project. Here’s an example configuration with all settings and defaults:

```js
import json from '@cobalt-ui/plugin-json';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  figma: {
    // figma settings
  },
  plugins: [json()],
};
```

### Loading tokens from npm

To load tokens from an npm package, update `config.tokens` to point to the **full JSON path** (not merely the root package):

```diff
  /** @type import('@cobalt-ui/core').Config */
  export default {
-   tokens: "@my-scope/my-tokens",             // ❌ Cobalt won’t be able to find the tokens
+   tokens: "@my-scope/my-tokens/tokens.json", // ✅ Cobalt can locate this just fine
```

## Figma

[View Figma docs](/docs/guides/figma)

## Plugins

Each plugin comes with its own rules and setup. Follow the corresponding plugin guide to enable code generation:

👉 **[View plugins](/docs/plugins)**
