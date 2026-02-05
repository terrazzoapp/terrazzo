---
title: JS API
layout: ../../../../layouts/docs.astro
---

# JS API

The JS API is a lower-level, powerful API that can be used to build Design Token systems. The JS API runs anywhere JavaScript does, including in Node.js, the browser, and serverless functions.

## Basic Usage

:::npm

```sh
npm i -D @terrazzo/parser
```

:::

And here’s a basic example showing `config`, `parse`, and `build` steps:

```js
import { defineConfig, parse, build } from "@terrazzo/parser";
import fs from "node:fs/promises";

const config = defineConfig(
  {
    // config options
  },
  { cwd: new URL(import.meta.url) },
);

const filename = new URL("./tokens/my-tokens.json", import.meta.url);
const { tokens, sources } = await parse(
  [{ filename, src: await fs.readFile(filename) }],
  { config },
);
const buildResult = await build(tokens, { sources, config });

for (const { filename, contents } of buildResult) {
  await fs.writeFile(filename, contents);
}
```

It’s worth noting the JS API is a little more manual work than the [CLI](/docs/):

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
  },
);
```

## YAML support

Though the [CLI](/docs) ships with YAML support, the parser does not to cut down on package size (saves ~100kb, which is over double the existing weight). To support YAML in the JS API, first install the `yaml-to-momoa` package:

:::npm

```sh
npm i -D yaml-to-momoa
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
import * as momoa from "@humanwhocodes/momoa";
import { parse } from "@terrazzo/parser";
import { ColorSpace, parseColor, serialize, sRGB } from "colorjs.io/fn";
import fs from "node:fs/promises";

ColorSpace.register(sRGB);

const filename = new URL("./tokens/my-tokens.json", import.meta.url);
const config = defineConfig({}, { cwd: new URL(import.meta.url) });
const { sources } = await parse(
  [{ filename, src: await fs.readFile(filename) }],
  {
    config,
    transform: {
      // Dynamically inject some colors
      group(node, path) {
        if (path.join(".").startsWith("color.base.slate")) {
          node.members.push(
            momoa.parse({
              "1000": { $value: "#242424" }, // dynamically inject color.base.slate.1000
            }).body.members[0],
          );
        }
      },

      // Transform color tokens, converting them from CSS strings into color objects
      color(json, path, ast) {
        const color = parseColor(json.$value);
        const space = ColorSpace.get(color.spaceId);
        return (node.members.find(
          (m) => m.name.type === "String" && m.name.value === "$value",
        ).value = momoa.parse({
          colorSpace: space.cssId,
          components: color.coords,
          alpha: color.alpha,
          hex: serialize(color, { format: "hex" }),
        }));
      },
    },
  },
);
```

Return **undefined** to leave the JSON as-is, or return **any JSON-serializable value** to replace the JSON with a new one.

### Visitor options

Every visitor has the following parameters:

| Name                 | Type                   | Description                                                                                                                                                                              |
| :------------------- | :--------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **node**             | `AnyNode`              | A [Momoa](https://www.npmjs.com/package/@humanwhocodes/momoa) AST node as-parsed. This contains lots of metadata like file location, line number, etc. not found in the raw JSON itself. |
| **options.path**     | `string[]`             | The path in the document to this node.                                                                                                                                                   |
| **options.filename** | `URL`                  | The URL to this document.                                                                                                                                                                |
| **options.parent**   | `AnyNode \| undefined` | The parent Momoa AST node, unless this is the document node.                                                                                                                             |

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

So you couldn’t, say, transform the value of `color.neutral.default.100` in step 5, but try to use it in step 3 in the **group** `color.neutral` transform—when that fires, it still has the old value. Traversals don’t re-fire just for efficiency. So when transforming, you’ll have to work with the highest level up that captures what you want to do.

The **root** visitor always fires first, no matter what.

### Restrictions / details

- The input **must be valid JSON to start.** This API can’t take unparseable JSON and make it parseable.
- The final result will **always be validated.** So even if it wasn’t valid DTCG tokens to start, as long as it’s valid after transformation, that’s all that matters.
- Transforming after alias validation isn’t possible. At that point, the structure has been finalized, so any changes made would be too complex to re-trace.
- There’s not a way to catch “any token” type. If you want to apply some transformation to all token types, specify each visitor individually and create common functions to call.
- AST source locations aren’t updated from transformations. For example, any dynamically-injected tokens wouldn’t have any source location whatsoever (this only matters if you’ve built plugins that use AST data).

:::tip

If you need a more advanced usecase than what the Transform API can deliver, you can always process tokens in multiple passes! For example, you could always simply use `parse()` to generate a clean, easy-to-work-with tokens object in memory, you could operate on that, and you could re-run it through `parse()` again.

:::

## Resolvers

The v2025.10 version of the DTCG spec introduced [resolvers](https://www.designtokens.org/tr/2025.10/resolver/), meta-documents that describe how multiple sets of tokens relate to one another to form one tokens manifest or even apply contextual values such as themes or modes.

Because DTCG tokens can be used with or without a resolver file, this is a separate API.

### Basic usage

```ts
import { createResolver, parse } from "@terrazzo/parser";

const sources = [
  {
    filename: new URL("file:///my-resolver.resolver.json"),
    src: {
      /* contents */
    },
  },
];

const { resolver } = await parse(sources, { config });
const r = createResolver(resolver);

r.apply(); // get base set ⚠️ only possible if resolver declared 0 modifiers
r.apply({ theme: "light", size: "desktop" }); // tokens for theme: light; size: desktop
r.apply({ theme: "dark", size: "mobile" }); // tokens for theme: dark; size: mobile
```

The parser will only return a `resolver` if it was handed one. This will be `undefined` otherwise.

It must be passed to `createResolver()`

:::tip

The resolver should always be passed to `parse()` first because resolvers can contain inline tokens and `$ref`s. Providing your own resolver to `createResolver()` is technically doable, but very tricky.

:::

### Working with permutations

```ts
import { createResolver, parse } from "@terrazzo/parser";

const { resolver } = await parse(sources, { config });
const r = createResolver(resolver);

for (const input of r.inputPermutations) {
  r.apply(input); // tokens for this input
}
```

It’s up to you to specify all the permutations desired. `.getAllInputPermutations()` will return an array of all possible inputs for the specified modifiers.

If the resolver specified zero modifiers, the array will be `[{}]` so you can still produce at least 1 valid tokens set. Thus, it will never be an empty array.

### API

#### createResolver

`createResolver(resolver)` returns a resolver with the following methods:

| Name                  | Type                                                               | Description                                                                                                                                           |
| :-------------------- | :----------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **apply**             | `(input: Record<string, string>) => TokensMap`                     | Apply [inputs](https://www.designtokens.org/tr/2025.10/resolver/#inputs) to the resolver.                                                             |
| **inputPermutations** | `Record<string, string>[]`                                         | Get all valid inputs for all [modifiers](https://www.designtokens.org/tr/2025.10/resolver/#modifiers).                                                |
| **isValidInput**      | `(input: Record<string, string>, throwError?: boolean) => boolean` | Returns a boolean value if a given input meets the resolver requirements. Optionally pass `true` for the 2nd param to throw errors with helpful info. |
| **getPermutationID**  | `(input: Record<string, string>) => string`                        | Returns a stable, deterministic ID from an input. This can also be parsed by JSON back into a normalized input.                                       |
| **source**            | Resolver                                                           | Original resolver, in case you want to manually verify something or implement new logic.                                                              |
