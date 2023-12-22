# @cobalt-ui/plugin-js

Generate JSON and JS (with TypeScript types) from your design tokens using [Cobalt](https://cobalt-ui.pages.dev).

**Features**

- ✅ Universal JSON format makes it easy to consume tokens in any platform (including native/compiled code)
- ✅ Access all your design tokens safely and programatically in any frontend or backend setup
- ✅ Full support for token modes (e.g. light/dark mode)
- ✅ Automatic TypeScript types for strong typechecking (never have a broken style)

## Setup

Install the plugin from npm:

```bash
npm i -D @cobalt-ui/plugin-js
```

Then add to your `tokens.config.mjs` file:

```js
// tokens.config.mjs
import pluginJS from '@cobalt-ui/plugin-js';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
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

> The default plugin exports a plain `.js` with invisible `.d.ts` TypeScript declarations alongside it, which means you don’t have to configure anything whether using TypeScript or not.

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

## Docs

[View the full documentation](https://cobalt-ui.pages.dev/integrations/js)
