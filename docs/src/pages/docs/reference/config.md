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

### Loading from YAML

Cobalt supports `tokens.json` as YAML as well:

```js
export default {
  tokens: './tokens.yaml',
};
```

> ⚠️ Note the file must end in `.yml` or `.yaml` to take effect

### Loading from URL

Cobalt can load tokens from any **publicly-available** URL:

```js
export default {
  tokens: 'https://my-bucket.s3.amazonaws.com/tokens.json',
};
```

### Loading from npm

To load tokens from an npm package, update `config.tokens` to point to the **full JSON path** (not merely the root package):

```diff
  /** @type import('@cobalt-ui/core').Config */
  export default {
-   tokens: "@my-scope/my-tokens",             // ❌ Cobalt won’t be able to find the tokens
+   tokens: "@my-scope/my-tokens/tokens.json", // ✅ Cobalt can locate this just fine
```

### Loading multiple schemas

Cobalt supports loading multiple tokens schemas by passing an array:

```js
export default {
  tokens: ['./base.json', './theme.json', './overrides.json'],
};
```

Cobalt will flatten these schemas in order, with the latter entries overriding the former if there are any conflicts. The final result of all the combined schemas **must** result in a valid tokens.json.

> ⚠️ **Warning** All aliases must refer to the same document, e.g. don’t try to include filenames such as `{./theme.json#/color.action.50}`. Reference it as if it were in the same file.

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
