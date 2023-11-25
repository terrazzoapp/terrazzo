---
title: CSS Integration
---

# CSS Integration

Generate CSS variables from your Design Tokens Format Module (DTFM) tokens.

This plugin generates CSS variables for dynamic, flexible theming that supports modes and gives you the full range of what CSS can do.

## Setup

::: tip

Make sure you have the [Cobalt CLI](/guides/cli) installed!

:::

Install the plugin:

```sh
npm i -D @cobalt-ui/plugin-css
```

Then add to your `tokens.config.mjs` file:

::: code-group

```js [tokens.config.mjs]
import pluginCSS from '@cobalt-ui/plugin-css'; // [!code ++]

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [pluginCSS()], // [!code ++]
};
```

:::

And run:

```sh
npx co build
```

You’ll then get a `./tokens/tokens.css` file with [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) for you to use anywhere in your app:

::: code-group

```css [./tokens/tokens.css]
:root {
  --color-blue: #0969da;
  --color-green: #2da44e;
  --color-red: #cf222e;
  --color-black: #101010;
  --color-ui-text: var(--color-black);
}
```

:::

## Config

Here are all plugin options, along with their default values

::: code-group

```js [tokens.config.mjs]
import pluginCSS from '@cobalt-ui/plugin-css';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginCSS({
      /** set the filename inside outDir */
      filename: './tokens.css',
      /** create selector wrappers around modes */
      modeSelectors: [
        // …
      ],
      /** embed file tokens? */
      embedFiles: false,
      /** (optional) transform specific token values */
      transform: () => null,
      /** (deprecated, use generateName instead) add custom namespace to CSS vars */
      prefix: '',
      /** enable P3 support? */
      p3: true,
      /** normalize all colors */
      colorFormat: 'hex',
      /** used to generate the name of each CSS variable */
      generateName: defaultNameGenerator,
    }),
  ],
};
```

:::

### VS Code Autocomplete

