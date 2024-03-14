---
title: CSS Integration
---

# CSS Integration

Generate CSS variables from your Design Tokens Community Group (DTCG) tokens.

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

/** @type {import('@cobalt-ui/core').Config} */
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

/** @type {import('@cobalt-ui/core').Config} */
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

By default, this plugin will **only generate CSS variables**. To generate some lightweight utility CSS classes from your tokens _a la_ Tailwind or Bootstrap Utility CSS, specify a `utility` object to enable the types of utility classes you’d like to generate.

By default, **all groups are off**. to generate a group, pass its name as the key, along with an array of **token selectors** (wildcards) to match tokens. For example, the following config:

```js
pluginCSS({
  utility: {
    bg: ['color.semantic.*'],
    text: ['color.semantic.*'],
    margin: ['space.*'],
  },
});
```

…will generate the following CSS:

```css
.bg-primary {
  background-color: var(--color-semantic-primary);
}
.bg-secondary {
  background-color: var(--color-semantic-secondary);
}
.text-primary {
  color: var(--color-semantic-primary);
}
.text-secondary {
  color: var(--color-semantic-secondary);
}
.mt-1 {
  margin-top: 0.25rem;
}
.mr-1 {
  margin-right: 0.25rem;
}
.mb-1 {
  margin-bottom: 0.25rem;
}
/* … */
```

Here are all the groups available, along with the associated CSS:

| Group       | Class Name               | CSS                                                                     |
| :---------- | :----------------------- | :---------------------------------------------------------------------- |
| **bg**      | `.bg-[token]`            | `background-color: [value]` \*                                          |
| **border**  | `.border-[token]`        | `border: [value]`                                                       |
|             | `.border-top-[token]`    | `border-top: [value]`                                                   |
|             | `.border-right-[token]`  | `border-right: [value]`                                                 |
|             | `.border-bottom-[token]` | `border-bottom: [value]`                                                |
|             | `.border-left-[token]`   | `border-left: [value]`                                                  |
| **font**    | `.font-[token]`          | (all typographic properties of [Typography Tokens](/tokens/typography)) |
| **gap**     | `.gap-[token]`           | `gap: [value]`                                                          |
|             | `.gap-col-[token]`       | `column-gap: [value]`                                                   |
|             | `.gap-row-[token]`       | `row-gap: [value]`                                                      |
| **margin**  | `.mt-[token]`            | `margin-top: [value]`                                                   |
|             | `.mr-[token]`            | `margin-right: [value]`                                                 |
|             | `.mb-[token]`            | `margin-bottom: [value]`                                                |
|             | `.ml-[token]`            | `margin-left: [value]`                                                  |
|             | `.ms-[token]`            | `margin-inline-start: [value]`                                          |
|             | `.me-[token]`            | `margin-inline-end: [value]`                                            |
|             | `.mx-[token]`            | `margin-left: [value]; margin-right: [value]`                           |
|             | `.my-[token]`            | `margin-top: [value]; margin-bottom: [value]`                           |
|             | `.ma-[token]`            | `margin: [value]`                                                       |
| **padding** | `.pt-[token]`            | `padding-top: [value]`                                                  |
|             | `.pr-[token]`            | `padding-right: [value]`                                                |
|             | `.pb-[token]`            | `padding-bottom: [value]`                                               |
|             | `.pl-[token]`            | `padding-left: [value]`                                                 |
|             | `.px-[token]`            | `padding-left: [value]; padding-right: [value]`                         |
|             | `.py-[token]`            | `padding-top: [value]; padding-bottom: [value]`                         |
|             | `.pa-[token]`            | `padding: [value]`                                                      |
| **shadow**  | `.shadow-[token]`        | `box-shadow: [value]`                                                   |
| **text**    | `.text-[token]`          | `color: [value]` \*                                                     |

::: info

The **bg** and **text** groups also accept [Gradient Tokens](/tokens/gradient), and will generate the appropriate CSS for those.

:::

### Naming

