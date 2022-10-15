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

To use a token, import the `token()` function and reference it by its full ID:

```ts
import {token} from './tokens/index.js';

// get default token
const red = token('color.red.10');

// get token for mode: dark
const redDark = token('color.red.10', 'dark');
```

You’ll also be able to see any `$description`s specified in your IDE. If using TypeScript, this will be fully typed and will throw a type error if a bad token ID is passed.

#### Metadata

The `meta` object can be used to gather additional info about a token:

```ts
import {meta} from './tokens/index.js';

console.log(meta['color.red.10']); // { $type: 'color', $value: '#f44c26' }
```

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
      js: './index.js',
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
