# @terrazzo/json-schema-tools

Library for bundling JSON Schema files and parsing [JSON refs](https://datatracker.ietf.org/doc/html/rfc6901). Uses [Momoa](https://github.com/humanwhocodes/momoa) to provide support for JSONC and source mapping.

## API

### parseRef

Lower-level function to parse a `$ref` path. Accepts either a string or reference object.

> [!NOTE]
> If pointing to the same file, it will return `.` as the URL.

```ts
import { parseRef } from "@terrazzo/json-schema-tools";

parseRef("tokens.json#/foo/bar"); // { url: 'tokens.json', subpath: ['foo', 'bar'] }
parseRef({ $ref: "#/baz/bat" }); // { url: '.', subpath: ['baz', 'bat'] }
```

### Comparison

| Package                             |      Size | Ops/s | Speed | ESM? |
| :---------------------------------- | --------: | ----: | ----: | :--: |
| @terrazzo/json-schema-tools         |  `0.4 kB` |  9.3M |  100% |  ✅  |
| @apidevtools/json-schema-ref-parser | `82.2 kB` |  2.3M |   25% |      |

_Note: for every package tested, we’re comparing against the lowest-level method that does equivalent work. We’re not comparing apples to oranges and testing extraneous codepaths._

### bundle

Given an array of JSON schema documents, will bundle them together as a [Momoa AST](https://github.com/humanwhocodes/momoa).

```ts
import { bundle } from "@terrazzo/json-schema-tools";
import * as momoa from "@humanwhocodes/momoa";

const documents = [
  {
    filename: new URL("file:///a.json"),
    src: '{"a":"a"}',
  },
  {
    filename: new URL("file:///b.json"),
    src: '{"b":"b"}',
  },
  {
    filename: new URL("file:///b.json"),
    src: '{"c":"c"}',
  },
];

const document = await bundle(documents, {
  req: (url) => fetch(url).then((res) => res.text()),
});

console.log(momoa.print(document)); // produce JSON string, with original indentation and everything preserved
console.log(momoa.evaluate(document)); // produce in-memory JS
```

#### Options

The `bundle()` method takes an options param as its 2nd argument. These are all the options:

| Name            | Type                                       | Description                                                                                                                                                                                                        |
| :-------------- | :----------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **req**         | (src: URL, origin: URL) => Promise<string> | Handle remote requests, either via fetching or file system reads.                                                                                                                                                  |
| **parse**       | (src: any, filename: URL) => DocumentNode; | Optional wrapper around Momoa’s parser. You may want to do this if you want to transform the sources as they come in, before they are parsed. If providing this function, you must `parse()` using Momoa yourself. |
| **yamlToMomoa** | `yaml-to-momoa`                            | Pass in the module for `yaml-to-momoa` to add support for YAML (`import` it, then pass it as a param).                                                                                                             |

## Additional information

### Why Momoa?

There are 3 main problems with relying on JavaScript’s major parser alone:

1. **It doesn’t preserve original source locations.** For hand-authored JSON, it’s helpful to preserve source maps, and original syntax. That way we can provide exact line & column in errors.
2. **It doesn’t support JSONC (JSON with comments) and other quality of life improvements.** Momoa handles comments in JSONC and JSON5, something standard `JSON.parse()` can’t do.
3. **Transformations are easier.** The native replacer/reviver API isn’t as intuitive and flexible as standard AST operations.

All of these improvements make working with Momoa preferable to raw JSON, and also without incurring significant performance cost (`JSON.parse()` will always be a little faster, sure, but this isn’t that much slower either).
