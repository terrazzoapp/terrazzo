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

/** @type import('@cobalt-ui/core').Config */
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

Then, when you run `co build` in your project, it will generate a `./tokens/tailwind-tokens.js` file. Now add it to your Tailwind config under `presets` ([docs](https://tailwindcss.com/docs/configuration#presets)):

```diff
+ import tailwindTokens from './tokens/tailwind-tokens.js';

  /** @type {import('tailwindcss').Config} */
  export default {
+   presets: [
+     tailwindTokens,
+   ],
  };
```

_Note: if using CommonJS, use the `outputFormat: 'cjs'` plugin option._

And you’re up and running! You’ll now have all your design tokens available in Tailwind.

_✨ **Tip**: be sure to rerun `co build` to rebuild your Tailwind preset, or run `co build --watch` to rebuild your tokens every time they change!_

### Dynamic values

Because the Tailwind config is just JS, you can generate dynamic values like so:

```js
// tokens.config.mjs
import pluginTailwind from '@cobalt-ui/plugin-tailwind';

function makeColor(colorName) {
  const output = {};
  for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
    output[step] = [colorName, step].join('.'); // e.g. `color.blue.50`
  }
  return output;
}

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginTailwind({
      tailwind: {
        theme: {
          colors: {
            blue: makeColor('color.blue'), // { 50: 'color.blue.50', 100: 'color.blue.100', … }
            green: makeColor('color.green'), // { 50: 'color.green.50', 100: 'color.green.100', … }
            // …
          },
        },
      },
    }),
  ],
};
```