If your tokens are saved locally (by default in `src/tokens/tokens.css`), VS Code will automatically pick up on this file and allow autocompletions. However, if you’re publishing your package to npm, it will ignore `node_modules`. The [CSS Variable Autocomplete](https://marketplace.visualstudio.com/items?itemName=vunguyentuan.vscode-css-variables) extension lets you add additional files for autocompletion.

## Utility CSS

By default, this plugin will **only generate CSS variables**. But if you’d also like to generate lightweight utility CSS classes from your tokens a la Tailwind or Bootstrap Utility CSS, you can opt in with the `utility` option. The resulting CSS is minimal in size, and only generates what you request:

```js
pluginCSS({
  utility: {
    tokens: ['border.*', 'color.*', 'spacing.*', 'typography.*'],
  },
});
```

::: tip

If you want to generate all utility CSS, you can specify `tokens: ['*']`. Just watch your CSS size!

:::

```css
/* Color example: color.base.blue.500 */
.text-base-blue-500 {
  color: var(--color-base-blue-500);
}
.bg-base-blue-500 {
  background-color: var(--color-base-blue-500);
}

/* Spacing example: space.1 */
.ma-1 {
  margin: var(--space-1);
}
.mt-1 {
  margin-top: var(--space-1);
}
.mr-1 {
  margin-right: var(--space-1);
}
.mx-1 {
  margin-left: var(--space-1);
  margin-right: var(--space-1);
}
/* .p-* and .space-* utilities truncated for brevity … */

/* Typography example: typography.base */
.typography-base {
  font-family: var(--typography-family-base);
  font-size: var(--typography-base-font-size);
  font-style: var(--typography-base-font-style);
  font-weight: var(--typography-base-font-weight);
  line-height: var(--typography-base-line-height);
}
```

How it works is it **automatically generates CSS based on the [token type](https://cobalt-ui.pages.dev/docs/tokens).** Because there’s information about the type of token you’re using, it knows how to generate the resulting CSS (in fact, it will just use the variables it generated).

It will also **preserve your full token IDs** so there’s no documentation needed—just use your design system!

| Token Type   | Generated CSS                                                                 |
| :----------- | :---------------------------------------------------------------------------- |
| `color`      | `.text-*` (text color) `.bg-*` (background color), `.border-*` (border color) |
| `dimension`  | `.m-*` (margin)\*, `.p-*` (padding)\*, `.space-*` (space-between)\*           |
| `fontWeight` | `.font-weight-*` (font weight)                                                |
| `transition` | `.transition-*` (transition), `.animation-*` (animation)                      |
| `typography` | `.typography-*` (all Typographic styles)                                      |

_\*Unless specifically identified as a `border` or `font`-type dimension (see below)_

#### Dimension Overrides (Border, Font)

[Dimension tokens](https://cobalt-ui.pages.dev/docs/tokens/#dimension) are special in that you can use them for spacing, border size, font size—so many things! So if you don’t want a dimension to be treated as **spacing** (default), you can convert it to a more helpful semantic utility via `overrides.dimension`:

```js
pluginCSS({
  utility: {
    tokens: ['border.*', 'typography.*'],
    overrides: {
      /** (optional) distinguish border CSS */
      border: {
        radius: ['border.radius.*'],
        width: ['border.width.*'],
      },
      /** (optional) distinguish font CSS */
      font: {
        size: ['typography.size.*'],
      },
    },
  },
});
```

| Override name   | Generated CSS                    |
| :-------------- | :------------------------------- |
| `border.radius` | `.rounded-*` (border radius)     |
| `border.width`  | `.border-width-*` (border width) |
| `font.size`     | `.font-size-*` (font size)       |

Currently, `dimension` is the only token that can be overridden, but more may be added as this tool expands.

#### Comparison to Tailwind

This plugin’s utility CSS can be used **in place of Tailwind,** and probably works best if the project isn’t based on Tailwind. It’s simply a lighter-weight way of using your design tokens directly in CSS. For comparison:

- ✅ **It respects dynamic vars.** The generated utility CSS references core vars, which means all your modes and [Mode Selectors](#mode-selectors) are preserved, and all the dynamism of your variables are kept.
- ✅ **Direct 1:1 mapping with tokens**. There’s no additional translation layer, or renaming into Tailwind. This just references your tokens as you’ve named them (with the only learning curve being familiarizing yourself with a few prefixes).
- ✅ **No additional build step or dependencies.** Utility CSS gets generated along with the rest of your DS code, without any additional setup.
- ✅ **No code scanning.** You only generate what you need, so no need to scan your code.
- ❌ **No automatic treeshaking.** Conversely, you control everything in the config, so you’ll have to configure for yourself how much CSS to generate from your DS (for most DSs it’s a negligible amount of CSS, however, huge DSs may need to be more selective).

If you are already using Tailwind in your project, you may find the [Tailwind Plugin](https://cobalt-ui.pages.dev/docs/integrations/tailwind/) more useful.

### Generate name

Use the `generateName()` option to customize the naming of CSS tokens, such as adding prefixes/suffixes, or just changing how the default variable naming works in general.

#### Default naming

By default, Cobalt takes your dot-separated token IDs and…

- Removes leading and trailing whitespace from each group or token name in an ID
- camelCases any group or token name that has a space in the middle of it
- Joins the normalized segments together with a single dashes

#### Custom naming

To override specific or all CSS variable names yourself, use the `generateName()` option:

::: code-group

```js [tokens.config.mjs]
import pluginCSS from '@cobalt-ui/plugin-css';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginCSS({
      generateName(variableId, token) {
        if (variableId === 'my.special.token') {
          return 'SUPER_IMPORTANT_VARIABLE';
        }
        // if nothing returned, fall back to default behavior
      },
    }),
  ],
};
```

:::

A couple things to be aware of:

- `token` can be `undefined` in rare cases
  - This occurs when a token references another token that is not defined. Currently, this is not explicitly disallowed by the design tokens specification.
- `variableId` may not be a 1:1 match with the `token.id`
  - For example, each property in a composite token will have its own variable generated, so those `variableId`s will include the property name. In most cases you should use `variableId` rather than `token.id`.
- The string returned does not need to be prefixed with `--`, Cobalt will take care of that for you

## Modes

To generate CSS for Modes, add a `modeSelectors` array to your config that specifies the **mode** you’d like to target and which **CSS selectors** should activate those modes (can either be one or multiple). You may optionally also decide to include or exclude certain tokens (e.g. `color.*` will only target the tokens that begin with `color.`).

::: code-group

```js [tokens.config.mjs]
import css from '@cobalt-ui/plugin-css';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    css({
      modeSelectors: [
        {
          mode: 'light', // match all tokens with $extensions.mode.light
          selectors: ['@media (prefers-color-scheme: light)', '[data-color-mode="light"]'], // the following CSS selectors trigger the mode swap
          tokens: ['color.*'], // (optional) limit to specific tokens, if desired (by default any tokens with this mode will be included)
        },
        {
          mode: 'dark',
          selectors: ['@media (prefers-color-scheme: dark)', '[data-color-mode="dark"]'],
          tokens: ['color.*'],
        },
        {
          mode: 'reduced',
          selectors: ['@media (prefers-reduced-motion)'],
        },
      ],
    }),
  ],
};
```

:::

This would generate the following CSS:

```css
:root {
  /* all default token values (ignoring modes) */
}

@media (prefers-color-scheme: light) {
  :root {
    /* all `light` mode values for color.* tokens */
  }
}

[data-color-mode='light'] {
  /* (same) */
}

/* dark theme colors */
@media (prefers-color-scheme: dark) {
  :root {
    /* all `dark` mode values for color.* tokens */
  }
}

[data-color-mode='dark'] {
  /* (same) */
}

@media (prefers-reduced-motion) {
  :root {
    /* all `reduced` mode values for any token */
  }
}
```

In our example the `@media` selectors would automatically pick up whether a user’s OS is in light or dark mode. But as a fallback, you could also manually set `data-color-mode="[mode]"` on any element override the default (e.g. for user preferences, or even previewing one theme in the context of another).

Further, any valid CSS selector can be used (that’s why it’s called `modeSelectors` and not `modeClasses`)! You could also generate CSS if your `typography.size` group had `desktop` and `mobile` sizes:

::: code-group

```js [tokens.config.mjs]
import css from '@cobalt-ui/plugin-css';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    css({
      modeSelectors: [
        {mode: 'mobile', tokens: ['typography.size.*'], selectors: ['@media (width < 600px)']},
        {mode: 'desktop', tokens: ['typography.size.*'], selectors: ['@media (width >= 600px)']},
      ],
    }),
  ],
};
```

:::

That will generate the following:

```css
:root {
  /* all tokens (defaults) */
}

@media (width < 600px) {
  :root {
    /* `mobile` mode values for `typography.size.*` tokens */
  }
}

@media (width >= 600px) {
  :root {
    /* `desktop` mode values for `typography.size.*` tokens */
  }
}
```

[Learn more about modes](/guides/modes)

## Transform

Inside plugin options, you can specify an optional `transform()` function.

::: code-group

```js [tokens.config.mjs] {7-13}
/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginCSS({
      transform(token, mode) {
        const oldFont = 'sans-serif';
        const newFont = 'Custom Sans';
        if (token.$type === 'fontFamily') {
          return token.$value.map((value) => (value === oldFont ? newFont : value));
        }
      },
    }),
  ],
};
```

:::

Your transform will only take place if you return a truthy value, otherwise the default transformer will take place.

### Custom tokens

If you have your own custom token type, e.g. `my-custom-type`, you’ll have to handle it within `transform()`:

::: code-group

```js [tokens.config.mjs] {8-13}
/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginCSS({
      transform(token, mode) {
        switch (token.$type) {
          case 'my-custom-type': {
            return String(token.$value);
            break;
          }
        }
      },
    }),
  ],
};
```

:::

## Special behavior

Helpful information for @cobalt-ui/plugin-css’ handling of specific token types.

### Color tokens

::: code-group

```js [tokens.config.mjs] {5}
/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    pluginCSS({
      colorFormat: 'oklch',
    }),
  ],
};
```

:::

By specifying a `colorFormat`, you can transform all your colors to [any browser-supported colorspace](https://www.w3.org/TR/css-color-4/). Any of the following colorspaces are accepted:

- [hex](https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color) (default)
- [rgb](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/rgb)
- [hsl](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl)
- [hwb](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hwb)
- [lab](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/lab)
- [lch](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/lch)
- [oklab](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklab)
- [oklch](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch)
- [p3](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color)
- [srgb-linear](https://developer.mozilla.org/en-US/docs/Web/CSS/color-interpolation-method)
- [xyz-d50](https://developer.mozilla.org/en-US/docs/Web/CSS/color-interpolation-method)
- [xyz-d65](https://developer.mozilla.org/en-US/docs/Web/CSS/color-interpolation-method)

If you are unfamiliar with these colorspaces, the default `hex` value is best for most users (though [you should use OKLCH to define your colors](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)).

### Link tokens

Say you have [Link tokens](/tokens/link) in your `tokens.json`:

::: code-group

```json [JSON]
{
  "icon": {
    "alert": {
      "$type": "link",
      "$value": "./icon/alert.svg"
    }
  }
}
```

```yaml [YAML]
icon:
  alert:
    $type: link
    value: ./icon/alert.svg
```

:::

By default, consuming those will print values as-is:

```css
:root {
  --icon-alert: url('./icon/alert.svg');
}

.icon-alert {
  background-image: var(--icon-alert);
}
```

In some scenarios this is preferable, but in others, this may result in too many requests and may result in degraded performance. You can set `embedFiles: true` to generate the following instead:

```css
:root {
  --icon-alert: url('image/svg+xml;utf8,<svg …></svg>');
}

.icon-alert {
  background-image: var(--icon-alert);
}
```

::: tip

The CSS plugin uses [SVGO](https://github.com/svg/svgo) to optimize SVGs at lossless quality. However, raster images won’t be optimized so quality isn’t degraded.

:::

[Read more about the advantages to inlining files](https://css-tricks.com/data-uris/)

## Sass interop

If you’re using Sass in your project, you can load this plugin through [@cobalt-ui/plugin-sass](/integrations/sass), which gives you all the benefits of this plugin plus Sass’ typechecking (the Sass plugin’s normal Sass vars will be swapped for CSS vars, but it will still error on any mistyped tokens).

To use this, replace this plugin with @cobalt-ui/plugin-sass in `tokens.config.mjs` and move your options into the `pluginCSS: {}` option:

::: code-group

<!-- prettier-ignore -->
```js [tokens.config.mjs]
import pluginCSS from '@cobalt-ui/plugin-css'; // [!code --]
import pluginSass from '@cobalt-ui/plugin-sass'; // [!code ++]

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginCSS({filename: 'tokens.css'}), // [!code --]
    pluginSass({ // [!code ++]
      pluginCSS: {filename: 'tokens.css'}, // [!code ++]
    }), // [!code ++]
  ],
};
```

:::

To learn more, [read the docs](/integrations/sass).
