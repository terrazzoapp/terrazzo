---
title: CSS
layout: ../../../../layouts/docs.astro
---

# CSS

Convert DTCG tokens into CSS variables for use in any web application or native app with webview. Convert your modes into any CSS selector for complete flexibility.

Use with [plugin-css-in-js](/docs/integrations/css-in-js/) if using a CSS-in-JS library.

## Setup

Requires [Node.js](https://nodejs.org) and [the CLI installed](/docs). With both installed, run:

:::npm

```sh
npm i -D @terrazzo/cli @terrazzo/plugin-css
```

:::

And add it to `terrazzo.config.ts` under `plugins`:

:::code-group

```ts [terrazzo.config.ts]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";

export default defineConfig({
  plugins: [
    css({
      filename: "tokens.css",
      variableName: (token) => token.id.replace(/\./g, "-"),
    }),
  ],
});
```

:::

Lastly, run:

```sh
npx tz build
```

And you’ll output a `tokens/tokens.css` file (unless you renamed it) in your project. Import that anywhere in your project and use the CSS variables like you would normally!

## Usage

This plugin outputs standard CSS variables that correspond directly to your token IDs. Use them as you would any CSS variable:

:::code-group

```css [button.css]
.button {
  color: var(--color-action-primary);
  font-family: var(--typography-family-default);
  font-size: var(--typography-font-size-200);
}
```

:::

### JS

If using a CSS-in-JS library like StyleX, pair this with [plugin-css-in-js](/docs/integrations/css-in-js/) to use the same CSS vars in runtime JS.

:::code-group

```tsx
import stylex from "@stylexjs/stylex";
import { color } from "../tokens/vars.js";

const styles = stylex.create({
  button: {
    background: color.bg.brand,
    color: color.text.onBrand,
  },
});
```

:::

[Full documentation](/docs/integrations/css-in-js/)

## Features

### CSS Color Module 4 support

This plugin lets you pick out-of-band colors in [higher-gamut color spaces](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/color-gamut) like P3 and Rec2020 and automatically downconverts them to displayable colors using media queries. Use the colors you wanna; this plugin will just keep up.

If all your tokens are in the “safe” `srgb` color space, no extra code is generated. But when using colors in the P3 or Rec2020 gamut (or beyond), the CSS plugin automatically downconverts colors so they’re displayable on all hardware:

:::code-group

```jsonc [tokens.json]
{
  "color": {
    "blue": {
      "600": {
        "$type": "color",
        "$value": {
          "colorSpace": "oklch",
          "components": [0.5618, 0.227, 252.19], // Rec2020 color
        },
      },
    },
  },
}
```

```css [tokens/tokens.css]
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

:::

The result is color that “just works” in any browser and hardware type automatically (and, yes, additional code is generated for modes, so this applies for all color modes you’re using!).

#### Color gamut handling

Colors are downconverted using Culori’s [toGamut()](https://culorijs.org/api/#toGamut) method which uses the same underlying math as CSS Color Level 4’s [Gamut mapping algorithm](https://drafts.csswg.org/css-color/#css-gamut-mapping) and also described in Björn Ottosen’s [sRGB Gamut Clipping](https://bottosson.github.io/posts/gamutclipping/) article. This produces the best results for most applications on the web, using the best-available color research.

This is an improvement over Cobalt 1.x’s “expand into P3” method that oversaturated sRGB colors automatically unless opting out.

##### Color depth

By default, Terrazzo rounds colors to [30-bit depth](<https://en.wikipedia.org/wiki/Color_depth#Deep_color_(30-bit)>) (“deep color”). This is mostly a cosmetic thing, and prevents decimal noise in colors. You can change this setting with `colorDepth`:

:::code-group

```ts [terrazzo.config.ts]
export default defineConfig({
  plugins: [
    css({
      colorDepth: 30, // 24, 30, 36, 48, or "unlimited"
    }),
  ],
};
```

:::

### Resolvers

The CSS plugin can map [resolver contexts](/docs/guides/resolvers) into CSS media queries, classnames, or any CSS selector. To get started, add `permutations` which map inputs to CSS selectors:

:::code-group

```diff [terrazzo.config.ts]
  import { defineConfig } from "@terrazzo/cli";
  import css from "@terrazzo/plugin-css";

  export default defineConfig({
    plugins: [
      css({
+       permutations: [
+         {
+           input: {} // default
+           prepare: (css) => `:root {\n  color-scheme: light dark;\n  ${css}\n}`,
+         },
+         {
+           input: { mode: "light" },
+           prepare: (css) => `[data-theme="light"] {\n  color-scheme: light;\n  ${css}}`,
+         },
+         {
+           input: { mode: "dark" },
+           prepare: (css) => `@media (prefers-color-scheme: "dark") {
+   :root {
+     color-scheme: dark;
+     ${css}
+   }
+ }
+
+ [data-theme="dark"] {
+   color-scheme: dark;
+   ${css}
+ }`,
+         },
+         {
+           input: { size: "desktop" },
+           prepare: (css) => `@media (width >= 600px) {\n  :root {\n    ${css}\n  }\n}`,
+         },
+       ],
      }),
    ],
  });
```

:::

Terrazzo will then combine all the permutations in declaration order, into one `.css` file:

```css [tokens/tokens.css]
/* { mode: "light", size: "mobile" } */
:root {
  --color-blue-600: #0588f0;
  --font-size: 0.875rem;
  color-scheme: light;
}

/* { mode: "light" } */
[data-mode="light"] {
  color-scheme: light;
  --color-blue-600: #0588f0;
}

/* { mode: "dark" } */
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --color-blue-600: #3b9eff;
  }
}

