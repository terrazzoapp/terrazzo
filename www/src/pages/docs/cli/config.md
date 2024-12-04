---
title: Configuration
layout: ../../../layouts/docs.astro
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

## Lint

See [Lint docs](/docs/cli/lint).

## Ignore

You can ignore certain tokens from all parsing and output at a global level. This is useful if you have tokens that are invalid, or you just don’t want to show up in any plugin.

```js
export default defineConfig({
  ignore: {
    tokens: ["legacy-tokens.*"],
    deprecated: true,
  },
});
```

### Tokens

An array of token IDs, or globs to ignore.

### Deprecated

Enable to ignore any token with a `$deprecated` key.

## All Options

| Name      | Type                 | Description                                                                    |
| :-------- | :------------------- | :----------------------------------------------------------------------------- |
| `tokens`  | `string \| string[]` | The path to your tokens. Can be one file (`string`), or multiple (`string[]`). |
| `outDir`  | `string`             | The directory for output (_Tip: add this to `.gitignore`_).                    |
| `plugins` | `Plugin[]`           | An array of [plugins](/docs/integrations) to use.                              |
| `lint`    | `LintOptions`        | See [Lint docs](/docs/cli/lint).                                               |
| `ignore`  | `IgnoreOptions`      | [Ignore](#ignore)                                                              |
