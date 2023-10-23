---
title: Tailwind
layout: ../../../layouts/docs.astro
---

# Tailwind

Cobalt integrates fully with TailwindCSS. To start, install the Tailwind plugin and CLI:

```bash
npm install -D @cobalut-ui/plugin-tailwind @cobalt-ui/cli
```

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
  /** @type {import('tailwindcss').Config} */
  export default {
+   presets: ['./tokens/tailwind-tokens.js'],
  };
```

_Note: if using CommonJS, use the `outputFormat: 'cjs'` plugin option._

And you’re up and running! You’ll now have all your design tokens available in Tailwind.

_✨ **Tip**: be sure to rerun `co build` to rebuild your Tailwind preset, or run `co build --watch` to rebuild your tokens every time they change!_
