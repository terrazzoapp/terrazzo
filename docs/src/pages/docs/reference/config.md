---
title: Config
layout: ../../../layouts/docs.astro
---

# Config

Customizing Cobalt and managing plugins requires you to add a `tokens.config.mjs` file in the root of your project. Here’s an example configuration with all settings and defaults:

```js
import pluginJS from '@cobalt-ui/plugin-js';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [pluginJS()],

  /** token type options */
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

## Token Type Options

Some token types allow for extra configuration in transformation. Here are all the available settings, along with defaults.

### Color

```ts
export default {
  color: {
    convertToHex: true, // Convert all colors to sRGB hexadecimal (default: true). Disable if you’d like to use another format (such as oklab())
  },
};
```

## Syncing with Figma

You can sync tokens with Figma by using the [Tokens Studio for Figma](/docs/guides/tokens-studio) plugin.

## Plugins

Each plugin comes with its own rules and setup. Follow the corresponding plugin guide to enable code generation:

👉 **[View plugins](/docs/plugins)**
