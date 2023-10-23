---
title: Tailwind
layout: ../../../layouts/docs.astro
---

# Tailwind

Cobalt’s Tailwind plugin lets you use your W3C Design Token Community Group tokens seamlessly in any Tailwind project by building your own custom [preset](https://tailwindcss.com/docs/presets). To start, install the Tailwind plugin and CLI:

```bash
npm install -D @cobalut-ui/plugin-tailwind @cobalt-ui/cli
```

_Note: this assumes you already have Tailwind [installed and configured](https://tailwindcss.com/docs/installation) in your project_

Then set up your `tokens.config.mjs` file, adding the Tailwind plugin, and mapping token IDs to the Tailwind [theme config](https://tailwindcss.com/docs/configuration#theme) inside the `tailwind` option:

```js
// tokens.config.mjs
import pluginTailwind from '@cobalt-ui/plugin-tailwind';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    pluginTailwind({
      /** (optional) the path to the Tailwind preset */
      output?: './tailwind-tokens.js',
      /** (optional) module format to use (to match your Tailwind config) */
      outputFormat?: 'esm' | 'cjs',
        /** @see https://tailwindcss.com/docs/configuration#theme */
      tailwind: {
        theme: {
          colors: {
            blue: {
              100: 'color.blue.100', // map token IDs to Tailwind values
              200: 'color.blue.200',
              // …
            },
          },
          fontFamily: {
            sans: 'typography.family.base',
            // …
          },
          spacing: {
            1: 'token.size.s.space',
            2: 'token.size.m.space',
            // …
          },
          borderRadius: {
            m: 'token.size.m.borderRadius',
            // …
          },
        },
      },
    }),
  ],
};
```

Then, when you run `co build` in your project, it will generate a `./tokens/tailwind-tokens.js` file. Now add it to your Tailwind config under `presets` ([docs](https://tailwindcss.com/docs/configuration#presets)):

```diff
  // tailwind.config.js

  /** @type {import('tailwindcss').Config} */
  export default {
+   presets: ['./tokens/tailwind-tokens.js'],
  };
```

_Note: if using CommonJS, use the `format: 'cjs'` plugin option._

And you’re up and running! You’ll now have all your design tokens available in Tailwind.

_✨ **Tip**: be sure to rerun `co build` to rebuild your Tailwind preset, or run `co build --watch` to rebuild your tokens every time they change!_

## Publishing to npm

You can publish your preset to npm, and keep it versioned like any of your other dependencies. You can then just consume the preset by passing the npm package name to Tailwind’s `presets` option:

```js
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  presets: ['@my-scope/my-tokens-package'],
};
```

_✨ **Tip**: if publishing to npm, either name your Tailwind preset `./index.js`, or set the `package.json` [main field](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#main) to point directly to `./tailwind-tokens.js`._
