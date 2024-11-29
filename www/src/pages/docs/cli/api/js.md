---
title: JS API
layout: ../../../../layouts/docs.astro
---

# JS API

The JS API is a lower-level, powerful API that can be used to build Design Token systems such as the [Token Lab](/docs/token-lab). The JS API runs anywhere JavaScript does, including in Node.js, the browser, and serverless functions.

## Basic Usage

:::code-group

```sh [npm]
npm i -D @terrazzo/parser
```

```sh [pnpm]
pnpm i -D @terrazzo/parser
```

```sh [bun]
bun i -D @terrazzo/parser
```

:::

And here’s a basic example showing `config`, `parse`, and `build` steps:

```js
import { defineConfig, parse, build } from "@terrazzo/parser";

const config = defineConfig(
  {
    // config options
  },
  { cwd: new URL(import.meta.url) }
);

const rawTokens = "(any JSON or YAML)";
const { tokens, sources } = await parse(rawTokens, { config });
const buildResult = await build(tokens, { sources, config });
```

It’s worth noting the JS API is a little more manual work than the [CLI](/docs/cli):

- `parse()` and `build()` are distinct steps that each do some of the work.
- `defineConfig()` needs a <abbr title="Current Working Directory">cwd</abbr> so it can resolve files (this can even be a remote URL, so long as it’s a URL())
- The AST generated from `parse()` must get passed into `build()` so the error messages can point to the right lines in the source file.
- The `build()` step only returns a final array of `outputFiles`in memory but doesn’t write them to disk. It’s up to you to write them to disk, upload them somewhere, etc.

## Logging

By default, Terrazzo creates its own logger to print console warnings as well as throw errors at appropriate times.

You can substitute your own logger instead, which may be useful if, say, you want to pipe output to somewhere other than `console`, or you want to prevent throwing on `error()`.

```js
class MyLogger {
  level = "warn"; // "error" | "warn" (default) | "debug" | "silent"

  constructor(level) {
    if (level) {
      this.level = level;
    }
  }
  warn(message) {
    // …
  }
  error(message) {
    // …
  }
  debug(message) {
    // …
  }
}

const { tokens, ast } = await parse(rawTokens, {
  config,
  logger: new MyLogger(),
});
```

## YAML support

Though the [CLI](/docs/cli) ships with YAML support, the parser does not to cut down on package size (saves ~100kb, which is over double the existing weight). To support YAML in the JS API, first install the `yaml-to-momoa` package:

:::code-group

```sh [npm]
npm i -D yaml-to-momoa
```

```sh [pnpm]
pnpm i -D yaml-to-momoa
```

```sh [bun]
bun i -D yaml-to-momoa
```

:::

Then add it as an option to `parse()`:

```ts
import { parse } from "@terrazzo/parser";
import { yamlToMomoa } from "yaml-to-momoa";

const yaml = `color:
  blue:
    $type: color
    $value: '#8ec8f6`;
const { tokens, sources } = await parse(yaml, { config, yamlToMomoa });
```
