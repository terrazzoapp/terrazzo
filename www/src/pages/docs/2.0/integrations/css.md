---
title: CSS
layout: ../../../../layouts/docs.astro
---

# CSS

Convert DTCG tokens into CSS variables for use in any web application or native app with webview. Convert your modes into any CSS selector for complete flexibility.

## Setup

Requires [Node.js 20 or later](https://nodejs.org) and [the CLI installed](/docs). With both installed, run:

:::npm

```sh
npm i -D @terrazzo/cli @terrazzo/plugin-css
```

:::

And add it to `terrazzo.config.js` under `plugins`:

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";
import pluginCSS from "@terrazzo/plugin-css";

export default defineConfig({
  plugins: [
    pluginCSS({
      filename: "tokens.css",
      variableName: (id) => id.replace(/\./g, "-"),
      baseSelector: ":root",
      baseScheme: "light dark", // Optional: support both light and dark themes
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

```js [terrazzo.config.js]
export default defineConfig({
  plugins: [
    css({
      colorDepth: 30, // 24, 30, 36, 48, or "unlimited"
    }),
  ],
};
```

:::

### Dynamic mode handling

Variable modes can be tricky! That’s why Terrazzo redeclares all aliases in CSS whenever their upstream values change. For example:

```diff
  :root {
    --neutral-3: #e6eaef;
    --color-bg-alt: var(--neutral-3);
  }

  [data-theme='dark'] {
    --neutral-3: #212830;
+   --color-bg-alt: var(--neutral-3);
  }
```

Whenever any value updates, so, too must all its aliases. Terrazzo correctly implements this behavior in CSS so your values are always correct when changing modes.

[See example](https://codepen.io/dangodev/pen/EaaeELN).

### Utility CSS

Using the [Tailwind integration](/docs/integrations/tailwind) isn’t necessary if you want to just have utility classes generated from your tokens. You can generate Tailwind-like utility CSS with minimal config.

Rather than scanning your code like Tailwind does, this takes a simpler approach by **requiring you to manually specify your output groups.** This keeps generated CSS minimal while outputting enough for you to handle all your styling needs from your tokens. Add a `utility` option to your config, and specify an object with key–value pairs of `group: tokens`:

:::code-group

```js [terrazzo.config.js]
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

Configure options in [terrazzo.config.js](/docs/reference/config):

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import { kebabCase } from "scule";

export default defineConfig({
  plugins: [
    css({
      filename: "tokens.css",
      exclude: [], // ex: ["beta.*"] will exclude all tokens in the "beta" top-level group
      baseScheme: "light dark", // Optional: set base color-scheme
      modeSelectors: [
        {
          mode: "light",
          selectors: [
            "@media (prefers-color-scheme: light)",
            '[data-mode="light"]',
          ],
          scheme: "light", // Optional: set color-scheme for this mode
        },
        {
          mode: "dark",
          selectors: [
            "@media (prefers-color-scheme: dark)",
            '[data-mode="dark"]',
          ],
          scheme: "dark", // Optional: set color-scheme for this mode
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
});
```

:::

| Name            | Type                                                           | Description                                                                                                                                                     |
| :-------------- | :------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `filename`      | `string`                                                       | Filename to generate (default: `"tokens.css"`).                                                                                                                 |
| `exclude`       | `string[]`                                                     | Glob pattern(s) of token IDs to exclude.                                                                                                                        |
| `modeSelectors` | `ModeSelector[]`                                               | See [modes](#modes).                                                                                                                                            |
| `variableName`  | `(id: string) => string`                                       | Function that takes in a token ID and returns a CSS variable name. Use this if you want to prefix your CSS variables, or rename them in any way.                |
| `transform`     | `(token: TokenNormalized) => string \| Record<string, string>` | Override certain token values by [transforming them](#transform)                                                                                                |
| `utility`       | [Utility CSS mapping](#utility-css)                            | Generate Utility CSS from your tokens ([docs](#utility-css)                                                                                                     |
| `legacyHex`     | `boolean`                                                      | Output colors as hex-6/hex-8 instead of [color() function](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color)                                  |
| `skipBuild`     | `boolean`                                                      | Skip generating any `.css` files (useful if you are consuming values in your own plugin and don’t need any `.css` files written to disk).                       |
| `baseSelector`  | `string`                                                       | Specifies the selector where CSS variables are defined (e.g., `:root`, `:host`, or a custom selector). Defaults to `:root`.                                     |
| `baseScheme`    | `string`                                                       | Sets the CSS `color-scheme` property on the base selector (e.g., `"light"`, `"dark"`, or `"light dark"`). See [Color Scheme](#color-scheme).                    |
| `colorDepth`    | `24 \| 30 \| 36 \| 48 \| 'unlimited'`                          | When [downsampling colors](#color-gamut-handling), handle [color bit depth](https://en.wikipedia.org/wiki/Color_depth). _Default: `30` (10 bits per component)_ |

### Mode Selectors

Mode selectors is the most powerful feature of the CSS plugin. It lets you convert your token [modes](/docs/guides/modes) into CSS media queries, classnames, or any CSS selector. To start, add a `modeSelectors` array to the CSS options. Every entry needs 2 things:

1. The `mode` you're targeting (this accepts globs, e.g. `"*-light"`!)
2. The CSS `selectors` that enable these modes

You can also optionally specify a `scheme` to automatically set the CSS `color-scheme` property for each mode selector (see [Color Scheme](#color-scheme)).

For example, a common pattern for `light` and `dark` mode, with the following config, will generate the respective CSS:

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";

export default defineConfig({
  plugins: [
    css({
      modeSelectors: [
        {
          mode: "light",
          selectors: [
            "@media (prefers-color-scheme: light)",
            '[data-mode="light"]',
          ],
          scheme: "light", // Optional: set color-scheme for light mode
        },
        {
          mode: "dark",
          selectors: [
            "@media (prefers-color-scheme: dark)",
            '[data-mode="dark"]',
          ],
          scheme: "dark", // Optional: set color-scheme for dark mode
        },
      ],
    }),
  ],
});
```

```css [tokens/tokens.css]
:root {
  --color-blue-600: #0588f0;
}

@media (prefers-color-scheme: light) {
  :root {
    color-scheme: light;
    --color-blue-600: #0588f0;
  }
}

[data-mode="light"] {
  color-scheme: light;
  --color-blue-600: #0588f0;
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --color-blue-600: #3b9eff;
  }
}

[data-mode="dark"] {
  color-scheme: dark;
  --color-blue-600: #3b9eff;
}
```

:::

Now, in your code, whenever you reference `var(--color-blue-600)`, the value will depend on which media query is active, and/or which other selectors apply.

:::tip

The sky is the limit with mode selectors, but some popular patterns are:

- `color`: [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme), [prefers-contrast](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast)
- `duration`: [prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- `typography`: viewport width (responsive styles)

:::

### Color Scheme

The CSS plugin supports automatically generating the [`color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) property to help browsers respect users' prefered color schemes. This feature works with both the base selector and individual mode selectors.

#### Base Color Scheme

Use the `baseScheme` option to set a color-scheme on your base selector (typically `:root`):

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";

export default defineConfig({
  plugins: [
    css({
      baseScheme: "light dark", // Supports both light and dark
      // ... other options
    }),
  ],
});
```

```css [tokens/tokens.css]
:root {
  color-scheme: light dark;
  --color-bg: #ffffff;
  --color-text: #000000;
  /* ... other variables */
}
```

:::

#### Per-Mode Color Schemes

For more granular control, specify a `scheme` for individual mode selectors:

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";

export default defineConfig({
  plugins: [
    css({
      baseScheme: "light dark",
      modeSelectors: [
        {
          mode: "light",
          selectors: [
            "@media (prefers-color-scheme: light)",
            '[data-theme="light"]',
          ],
          scheme: "light", // Forces light color scheme
        },
        {
          mode: "dark",
          selectors: [
            "@media (prefers-color-scheme: dark)",
            '[data-theme="dark"]',
          ],
          scheme: "dark", // Forces dark color scheme
        },
      ],
    }),
  ],
});
```

```css [tokens/tokens.css]
:root {
  color-scheme: light dark;
  --color-bg: #ffffff;
}

@media (prefers-color-scheme: light) {
  :root {
    color-scheme: light;
    --color-bg: #ffffff;
  }
}

[data-theme="light"] {
  color-scheme: light;
  --color-bg: #ffffff;
}

@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;
    --color-bg: #1a1a1a;
  }
}

[data-theme="dark"] {
  color-scheme: dark;
  --color-bg: #1a1a1a;
}
```

:::

The `color-scheme` property helps browsers:

- Optimize form controls and scrollbars for the specified theme
- Apply appropriate default styling for UI elements
- Provide better accessibility and user experience

You can use any valid [`color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme) values:

- `"light"` - Light theme only
- `"dark"` - Dark theme only
- `"light dark"` - Support both with light as default
- `"dark light"` - Support both with dark as default

### transform()

`transform()` is a powerful tool that lets you override certain token values.

:::code-group

```js [terrazzo.config.js]
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

Some token types that require multiple values (like [typography](http://localhost:4321/docs/reference/tokens#typography)) must return an object.

:::

## Migrating from Cobalt 1.x

For the most part, the 2.x version doesn’t have significant breaking changes and only improvements. But you’ll find the following minor differences:

- sRGB colors don’t automatically expand into P3, which resulted in oversaturated (and innaccurate) colors. See [CSS Color Module 4 Support](#css-color-module-4-support) for more details
- The mode alias `#` character (`{color.base.blue.600#dark}`) has been deprecated (because it generated unpredictable CSS)
- Colors now use [the `color()` function](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color) so that it’s future-proof (supports deep color, wide color gamuts, and is overall a more future-friendly standard) while still maintaining good support (all modern browsers have great support).