/* { mode: "dark" } */
[data-mode="dark"] {
  color-scheme: dark;
  --color-blue-600: #3b9eff;
}

/* { size: "desktop" } */
@media (width >= 600px) {
  --font-size: 1rem;
}
```

:::

Now, in your code, whenever you reference `var(--color-blue-600)`, the value will depend on which media query is active, and/or which other selectors apply.

:::tip

You control the wrapper CSS, so check for mistakes! If using `@media` queries, remember that you’ll need to add a selector within for CSS variables to apply, such as `:root` or `body`.

:::

#### Note on “duplication” (staleness)

If you inspect the output CSS, you may find more variables than expected in the media queries. This is necessary the way CSS works: if a CSS variable is an alias of another, when the base value changes, all aliases must be redeclared otherwise they are referencing the old value in the parent scope. At first glance, this seems like a bug, with variables being redeclared with the same values, but in actuality it’s necessary so your mode selectors cascade correctly.

### Utility CSS

Using the [Tailwind integration](/docs/integrations/tailwind) isn’t necessary if you want to just have utility classes generated from your tokens. You can generate Tailwind-like utility CSS with minimal config.

Rather than scanning your code like Tailwind does, this takes a simpler approach by **requiring you to manually specify your output groups.** This keeps generated CSS minimal while outputting enough for you to handle all your styling needs from your tokens. Add a `utility` option to your config, and specify an object with key–value pairs of `group: tokens`:

:::code-group

```ts [terrazzo.config.ts]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import { kebabCase } from "scule";

