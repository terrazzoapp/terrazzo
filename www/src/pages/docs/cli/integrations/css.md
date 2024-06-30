---
title: CSS
layout: ../../../../layouts/docs.astro
---

# CSS

Terrazzo’s CSS plugin converts tokens into CSS variables for use in any web application.

## Setup

With your preferred package manager, install the plugin:

:::code-group

```sh [npm]
npm i -D @terrazzo/plugin-css
```

```sh [pnpm]
pnpm i -D @terrazzo/plugin-css
```

:::

And add it to `terrazzo.config.js` under `plugins`:

:::code-group

```js [terrazzo.config.js]
import pluginCSS from "@terrazzo/plugin-css";

/** @type {import("@terrazzo/cli").Config} */
export default {
  plugins: [
    pluginCSS({
      /* options */
    }),
  ],
};
```

:::

Then when you run `tz build` , you’ll output a `tokens/tokens.css` file (unless you renamed it) in your project. Import that anywhere in your project and use the CSS variables like you would normally!

## Usage

This plugin outputs standard CSS variables that correspond directly to your token IDs. Use them as you would any CSS variable:

```css
.button {
  color: var(--color-action-primary);
  font-family: var(--typography-family-default);
  font-size: var(--typography-font-size-200);
}
```

## Features

### CSS Color Module 4 support

This plugin handles [higher-gamut colorspaces](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/color-gamut) P3 and Rec2020 automatically as-needed with no configuration on your part. By default, if all your tokens are in `srgb` color space, they’ll generate as expected. But if you have a color which is out of range for most monitors, e.g.:

```jsonc
{
  "color": {
    "blue": {
      "600": {
        "$type": "color",
        "$value": {
          "colorSpace": "oklch",
          "channels": [0.5618, 0.227, 252.19], // Rec2020 color
        },
      },
    },
  },
}
```

You’d get:

```css
:root {
  --color-blue-600: oklch(0.5618 0.1686 252.19); /* srgb safe color */
}

@media (color-gamut: p3) {
  :root {
    --color-blue-600: oklch(0.5618 0.2171 252.19); /* p3 safe color */
  }
}

@media (color-gamut: rec2020) {
  :root {
    --color-blue-600: oklch(0.5618 0.227 252.19);
  }
}
```

The result is color that “just works” in any browser and hardware type automatically (and, yes, additional code is generated for modes, so this applies for all color modes you’re using!).

This is achieved using the [toGamut() method of Culori](https://culorijs.org/api/#toGamut) which uses the same underlying math as CSS Color Level 4’s [Gamut mapping algorithm](https://drafts.csswg.org/css-color/#css-gamut-mapping) and also described in Björn Ottosen’s [sRGB Gamut Clipping](https://bottosson.github.io/posts/gamutclipping/) article. This produces the best results for most applications on the web, using the best-available color research.

This is an improvement over Cobalt 1.0’s “expand into P3” method that oversaturated sRGB colors automatically unless opting out.

## Config

Configure options in [terrazzo.config.js](/docs/cli/config):

:::code-group

```js [terrazzo.config.js]
import pluginCSS from "@terrazzo/plugin-css";
import { kebabCase } from "scule";

/** @type {import("@terrazzo/cli").Config} */
export default {
  plugins: [
    pluginCSS({
      filename: "tokens.css",
      exclude: [], // ex: ["beta.*"] will exclude all tokens in the "beta" top-level group
      modeSelectors: [
        {
          mode: "light",
          selectors: [
            "@media (prefers-color-scheme: light)",
            '[data-mode="light"]',
          ],
        },
        {
          mode: "dark",
          selectors: [
            "@media (prefers-color-scheme: dark)",
            '[data-mode="dark"]',
          ],
        },
        { mode: "mobile", selectors: ["@media (width < 600px)"] },
        { mode: "desktop", selectors: ["@media (width >= 600px)"] },
        {
          mode: "reduced-motion",
          selectors: ["@media (prefers-reduced-motion)"],
        },
      ],
      variableName: (id) => kebabCase(id),
    }),
  ],
};
```

:::

| Name            | Type                                                           | Description                                                                                                                                      |
| :-------------- | :------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| `filename`      | `string`                                                       | Default filename (default: `"tokens.css"`).                                                                                                      |
| `exclude`       | `string[]`                                                     | Glob pattern(s) of token IDs to exclude.                                                                                                         |
| `modeSelectors` | `ModeSelector[]`                                               | See [modes](#modes).                                                                                                                             |
| `variableName`  | `(id: string) => string`                                       | Function that takes in a token ID and returns a CSS variable name. Use this if you want to prefix your CSS variables, or rename them in any way. |
| `transform`     | `(token: TokenNormalized) => string \| Record<string, string>` | Override certain token values by [transforming them](#transform)                                                                                 |

### Mode Selectors

Mode selectors are the most powerful part of tokens: they let you trigger different values based on any conditions you set.

You configure them by adding a `modeSelectors` array to the CSS options. Every selector needs 2 things:

1. The `mode` you’re targeting (this accepts globs!)
2. The `selectors` that should trigger these modes (takes an array, but can only be 1 item if that’s all you need)

For example, a common pattern for `light` and `dark` mode is:

```js
pluginCSS({
  modeSelectors: [
    {
      mode: "light",
      selectors: [
        "@media (prefers-color-scheme: light)",
        '[data-mode="light"]',
      ],
    },
    {
      mode: "dark",
      selectors: ["@media (prefers-color-scheme: dark)", '[data-mode="dark"]'],
    },
  ],
});
```

This will generate the following CSS:

```css
:root {
  --color-blue-600: #0588f0;
}

@media (prefers-color-scheme: light) {
  :root {
    --color-blue-600: #0588f0;
  }
}

[data-mode="light"] {
  --color-blue-600: #0588f0;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-blue-600: #3b9eff;
  }
}

[data-mode="dark"] {
  --color-blue-600: #3b9eff;
}
```

Now, in your code, whenever you reference `var(--color-blue-600)`, the value will depend on which media query is active, and/or which other selectors apply.

Experiment with `modeSelectors` and you’ll unlock some pretty powerful design system control with minimal configuration!

### transform()

`transform()` is a powerful tool that lets you override certain token values.

Its usage has changed slightly from Cobalt 1.0, because now it must return either a `string` or `Record<string, string>` value:

- `string` values generate one CSS variable, e.g. `--duration-quick: 100ms;`
- `Record<string, string>` generates one CSS variable per-key, e.g. for then token `typography.base` and the keys `fontFamily`, `fontSize`, it would generate:
  ```css
  :root {
    --typography-base-font-family: Inter;
    --typography-base-font-size: 1rem;
  }
  ```

Return `undefined` or `null` to fall back to the plugin’s default transformer (note that `0` and `""` will take). You can also do this per-mode!

```ts
pluginCSS({
  transform: (token, mode) => {
    if (token.id === "token.i.want" && mode === ".") {
      return "my-custom-value"; // generates `--token-i-want: my-custom-value;`
    }
  },
});
```

Some token types, like `typography`, **must return an object** otherwise you’ll get errors.
