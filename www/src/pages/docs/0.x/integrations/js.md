---
title: JS (and TS)
layout: ../../../../layouts/docs.astro
---

# JavaScript / TypeScript

:::warning

These docs are for the outdated 0.x version of this plugin. The [new version](/docs/integrations/js) has a different API.

:::

Terrazzo’s JS plugin generates JavaScript, TypeScript, and JSON output from your tokens.

## Setup

:::npm

```sh
npm i -D @terrazzo/plugin-js
```

:::

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";
import js from "@terrazzo/plugin-js";

export default defineConfig({
  plugins: [
    js({
      js: "index.js",
      ts: "index.d.ts",
      json: false, // set to a filename to generate JSON
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

Configure options in [terrazzo.config.js](/docs/reference/config):

:::code-group

```js [terrazzo.config.js]
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

| Name   | Type                | Description                                                                                                          |
| :----- | :------------------ | :------------------------------------------------------------------------------------------------------------------- |
| `js`   | `string \| boolean` | Set to a filename, or `false` to disable (default: `index.js`).                                                      |
| `ts`   | `string \| boolean` | Set to a filename, or `false` to disable (default: `index.d.ts`) _Note: this can’t be enabled if `js` is disabled_). |
| `json` | `string \| boolean` | Set to a filename, or `false` to disable (default: `false`).                                                         |
