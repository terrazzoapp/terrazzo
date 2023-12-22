# @cobalt-ui/plugin-tailwind

Generate a [Tailwind CSS](https://tailwindcss.com/) preset from your design tokens.

## Setup

Install the plugin from npm

```bash
npm i -D @cobalt-ui/plugin-tailwind
```

Then add to your `tokens.config.mjs` file, configuring [theme](https://tailwindcss.com/docs/configuration#theme) as you would normally, except replacing the values with token IDs:

```js
// tokens.config.mjs
import pluginTailwind from '@cobalt-ui/plugin-tailwind';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  plugins: [
    pluginTailwind({
      /** (optional) the path to the Tailwind preset */
      output?: './tailwind-tokens.js',
      /** (optional) module format to use (to match your Tailwind config) */
      outputFormat?: 'esm' | 'cjs',
      tailwind: {
        theme: {
          /** @see https://tailwindcss.com/docs/configuration#theme */
          colors: {
            blue: {
              100: 'color.blue.100',
              200: 'color.blue.200',
              // …
            },
          },
          fontFamily: {
            sans: 'typography.family.base',
            // …
          },
          extend: {
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
      },
    }),
  ],
};
```

Then run:

```sh
npx co build
```

And you’ll generate a `./tokens/tailwind-tokens.js` file. Add it to your Tailwind config [`presets`](https://tailwindcss.com/docs/configuration#presets) and your Tailwind theme now pulls directly from your design tokens:

```diff
+ import tailwindTokens from './tokens/tailwind-tokens.js';

  /** @type {import('tailwindcss').Config} */
  export default {
+   presets: [
+     tailwindTokens,
+   ],
  };
```

_✨ **Tip**: be sure to rerun `co build` to rebuild your Tailwind preset, or run `co build --watch` to rebuild your tokens every time they change!_

## Docs

[View the full documentation](https://cobalt-ui.pages.dev/integrations/tailwind)