The `utility` mapping will use the remainder of the token ID, minus the selector (but will always keep the last segment, no matter what). For example, if you had a `color.semantic.primary` token, here’s how you’d control the generated CSS name:

| Selector                     | CSS Class                    |
| :--------------------------- | :--------------------------- |
| `['color.semantic.primary']` | `.bg-primary`                |
| `['color.semantic.*']`       | `.bg-primary`                |
| `['color.*']`                | `.bg-semantic-primary`       |
| `['*']`                      | `.bg-color-semantic-primary` |

You can use as much or as little of the token ID as you like, according to what makes sense to you.

This comes up a lot with spacing ([Dimension](/tokens/dimension)) tokens: if, for example, you had a `space.layout.xs` token, you could specify `['space.*']` if you wanted the CSS class `.mt-layout-xs`, or `['space.layout.*']` if you wanted `.mt-xs`. Only you know your DS and what makes the most sense, and when a name is either too long or too short.

Note that **this utility does not let you rename token IDs** for ease of use. If you want to remap and/or mix and combine tokens into different class names, you’ll have to write your own CSS manually (using the generated CSS variables, of course).

### Comparison to Tailwind

This plugin’s utility CSS can be used **in place of Tailwind,** and probably works best if the project isn’t based on Tailwind. It’s simply a lighter-weight way of using your design tokens directly in CSS. For comparison:

- ✅ **It respects dynamic vars.** The generated utility CSS references core vars, which means all your modes and [Mode Selectors](#mode-selectors) are preserved, and all the dynamism of your variables are kept.
- ✅ **Direct 1:1 mapping with tokens**. There’s no additional translation layer, or renaming into Tailwind. This just references your tokens as you’ve named them (with the only learning curve being familiarizing yourself with a few prefixes).
- ✅ **No additional build step or dependencies.** Utility CSS gets generated along with the rest of your DS code, without any additional setup.
- ✅ **No code scanning.** You only generate what you need, so no need to scan your code.
- ❌ **No automatic treeshaking.** Conversely, you control everything in the config, so you’ll have to configure for yourself how much CSS to generate from your DS (for most DSs it’s a negligible amount of CSS, however, huge DSs may need to be more selective).

If you are already using Tailwind in your project, you may find the [Tailwind Plugin](https://cobalt-ui.pages.dev/docs/integrations/tailwind/) more useful.

## Renaming CSS variables

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

/** @type {import('@cobalt-ui/core').Config} */
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

/** @type {import('@cobalt-ui/core').Config} */
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

/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    css({
      modeSelectors: [
        { mode: 'mobile', tokens: ['typography.size.*'], selectors: ['@media (width < 600px)'] },
        { mode: 'desktop', tokens: ['typography.size.*'], selectors: ['@media (width >= 600px)'] },
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

## Transforming values

Inside plugin options, you can specify an optional `transform()` function.

::: code-group

```js [tokens.config.mjs] {7-13}
/** @type {import('@cobalt-ui/core').Config} */
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
/** @type {import('@cobalt-ui/core').Config} */
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

## Special token behavior

Helpful information for @cobalt-ui/plugin-css’ handling of specific token types.

### Color tokens

::: code-group

```js [tokens.config.mjs] {5}
/** @type {import('@cobalt-ui/core').Config} */
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

## Sass typechecking

If you’re using Sass in your project, you can load this plugin through [@cobalt-ui/plugin-sass](/integrations/sass), which lets you keep the dynamism of CSS variables but lets Sass check for typos (by default, the Sass plugin uses static values).

To use this, replace this plugin with @cobalt-ui/plugin-sass in `tokens.config.mjs` and move your options into the `pluginCSS: {}` option:

::: code-group

<!-- prettier-ignore -->
```js [tokens.config.mjs]
import pluginCSS from '@cobalt-ui/plugin-css'; // [!code --]
import pluginSass from '@cobalt-ui/plugin-sass'; // [!code ++]

/** @type {import('@cobalt-ui/core').Config} */
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
