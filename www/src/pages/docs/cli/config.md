---
title: Config
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
  plugins: [css()],
  build: {
    cleanDir: false,
  },
});
```

:::

## Lint

See [Lint](/docs/cli/lint).

## All Options

| Name      | Type                 | Description                                                                    |
| :-------- | :------------------- | :----------------------------------------------------------------------------- |
| `tokens`  | `string \| string[]` | The path to your tokens. Can be one file (`string`), or multiple (`string[]`). |
| `outDir`  | `string`             | The directory for output (_Tip: add this to `.gitignore`_).                    |
| `plugins` | `Plugin[]`           | An array of [plugins](/docs/integrations) to use.                              |
| `lint`    | `LintOptions`        | See [Lint](/docs/cli/lint).                                                    |
