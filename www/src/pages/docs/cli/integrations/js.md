---
title: JS (and TS)
layout: ../../../../layouts/docs.astro
---

# JavaScript (and TypeScript)

Terrazzo’s JS plugin generates JavaScript, TypeScript, and JSON output from your tokens.

## Setup

:::code-group

```sh [npm]
npm i -D @terrazzo/plugin-js
```

```sh [pnpm]
pnpm i -D @terrazzo/plugin-js
```

```sh [bun]
bun i -D @terrazzo/plugin-js
```

:::

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";
import pluginJS from "@terrazzo/plugin-js";

export default defineConfig({
  plugins: [
    pluginJS({
      output: {
        js: "index.js",
        ts: "index.d.ts",
        json: false, // set to a filename to generate JSON
      },
    }),
  ],
});
```

:::

## Usage

```ts
import token from "./tokens/index.js";

token("color.blue.500");
```

## Config

Configure options in [terrazzo.config.js](/docs/cli/config):

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";
import pluginJS from "@terrazzo/plugin-js";

export default defineConfig({
  plugins: [
    pluginJS({
      /* options */
    }),
  ],
});
```

:::

### Options

| Name   | Type                | Description                                                                                                          |
| :----- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| `js`   | `string \| boolean` | Set to a filename, or `false` to disable (default: `index.js`).                                                      |
| `ts`   | `string \| boolean` | Set to a filename, or `false` to disable (default: `index.d.ts`) _Note: this can’t be enabled if `js` is disabled_). |
| `json` | `string \| boolean` | Set to a filename, or `false` to disable (default: `false`).                                                         |
