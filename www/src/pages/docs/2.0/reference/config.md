---
title: Configuration
layout: ../../../../layouts/docs.astro
---

# Config

The Terrazzo CLI needs a `terrazzo.config.js` file in your project root for most tasks. Here’s an example file, with all defaults:

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";

export default defineConfig({
  tokens: ["./tokens.json"],
  outDir: "./tokens/",

  plugins: [
    css(), // generate .css files
  ],

  lint: {
    rules: {
      // my lint rules
    },
  },
});
```

:::

:::tip
Enabling `{ "type": "module" }` in your `package.json` is recommended, but if that’s not possible, name your config `terrazzo.config.mjs` instead.
:::

### tokens

All your token files to parse. Can be one file (`tokens: "tokens.json"`), or multiple (`tokens: ["colors.json", "typography.json", "spacing.json"]`).

In the case of multiple files, they will be merged in array order (last will take precedence).

Supports JSON, JSONC, and YAML.

### outDir

The directory for plugin output. By default this is `./dist/` (relative to `terrazzo.config.js`).

:::tip

It’s recommended to add `outputDir` to your `.gitignore`.

:::

### plugins

[Plugins](/docs/integrations) for Terrazzo. Each plugin generates one or more outputs (generally). Plugins can even be chained together.

You can use [an existing plugin](/docs/integrations), or [write your own](/docs/reference/plugin-api).

### lint

See [Lint docs](/docs/linting).

### ignore

You can ignore certain tokens from all parsing and output at a global level. This is useful if you have tokens that are invalid, or you just don’t want to show up in any plugin.

```js
export default defineConfig({
  ignore: {
    tokens: ["legacy-tokens.*"],
    deprecated: true,
  },
});
```

### ignore.tokens

An array of token IDs or globs to ignore from all lint rules.

### ignore.deprecated

Set to `true` to not parse or output any tokens that are `$deprecated`.
