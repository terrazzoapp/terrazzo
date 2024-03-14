---
title: Tailwind CSS Integration
---

# Tailwind CSS Integration

Generate a [Tailwind CSS](https://tailwindcss.com/) preset from your design tokens.

## Setup

::: tip
Make sure you have the [Cobalt CLI](/guides/cli) installed!
:::

Install the plugin from npm

```sh
npm i -D @cobalt-ui/plugin-tailwind
```

Then add to your `tokens.config.mjs` file, configuring [theme](https://tailwindcss.com/docs/configuration#theme) as you would normally, except replacing the values with token IDs:

::: code-group

```js [tokens.config.mjs]
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

:::

Then run:

```sh
npx co build
```

And you’ll generate a `./tokens/tailwind-tokens.js` file. Add it to your Tailwind config [`presets`](https://tailwindcss.com/docs/configuration#presets) and your Tailwind theme now pulls directly from your design tokens:

::: code-group

<!-- prettier-ignore -->
```js [tailwind.config.js]
import tailwindTokens from './tokens/tailwind-tokens.js'; // [!code ++]

/** @type {import('tailwindcss').Config} */
export default {
  presets: [  // [!code ++]
    tailwindTokens, // [!code ++]
  ], // [!code ++]
};
```

:::

::: tip
Be sure to rerun `co build` to rebuild your Tailwind preset, or run `co build --watch` to rebuild your tokens every time they change!

:::

## Automated mapping

Because the Tailwind config is “just JS,” you can automate the mapping by using JS:

::: code-group

```js [tokens.config.mjs]
import pluginTailwind from '@cobalt-ui/plugin-tailwind';

function makeColor(colorName) {
  const output = {};
  for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
    output[step] = [colorName, step].join('.'); // e.g. `color.blue.50`
  }
  return output;
}

/** @type {import('@cobalt-ui/core').Config} */
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

:::

Use this to avoid having to repeat yourself when mapping between dozens (if not hundreds) of your tokens.

## CommonJS

If you’re still using CommonJS (using `require("…")` rather than `import "…"`), make sure to change the `outputFormat` setting to `cjs`:

::: code-group

```js [tokens.config.mjs] {7}
import pluginTailwind from '@cobalt-ui/plugin-tailwind';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  plugins: [
    pluginTailwind({
      outputFormat: 'cjs',
    }),
  ],
};
```

:::

## Using CSS Variables

Because Tailwind lets you use any CSS variables from anywhere, you can use [@cobalt-ui/plugin-css](/integrations/css) to generate these for you. However, you might be using some advanced functionality such as `<alpha-value>` that requires specific color formats. In those cases, you can use plugin-css’ `transform()` option in combination with the fast, accurate, and lightweight [culori](https://culorijs.org/) library to format colors in the desired format:

```sh
npm i -D @cobalt-ui/plugin-css culori
```

::: code-group

```js [tokens.config.js] {12-17}
import pluginCSS from '@cobalt-ui/plugin-css';
import pluginTailwind from '@cobalt-ui/plugin-tailwind';
import * as culori from 'culori';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginTailwind(),
    pluginCSS({
      transform(token) {
        if (token.$type === 'color') {
          const { r, g, b } = culori.rgb(culori.parse(token.$value));
          return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)].join(' ');
        }
      },
    }),
  ],
};
```

:::

This will generate colors like so:

```css
:root {
  --color-blue-1: 251 253 255;
  --color-blue-2: 244 250 255;
  --color-blue-3: 230 244 254;
  --color-blue-4: 213 239 255;
  /* … */
}
```

For more info, see [the docs for plugin-css](/integrations/css).
