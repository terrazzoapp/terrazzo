# @cobalt-ui/plugin-css

Generate CSS from your design tokens using [Cobalt](https://cobalt-ui.pages.dev).

**Features**

- ✅ 🌈 Automatic [P3 color](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/color-gamut) enhancement
- ✅ Automatic mode inheritance (e.g. light/dark mode)

## Setup

Install the plugin from npm:

```bash
npm i -D @cobalt-ui/plugin-css
```

Then add to your `tokens.config.mjs` file:

```js
// tokens.config.mjs
import pluginCSS from '@cobalt-ui/plugin-css';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [pluginCSS()],
};
```

Generates:

```css
/* tokens/tokens.css */

:root {
  --color-blue: #0969da;
  --color-green: #2da44e;
  --color-red: #cf222e;
  --color-black: #101010;
  --color-ui-text: var(--color-black);
}
```

You can then use these anywhere in your app.

## Usage

Running `npx co build` with the plugin set up will generate a `tokens/tokens.css` file. Inspect that, and import where desired and use the [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) as desired ([docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)).

## Options

### All Options

Here are all plugin options, along with their default values

```js
// tokens.config.mjs
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

### Embed Files

Say you have `link` tokens in your `tokens.json`:

```json
{
  "icon": {
    "alert": {
      "$type": "link",
      "$value": "./icon/alert.svg"
    }
  }
}
```

By default, consuming those will print values as-is:

```css
.icon-alert {
  background-image: var(--icon-alert);
}

/* Becomes … */
.icon-alert {
  background-image: url('./icon/alert.svg');
}
```

In some scenarios this is preferable, but in others, this may result in too many requests and may result in degraded performance. You can set `embedFiles: true` to generate the following instead:

```css
.icon-alert {
  background-image: var(--icon-alert);
}

/* Becomes … */
.icon-alert {
  background-image: url('image/svg+xml;utf8,<svg …></svg>');
}
```

[Read more](https://css-tricks.com/data-uris/)

### Mode Selectors

To generate CSS for Modes, add a `modeSelectors` array to your config that specifies the **mode** you’d like to target and which **CSS selectors** should activate those modes (can either be one or multiple). You may optionally also decide to include or exclude certain tokens (e.g. `color.*` will only target the tokens that begin with `color.`).

```js
// tokens.config.mjs
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

```js
// tokens.config.mjs
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

[Learn more about modes](https://cobalt-ui.pages.dev/docs/guides/modes/)

### Color Format

```js
pluginCSS({
  colorFormat: 'oklch',
}),
```

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

### Transform

Inside plugin options, you can specify an optional `transform()` function.

```js
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

Your transform will only take place if you return a truthy value, otherwise the default transformer will take place.

#### Custom tokens

If you have your own custom token type, e.g. `my-custom-type`, you’ll have to handle it within `transform()`:

```js
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

### Generate Name

Because token IDs are a dot-separated series of JSON keys, they cannot be trusted to be valid CSS variable names. By default, Cobalt generates CSS variable names using the `defaultNameGenerator` function which...

- Removes leading and trailing whitespace from each group or token name in an ID
- camelCases any group or token name that has a space in the middle of it
- Joins the normalized segments together with a single dashes

If you wish to customize this behavior, you can specify your own name generator with the plugin's `generateName` option. It accepts a function with the following signature.

```ts
type CustomNameGenerator = (variableId: string, token?: ParsedToken) => string;
```

A couple things to be aware of:

- `token` can be undefined in rare cases
  - This occurs when a token references another token that is not defined. Currently, this is not explicitly disallowed by the design tokens specification.
- `variableId` may not be a 1:1 match with the `token.id`
  - For example, each property in a composite token will have its own variable generated, so those `variableId`s will include the property name. In most cases you should use `variableId` rather than `token.id`.
- The string returned does not need to be prefixed with `--`, Cobalt will take care of that for you

If you wish, you can use the `defaultNameGenerator` in your custom name generator. This is handy if you only want to modify the behavior of a special case.

```js
// tokens.config.mjs
import pluginCSS, { defaultNameGenerator } from '@cobalt-ui/plugin-css';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginCSS({
      generateName: (variableId, token) {
        if (variableId === 'my.special.token') {
          return "SUPER_IMPORTANT_VARIABLE";
        }

        return defaultNameGenerator(variableId);
      },
    }),
  ],
};
```

### Usage with @cobalt-ui/plugin-sass

If you’re using Sass in your project, you can load this plugin through [@cobalt-ui/plugin-sass](https://cobalt-ui.pages.dev/docs/integrations/sass/), which lets you use CSS vars while letting Sass typecheck everything and making sure your stylesheet references everything correctly.

To use this, replace this plugin with @cobalt-ui/plugin-sass in `tokens.config.mjs` and pass all options into `pluginCSS: {}`:

```diff
- import pluginCSS from '@cobalt-ui/plugin-css';
+ import pluginSass from '@cobalt-ui/plugin-sass';

  /** @type import('@cobalt-ui/core').Config */
  export default {
    tokens: './tokens.json',
    outDir: './tokens/',
    plugins: [
-     pluginCSS({ filename: 'tokens.css }),
+     pluginSass({
+       pluginCSS: { filename: 'tokens.css' },
+     }),
    ],
  };
```

This changes `token('color.blue')` to return CSS vars rather than the original values. To learn more, [read the docs](https://cobalt-ui.pages.dev/docs/integrations/sass/).
