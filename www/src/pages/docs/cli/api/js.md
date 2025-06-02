---
title: JS API
layout: ../../../../layouts/docs.astro
---

# JS API

The JS API is a lower-level, powerful API that can be used to build Design Token systems. The JS API runs anywhere JavaScript does, including in Node.js, the browser, and serverless functions.

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
import fs from "node:fs";

const config = defineConfig(
  {
    // config options
  },
  { cwd: new URL(import.meta.url) }
);

const filename = new URL("./tokens/my-tokens.json", import.meta.url);
const { tokens, sources } = await parse(
  [{ filename, src: fs.readFileSync(filename) }],
  { config }
);
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

const { tokens, ast } = await parse(
  [{ filename: new URL("file:///tokens.json"), src: rawTokens }],
  {
    config,
    logger: new MyLogger(),
  }
);
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

## Transform API

Sometimes the token source you’re reading from isn’t in a perfect state, and you want to transform the values before being parsed. You can do so by specifying a `transform` object in the options with AST visitors:

```ts
import { parse } from "@terrazzo/parser";
import culori from "culori";

const filename = new URL("./tokens/my-tokens.json", import.meta.url);
const { sources } = await parse(
  [{ filename, src: fs.readFileSync(filename) }],
  { config }
);

const { code } = await parse([{ filename, src: fs.readFileSync(filename) }], {
  transform: {
    // Dynamically inject some colors
    group(json, path, ast) {
      if (path.startsWith("color.base.slate")) {
        return {
          ...json,
          "1000": { $value: "#242424" }, // dynamically inject color.base.slate.1000
        };
      }
    },

    // Transform color tokens, converting them from CSS strings into color objects
    color(json, path, ast) {
      const color = culori.parse(json.$value);
      if (!color) return;

      const { mode: colorSpace, alpha, ...components } = color;

      return {
        ...json,
        $value: { colorSpace, components, alpha },
      };
    },
  },
});

fs.writeFileSync("./tokens/updated-tokens", code);
```

Return **undefined** to leave the JSON as-is, or return **any JSON-serializable value** to replace the JSON with a new one.

### Visitor options

Every visitor has the following parameters:

| Name     | Type      | Description                                                                                                                                                                              |
| :------- | :-------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **json** | `any`     | The raw JSON as it was authored. Note that tokens may not have `$type: [type]` declared if they inherit from their parent.                                                               |
| **path** | `string`  | The path to a group or token node (e.g. `color.neutral.default.100`).                                                                                                                    |
| **ast**  | `AnyNode` | A [Momoa](https://www.npmjs.com/package/@humanwhocodes/momoa) AST node as-parsed. This contains lots of metadata like file location, line number, etc. not found in the raw JSON itself. |

### Visitor types

All the [token types](https://terrazzo.app/docs/reference/tokens/) are supported:

- color
- dimension
- fontFamily
- fontWeight
- duration
- cubicBezier
- number
- link
- boolean
- strokeStyle
- border
- transition
- shadow
- gradient
- typography
- (other) for any unknown `$type: [type]` declarations, they’ll fire the appropriate visitor type (for example, `"$type": "radius"` which is an invalid token type, would still fire a `radius(json, path, ast)` callback).

As well as 2 other special types:

- root (the complete document, at path `.`)
- group (individual groups, never the entire document)

### Behavior

The visitor always moves top-down (or “depth-first”). What this means is if you had a `color.neutral.default.100` token, the visitors would always fire in this order:

1. root
2. group `color`
3. group `color.neutral`
4. group `color.neutral.default`
5. color `color.neutral.default.100`

So you couldn’t, say, transform the value of `color.neutral.default.100` and try to use it in the **group** `color.neutral` transform—when that fires, it still has the old value. So when transforming, you’ll have to work with the highest level up that captures what you want to do.

The **root** visitor always fires first, no matter what.

### Restrictions / details

- The input **must be valid JSON to start.** This API can’t take unparseable JSON and make it parseable.
- The final result will **always be validated.** So even if it wasn’t valid DTCG tokens to start, as long as it’s valid after transformation, that’s all that matters.
- Transforming after alias validation isn’t possible. At that point, the structure has been finalized, so any changes made would be too complex to re-trace.
- There’s not a way to catch “any token” type. If you want to apply some transformation to all token types, specify each visitor individually and create common functions to call.
- AST source locations aren’t updated from transformations. For example, any dynamically-injected tokens wouldn’t have any source location whatsoever (this only matters if you’ve built plugins that use AST data).

::: tip

If you need a more advanced usecase than what the Transform API can deliver, you can always process tokens in multiple passes! For example, you could always simply use `parse()` to generate a clean, easy-to-work-with tokens object in memory, you could operate on that, and you could re-run it through `parse()` again.

:::
