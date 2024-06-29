---
title: Config
layout: ../../../layouts/docs.astro
---

# Config

The Terrazzo CLI needs a `terrazzo.config.js` file in your project root for most tasks. Here’s an example file, with all defaults:

:::code-group

```js [terrazzo.config.js]
import pluginCSS from "@terrazzo/plugin-css";

/** @type {import("@terrazzo/cli").Config} */
export default {
  tokens: ["./tokens.json"],
  outDir: "./tokens/",
  plugins: [pluginCSS()],
  build: {
    cleanDir: false,
  },
};
```

:::

## Linting

See [Linting](/docs/cli/linting).

## All Options

| Name      | Type                 | Description                                                                    |
| :-------- | :------------------- | :----------------------------------------------------------------------------- |
| `tokens`  | `string \| string[]` | The path to your tokens. Can be one file (`string`), or multiple (`string[]`). |
| `outDir`  | `string`             | The directory for output (_Tip: add this to `.gitignore`_).                    |
| `plugins` | `Plugin[]`           | An array of [plugins](/docs/integrations) to use.                              |
| `lint`    | `LintOptions`        | See [Linting](/docs/cli/linting).                                              |
