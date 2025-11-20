---
title: JS (and TS)
layout: ../../../../layouts/docs.astro
---

# JavaScript / TypeScript

Terrazzo’s JS plugin generates TypeScript-compatible JS for your tokens. This plugin generates **fast** code but it’s not necessarily lightweight, and for that usage is probably better-used in a Node.js context rather than the client (for client applications, the [css-in-js plugin](./css-in-js/) is preferred).

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
      filename: "tokens.js",
    }),
  ],
});
```

:::

## Usage

### Single-mode (no resolver)

```ts
import tokens from "./tokens/tokens.js";

tokens.get("color.blue.200"); // { "$type": "color", "$value": { "colorSpace": "srgb", "components": [0, 0.23, 0.853] } }
tokens.listAll() // [{ id: "color.blue.100", $type: "color", … }, …]
```

:::tip

Need to work with color? Use [color.js’ procedural API](https://colorjs.io/docs/procedural) for modern, efficient color tools.

:::

### Multi-mode (resolver)

If using a [Resolver](https://designtokens.org/TR/2025.10/resolver/) (the official DTCG way to declare multi-modal tokens), you’ll need to set your context first before getting all tokens:

```ts
import resolver from "./tokens/tokens.js";

// Note: A resolver doesn’t have “default values,” so you’ll need to apply() a context first
resolver.get("color.blue.600"); // ❌ Error: multiple values found

// Token set 1: theme: light + size: md
const lightMd = resolver.apply({ theme: "light", size: "md" });
lightMd.get("color.blue.600"); // { "$type": "color", "$value": { "colorSpace": "srgb", "components": [0, 0.23, 0.853] } }
lightMd.listAll(); // [{ id: "color.blue.100", $type: "color", … }, …]

// Token set 2: theme: dark + size: lg
const darkLg = resolver.apply({ theme: "dark", size: "lg" });
darkLg.get("color.blue.600"); // { "$type": "color", "$value": { "colorSpace": "srgb", "components": [0, 0.17, 0.654] } }
darkLg.listAll()  // [{ id: "color.blue.100", $type: "color", … }, …]
```

### Legacy modes

If using `$extensions.mode` (legacy syntax), use the resolver API but with `tzMode`:

```ts
import resolver from "./tokens/tokens.js";

const darkTokens = resolver.apply({ tzMode: "dark" });
darkTokens.get("color.blue.600")
```

### API

| Name           | Type                                          | Description                                                                                              |
|:---------------|:----------------------------------------------|:---------------------------------------------------------------------------------------------------------|
| get()          | `(name: string) => Token`                     | Get a token by ID. Will throw an error if a resolver is used.                                            |
| listAll()      | `() => Token[]`                               | Return an array of all tokens.                                                                           |
| apply()        | `(input: Record<string, string>) => TokenAPI` | Apply context values to produce a new token interface (use `get()` and `listAll()`).                     |
| permutations   | `Record<string, string>[]`                    | Get all possible input values of the resolver (ignores default values).                                  |
| isValidInput() | `(input: Record<string, string>) => boolean`  | Determine whether an input value is valid for the given resolver (automatically applies default values). |

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

| Name       | Type     | Description                               |
| :--------- | :------- | :---------------------------------------- |
| `filename` | `string` | Set to a filename (default: `tokens.js`). |

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

The usage is also different; refer to the [appropriate sections](#usage) for guides on what your new code should look like.
