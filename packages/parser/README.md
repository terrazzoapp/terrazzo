# ⛋ @terrazzo/parser

The JS API is a lower-level API than the [CLI](../cli/) that can be used to build Design Token systems. The JS API runs anywhere JavaScript does, including in Node.js, the browser, and serverless functions.

## Basic Usage

```sh
npm i -D @terrazzo/parser
```

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
const { tokens, sources } = await parse(
  [{ filename: new URL("file:///tokens.json"), src: rawTokens }],
  { config }
);
const buildResult = await build(tokens, { sources, config });
```

It’s worth noting the JS API is a little more manual work than the [CLI](../cli/):

- `parse()` and `build()` are distinct steps that each do some of the work.
- `defineConfig()` needs a <abbr title="Current Working Directory">cwd</abbr> so it can resolve files (this can even be a remote URL, so long as it’s a URL())
- The AST generated from `parse()` must get passed into `build()` so the error messages can point to the right lines in the source file.
- The `build()` step only returns a final array of `outputFiles`in memory but doesn’t write them to disk. It’s up to you to write them to disk, upload them somewhere, etc.

[Full documentation](https://terrazzo.app/docs/cli/api/js/)