export default defineConfig({
  plugins: [
    css({
      utility: {
        bg: ["color.*-bg", "gradient.*"],
        border: ["border.*"],
        font: ["typography.*"],
        layout: ["space.*"],
        shadow: ["shadow.*"],
        text: ["color.*-text", "gradient.*"],
      },
    }),
  ],
});
```

:::

Each of the keys are “groups,” which cut down on total CSS size. For example, consider all the possible ways [dimension tokens](/docs/reference/tokens#dimension) could be used in CSS: `margin`, `padding`, `gap`, `inset`, `font-size`, to name a few! Rather than generate every possible property and every possible token (which would be a ton of CSS), you instead specify which tokens should belong to which groups (and they can belong to multiple).

:::tip

Only specifying the specific groups and tokens you need results in minimal CSS generated.
:::

Group names are predefined, and only the following values are accepted. Each “group” will generate several CSS properties:

#### Border group

The border group accepts [border](/docs/reference/tokens#border) tokens.

| Group name | Class              | CSS                      |
| :--------- | :----------------- | :----------------------- |
| **border** | `.border-*`        | `border: [value]`        |
|            | `.border-top-*`    | `border-top: [value]`    |
|            | `.border-right-*`  | `border-right: [value]`  |
|            | `.border-bottom-*` | `border-bottom: [value]` |
|            | `.border-left-*`   | `border-left: [value]`   |

#### Color groups

The color groups of `bg` and `text` accept [color](/docs/reference/tokens#color) and [gradient](/docs/reference/tokens#gradient) tokens.

| Group name | Class     | CSS                         |
| :--------- | :-------- | :-------------------------- |
| **bg**     | `.bg-*`   | `background-color: [value]` |
| **text**   | `.text-*` | `color: [value]`            |

:::tip

Improve your contrast by being more selective with what colors are allowed as background, and which as text colors (e.g. `bg: ["color.*-bg"]`). This can save lots of headaches when enforcing proper contrast!

:::

#### Font group

The font group accepts [font family](/docs/reference/tokens#font-size), [dimension](/docs/reference/tokens#dimension) (font size), [font weight](/docs/reference/tokens#font-weight), and [typography](/docs/reference/tokens#typography) tokens.

| Group name | Class     | CSS                                                                        |
| :--------- | :-------- | :------------------------------------------------------------------------- |
| **font**   | `.font-*` | (all properties of [Typography](/docs/reference/tokens#typography) tokens) |

:::note

The `.font-*` group is the most flexible! Be sure to pay attention to your token naming structure.

:::

#### Layout group

The layout group accepts [dimension](/docs/reference/tokens#dimension) tokens.

| Group name | Class        | CSS                                             |
| :--------- | :----------- | :---------------------------------------------- |
| **layout** | `.gap-*`     | `gap: [value]`                                  |
|            | `.gap-col-*` | `column-gap: [value]`                           |
|            | `.gap-row-*` | `row-gap: [value]`                              |
|            | `.mt-*`      | `margin-top: [value]`                           |
|            | `.mr-*`      | `margin-right: [value]`                         |
|            | `.mb-*`      | `margin-bottom: [value]`                        |
|            | `.ml-*`      | `margin-left: [value]`                          |
|            | `.ms-*`      | `margin-inline-start: [value]`                  |
|            | `.me-*`      | `margin-inline-end: [value]`                    |
|            | `.mx-*`      | `margin-left: [value]; margin-right: [value]`   |
|            | `.my-*`      | `margin-top: [value]; margin-bottom: [value]`   |
|            | `.ma-*`      | `margin: [value]`                               |
|            | `.pt-*`      | `padding-top: [value]`                          |
|            | `.pr-*`      | `padding-right: [value]`                        |
|            | `.pb-*`      | `padding-bottom: [value]`                       |
|            | `.pl-*`      | `padding-left: [value]`                         |
|            | `.px-*`      | `padding-left: [value]; padding-right: [value]` |
|            | `.py-*`      | `padding-top: [value]; padding-bottom: [value]` |
|            | `.pa-*`      | `padding: [value]`                              |

#### Shadow group

The shadow group accepts [shadow tokens](/docs/reference/tokens#shadow).

| Group name | Class       | CSS                   |
| :--------- | :---------- | :-------------------- |
| **shadow** | `.shadow-*` | `box-shadow: [value]` |

:::note

All shadows will be interpreted as `linear-gradient()`s.

:::

#### Differences from Tailwind

While the general philosophy is similar to Tailwind, this approach differs:

- **In naming.** This plugin doesn’t map 1:1 with Tailwind names; it basically keeps your token names as-is and merely prefixes them. This results in a closer 1:1 mapping to your original design token names.
- **In mode support.** This takes advantage of your [mode selectors](#mode-selectors) which need less configuration if modes are defined in `tokens.json`.
- **In simplicity.** No code scanning is needed, and no heavy dependencies of PostCSS are needed. It generates only what you tell it to from your tokens.

## Config

Configure options in [terrazzo.config.ts](/docs/reference/config):

:::code-group

```ts [terrazzo.config.ts]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import { kebabCase } from "scule";

