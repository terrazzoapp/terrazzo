---
title: JS + TS Integration
---

# JavaScript + TypeScript Integration

Generate JavaScript (with TypeScript declarations) from your Design Tokens Format Module (DTFM) tokens.

## Setup

::: tip

Make sure you have the [Cobalt CLI](/guides/cli) installed!

:::

Install the plugin from npm:

```bash
npm i -D @cobalt-ui/plugin-js
```

Then add to your `tokens.config.mjs` file:

::: code-group

<!-- prettier-ignore -->
```js [tokens.config.mjs]
import pluginJS from '@cobalt-ui/plugin-js'; // [!code ++]

/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginJS({ // [!code ++]
      /** output JS (with TS types)? boolean or filename (default: true) */ // [!code ++]
      js: true, // [!code ++]
    }), // [!code ++]
  ],
};
```

:::

And run:

```sh
npx co build
```

You’ll then get generated JS with a `token()` function you can use to grab token values:

```js
import {token} from './tokens/index.js';

// get default token
const red = token('color.red.10');

// get token for mode: dark
const redDark = token('color.red.10', 'dark');

// cubicBezier + bezier-easing library
import BezierEasing from 'bezier-easing';
const easing = BezierEasing(...token('ease.cubic-in-out'));
```

::: info

The default plugin exports a plain `.js` with invisible `.d.ts` TypeScript declarations alongside it, which means you don’t have to configure anything whether using TypeScript or not.

:::

## API

In addition to `token()`, you’ll also find the following named exports:

| Name     | Type     | Description                                                                                         |
| :------- | :------- | :-------------------------------------------------------------------------------------------------- |
| `tokens` | `object` | Object of token ID → value (all aliases resolved & all transformations applied)                     |
| `meta`   | `object` | Object of token ID → metadata (`$type`, `$description`, etc.)                                       |
| `modes`  | `object` | Object of token ID → mode → values (note: tokens without any modes will be missing from the object) |

## Config

Here are all plugin options, along with their default values:

::: code-group

```js [tokens.config.mjs]
import pluginJS from '@cobalt-ui/plugin-js';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
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

:::

## Transform

Inside plugin options, you can specify an optional `transform()` function.

```js
/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginJS({
      transform(token, mode) {
        const oldFont = 'sans-serif';
        const newFont = 'Custom Sans';
        if (token.$type === 'fontFamily') {
          return token.$value.map((value) => (value === oldFont ? newFont : value));
        }
      },
    }),
  ],
};
```

Your transform will only take place if you return a truthy value, otherwise the default transformer will take place.
