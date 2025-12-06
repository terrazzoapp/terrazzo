---
title: JS (and TS)
layout: ../../../../layouts/docs.astro
---

# JavaScript / TypeScript

Terrazzo’s JS plugin generates a resolver API for Node.js clients from your token system. It produces code that is **fast but heavy**, so it is better-suited for server-side rendering. For client applications, prefer the [css-in-js plugin](./css-in-js/) instead.

:::note

Heads up! The 2.0 plugin has changed quite a lot from Terrazzo 0.x alpha. Read the [migrating guide](#migrating-from-0x) for changes.

:::

## Setup

:::npm

```sh
npm i -D @terrazzo/plugin-js
```

:::

:::code-group

```ts [terrazzo.config.ts]
import { defineConfig } from "@terrazzo/cli";
import js from "@terrazzo/plugin-js";

export default defineConfig({
  plugins: [
    js({
      filename: "my-ds.js",
      // optional: only generate outputs for the following modifier contexts
      contexts: {
        theme: ["light", "dark"],
        size: ["sm", "md", "lg"],
      },
    }),
  ],
});
```

:::

## Usage

```ts
import { resolver } from "./tokens/my-ds.js";

const lightMd = resolver.apply({ theme: "light", size: "sm" });
lightMd["color.bg"].$type; // "color"
lightMd["color.bg"].$value; // { "colorSpace": "srgb", "components": [1, 1, 1] }

resolver.apply({ foo: "bar" }); // ❌ Invalid input { "foo": "bar" }
```

:::tip

Need to work with color? Use [color.js’ procedural API](https://colorjs.io/docs/procedural) for modern, efficient color tools.

:::

## Config

Configure options in [terrazzo.config.ts](/docs/reference/config):

:::code-group

```ts [terrazzo.config.ts]
import { defineConfig } from "@terrazzo/cli";
import js from "@terrazzo/plugin-js";

export default defineConfig({
  plugins: [
    js({
      /* options */
    }),
  ],
});
```

:::

### Options

| Name         | Type                        | Description                                                                                              |
| :----------- | :-------------------------- | :------------------------------------------------------------------------------------------------------- |
| `filename`   | `string`                    | Set to a filename (default: `tokens.js`).                                                                |
| `contexts`   | `Record<string, string[]>`  | Set this to “tree-shake” modifiers. By default, all permutations will be built.                          |
| `properties` | `(keyof TokenNormalized)[]` | Only include the specified properties on all tokens. Use to reduce generated filesize and memory impact. |

#### properties

Here are all valid properties, from the `TokenNormalized` type:

- `$type`
- `$description`
- `$value`
- `$extensions`
- `$deprecated`
- `id` (excluded by default)
- `jsonID` (excluded by default)
- `originalValue` (excluded by default)
- `source` (excluded by default)
- `aliasOf` (excluded by default)
- `aliasChain` (excluded by default)
- `aliasedBy` (excluded by default)
- `dependencies` (excluded by default)
- `group` (excluded by default)

## Migrating from 0.x

This plugin got several breaking changes from 0.x.

First, this plugin now always generates `.d.ts` files alongside `.js` files without configuration. Use `filename` instead of `js`:

:::code-group

```diff [terrazzo.config.ts]
import js from "@terrazzo/plugin-js";

export default defineConfig({
  plugins: [
    js({
-     js: "tokens.js",
+     filename: "tokens.js",
-     ts: "tokens.d.ts",
-     json: false, // set to a filename to generate JSON
    }),
  ],
});
```

:::

Next, if you’re still using legacy `$extensions.mode`, you’ll want to use `tz.mode` as the context name, e.g.:

:::code-group

```diff [terrazzo.config.ts]
import js from "@terrazzo/plugin-js";

export default defineConfig({
  plugins: [
    js({
+     contexts: {
+       'tz.mode': ['light', 'dark'],
+     }
    }),
  ],
});
```

:::

The usage is also different; refer to the [appropriate sections](#usage) for guides on what your new code should look like.