export default defineConfig({
  plugins: [
    css({
      filename: "tokens.css",
      permutations: [
        {
          prepare: (css) => `:root {\n  ${css}\n}`,
          input: { size: "mobile" },
        },
        {
          prepare: (css) => `[data-theme="light"] {\n  ${css}\n}`,
          input: { theme: "light" },
        },
        {
          prepare: (css) =>
            `@media (prefers-color-scheme: dark) {\n  :root {\n    ${css}\n  }\n}`,
          input: { theme: "dark" },
        },
        {
          prepare: (css) => `[data-theme="dark"] {\n  ${css}\n}`,
          input: { theme: "dark" },
        },
        {
          prepare: (css) =>
            `@media (width >= 600px) {\n  :root {\n    ${css}\n  }\n}`,
          input: { size: "desktop" },
        },
        {
          prepare: (css) =>
            `@media (prefers-reduced-motion) {\n  :root {\n    ${css}\n  }\n}`,
          input: { motion: "reduced-motion" },
        },
      ],
      variableName: (token) => kebabCase(token.id),
    }),
  ],
});
```

:::

| Name           | Type                                                           | Description                                                                                                                                                     |
| :------------- | :------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filename`     | `string`                                                       | Filename to generate (default: `"tokens.css"`).                                                                                                                 |
| `exclude`      | `string[]`                                                     | Glob pattern(s) of token IDs to exclude.                                                                                                                        |
| `permutations` | `Permutation[]`                                                | See [resolvers](#resolvers).                                                                                                                                    |
| `variableName` | `(token: TokenNormalized) => string`                           | Function that takes in a token ID and returns a CSS variable name. Use this if you want to prefix your CSS variables, or rename them in any way.                |
| `transform`    | `(token: TokenNormalized) => string \| Record<string, string>` | Override certain token values by [transforming them](#transform)                                                                                                |
| `utility`      | [Utility CSS mapping](#utility-css)                            | Generate Utility CSS from your tokens ([docs](#utility-css)                                                                                                     |
| `legacyHex`    | `boolean`                                                      | Output colors as hex-6/hex-8 instead of [color() function](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color)                                  |
| `skipBuild`    | `boolean`                                                      | Skip generating any `.css` files (useful if you are consuming values in your own plugin and don’t need any `.css` files written to disk).                       |
| `colorDepth`   | `24 \| 30 \| 36 \| 48 \| 'unlimited'`                          | When [downsampling colors](#color-gamut-handling), handle [color bit depth](https://en.wikipedia.org/wiki/Color_depth). _Default: `30` (10 bits per component)_ |

### transform()

`transform()` is a powerful tool that lets you override certain token values.

:::code-group

```ts [terrazzo.config.ts]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";

export default defineConfig({
  plugins: [
    css({
      transform(token, mode) {
        if (token.id === "token.i.want" && mode === ".") {
          return "my-custom-value"; // generates `--token-i-want: my-custom-value;`
        }
      },
    }),
  ],
});
```

:::

Its usage has changed slightly from Cobalt 1.x, because now it must return either a `string` or `Record<string, string>` value ([docs](/docs/reference/plugin-api)):

- Return a string to generate a single variable, e.g.
  ```css
  :root {
    --duration-quick: 100ms;
  }
  ```
- Return an object of strings to generate multiple variables, e.g. for then token `typography.base` and the keys `fontFamily`, `fontSize`, it would generate:
  ```css
  :root {
    --typography-base-font-family: Inter;
    --typography-base-font-size: 1rem;
  }
  ```
- Return `undefined` or `null` to fall back to the plugin’s default transformer (note that `0` and `""` will take). You can also do this per-mode!

:::warning

Some token types that require multiple values (like [typography](/docs/reference/tokens#typography)) must return an object.

:::
