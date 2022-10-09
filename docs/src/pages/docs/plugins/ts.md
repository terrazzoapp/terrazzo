---
title: TypeScript Plugin for Cobalt
layout: ../../../layouts/docs.astro
---

Generate TypeScript output from design tokens.

```
npm i -D @cobalt-ui/plugin-ts
```

```js
// tokens.config.mjs
import ts from '@cobalt-ui/plugin-ts';
import better from 'better-color-tools';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    ts({
      /** set the filename inside outDir */
      filename: './index.ts',
      /** modify values */
      transform(token, mode) {
        // convert colors to P3
        switch (token.$type) {
          case 'color': {
            return better.from(token.$value).p3;
          }
        }
      },
    }),
  ],
};
```

## Usage

Have your tokens automatically typed! The TS plugin provides several tools to make working with tokens easier.

The default `tokens` export contains a 1:1 representation of your `tokens.json`, but with all values resolved. All values are typed to prevent null reference errors.

```ts
import {tokens} from './tokens/index.js';

const red = tokens.color['red-10']; // #f44c26
const typo = tokens.color['red-11']; // "Error: Property 'red-11' does not exist on type …"
```

You can alternately reference a single-depth object with the full ID, if you prefer:

```ts
import {tokensFlat} from './tokens/index.js';

const red = tokensFlat['color.red-10']; // #f44c26
```

To use [modes](https://cobalt-ui.pages.dev/docs/guides/modes/), import the `mode()` function and use the full ID:

```ts
import {mode} from './tokens/index.js';

const redDark = mode('color.red-10', 'dark'); // #f44c26"
const redFoo = mode('color.red-10', 'foo'); // Argument of type '"foo"' is not assignable to parameter of type …
```

The `mode()` function is fully type-checked, and it won’t let you reference a mode that doesn’t exist.
