---
title: JS/TS/JSON Plugin for Cobalt
layout: ../../../layouts/docs.astro
---

# @cobalt-ui/plugin-js

Generate JS, TS, and JSON output from design tokens.

```
npm i -D @cobalt-ui/plugin-js
```

```js
// tokens.config.mjs
import pluginJS from '@cobalt-ui/plugin-js';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    pluginJS({
      /** output JS (with TS types)? boolean or filename (default: true) */
      js: true,
      /** output JSON? boolean or filename (default: false) */
      json: false,
    }),
  ],
};
```

_Note: the default plugin exports a `.d.ts` file alongside the `.js`, which means the same file can either be used in JS or TS._

## Usage

### JS

```ts
import {tokens} from './tokens/index.js';

const red = tokens.color.red.10 // #f44c26
```

You can alternately reference a single-depth object with the full ID, if you prefer. This is useful for getting all tokens of a specific name, e.g.:

```ts
import {tokensList} from './tokens/index.js';

const colorTokens = tokensList.filter((token) => token.$type === 'color');
```

To use [modes](https://cobalt-ui.pages.dev/docs/guides/modes/), import the `mode()` function and use the full ID:

```ts
import {mode} from './tokens/index.js';

const redDark = mode('color.red.10', 'dark'); // #f44c26"
const redFoo = mode('color.red.10', 'foo'); // Argument of type '"foo"' is not assignable to parameter of type …
```

The TypeScript version of the `mode()` function is fully type-checked, and it won’t let you reference a mode that doesn’t exist for that specific token.

### JSON

It’s worth noting that your _original_ tokens were in JSON! So, how is this different?

- This is the same format as JS, but in a JSON-serializable format
- You can use both the original deeply-nested structure, or a flattened structure (if you wanted to iterate over all tokens easily without having to “crawl”)
- All aliases are resolved

Consuming JSON will differ based on your purposes and where you’re using it. But loading this won’t be any different than any other JSON file.

- [JSON in Vite](https://vitejs.dev/guide/features.html#json)
- [JSON in webpack](https://webpack.js.org/loaders/#json)

## Options

### All Options

Here are all plugin options, along with their default values:

```js
// tokens.config.mjs
import pluginJS from '@cobalt-ui/plugin-js';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    pluginJS({
      /** output JS? boolean or filename */
      js: true,
      /** output JSON? boolean or filename */
      json: false,
      /** (optional) transform specific token values */
      transform: () => null,
    }),
  ],
};
```

### Transform

Inside plugin options, you can specify an optional `transform()` function.

```js
/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    pluginJS({
      transform(token, mode) {
        const oldFont = 'sans-serif';
        const newFont = 'Custom Sans';
        if (token.$type === 'font') {
          return token.$value.map((value) => (value === oldFont ? newFont : value));
        }
      },
    }),
  ],
};
```

Your transform will only take place if you return a truthy value, otherwise the default transformer will take place.
