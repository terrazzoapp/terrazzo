---
title: JSON Integration
---

# JSON + Native App Integration

Generate universal JSON from your Design Tokens Format Module (DTFM) tokens. This is usable by any platform, any language (provided you do a small amount of JSON parsing).

## Setup

::: tip

Make sure you have the [Cobalt CLI](/guides/cli) installed!

:::

This uses the [JS plugin](/integrations/js), which we’ll install from npm:

```bash
npm i -D @cobalt-ui/plugin-js
```

Then add to your `tokens.config.mjs` file:

::: code-group

<!-- prettier-ignore -->
```js [tokens.config.mjs]
import pluginJS from '@cobalt-ui/plugin-js'; // [!code ++]

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginJS({ // [!code ++]
      /** output JSON? boolean or filename (default: false) */  // [!code ++]
      json: true, // [!code ++]
    }), // [!code ++]
  ],
};
```

:::

And run:

```sh
npx co build
```

You’ll get a generated `./tokens/tokens.json` file with the following structure:

| Name     | Type     | Description                                                                                         |
| :------- | :------- | :-------------------------------------------------------------------------------------------------- |
| `tokens` | `object` | Object of token ID → value (all aliases resolved & all transformations applied)                     |
| `meta`   | `object` | Object of token ID → metadata (`$type`, `$description`, etc.)                                       |
| `modes`  | `object` | Object of token ID → mode → values (note: tokens without any modes will be missing from the object) |

## Usage

Usage will vary depending on the platform and language, but here are a few examples:

- [Simplifying iOS Apps Design with Design Tokens](https://blogs.halodoc.io/simplifying-ios-app-design-with-design-tokens/) (this blog post uses Style Dictonary JSON, but the same ideas apply to DTFM JSON)

## Config

The config options [are the same as the JS plugin](/integrations/js#config).

## Transform

Likewise, the transform API is [also the same as the JS plugin](/integrations/js#transform).
