# @cobalt-ui/plugin-css

Generate CSS vars for [Cobalt](https://cobalt-ui.pages.dev) from design tokens.

Automatically generates 🌈 [**P3 colors**](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/color-gamut) for more vibrant colors on displays that support it.

## Setup

```
npm i -D @cobalt-ui/plugin-css
```

```js
// tokens.config.mjs
import pluginCSS from '@cobalt-ui/plugin-css';

/** @type import('@cobalt-ui/core').Config */
export default {
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
  plugins: [
    pluginCSS({
      /** set the filename inside outDir */
      filename: './tokens.css',
      /** create selector wrappers around modes */
      modeSelectors: {
        // …
      },
      /** embed file tokens? */
      embedFiles: false,
      /** (optional) transform specific token values */
      transform: () => null,
      /** (optional) add custom namespace to CSS vars */
      prefix: '',
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

#### Example

To generate CSS for Modes, add a `modeSelectors: {}` object to your config, and specify `mode: [selector1, selector2, …]`.

For example, if your `color.base` group has `light` and `dark` modes, and you want to alter the CSS variables based on a body attribute:

```js
// tokens.config.mjs
import css from '@cobalt-ui/plugin-css';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    css({
      modeSelectors: {
        'color.base#light': ['body[data-color-mode="light"]'],
        'color.base#dark': ['body[data-color-mode="dark"]', '@media (prefers-color-scheme:dark)'],
        'transition#reduced': ['@media (prefers-reduced-motion)'],
      },
    }),
  ],
};
```

This will generate the following CSS:

```css
/* default theme set by tokens.json (same as "light") */
:root {
  --color-blue: #0969da;
  --color-green: #2da44e;
  --color-red: #cf222e;
  /* … */
}

/* light theme colors */
body[data-color-mode='light'] {
  --color-blue: #0969da;
  --color-green: #2da44e;
  --color-red: #cf222e;
  /* … */
}

/* dark theme colors */
body[data-color-mode='dark'] {
  --color-blue: #1f6feb;
  --color-green: #2ea043;
  --color-red: #da3633;
  /* … */
}
```

But more than just classes can be used (that’s why it’s called `modeSelectors` and not `modeClasses`)! You could also generate CSS if your `type.size` group had `desktop` and `mobile` sizes:

```js
// tokens.config.mjs
import css from '@cobalt-ui/plugin-css';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    css({
      modeSelectors: {
        'type.size#desktop': ['@media (min-width: 600px)'],
      },
    }),
  ],
};
```

That will generate the following:

```css
/* default size (in this case, mobile) */
:root {
  --type-size: 16px;
}

/* desktop size */
@media (min-width: 600px) {
  :root {
    --type-size: 18px;
  }
}
```

#### Syntax

The `#` character designates the mode. **You must have a `#` somewhere in the selector.**

- `#light`: match _any_ token that has a `light` mode
- `color#light`: deeply match any token inside the `color` group, that has a `light` mode
- `color.base#light`: deeply match any token inside the `color.base` group with a `light` mode, but ignore any other tokens inside `color`

#### Further Reading

To learn about modes, [read the documentation](https://cobalt-ui.pages.dev/docs/guides/modes/)

### Transform

Inside plugin options, you can specify an optional `transform()` function.

```js
/** @type import('@cobalt-ui/core').Config */
export default {
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

### Usage with @cobalt-ui/plugin-sass

If you’re using Sass in your project, you can load this plugin through [@cobalt-ui/plugin-sass](../plugin-sass), which lets you use CSS vars while letting Sass typecheck everything and making sure your stylesheet references everything correctly.

To use this, replace this plugin with @cobalt-ui/plugin-sass in `tokens.config.mjs` and pass all options into `pluginCSS: {}`:

```diff
- import pluginCSS from '@cobalt-ui/plugin-css';
+ import pluginSass from '@cobalt-ui/plugin-sass';

  /** @type import('@cobalt-ui/core').Config */
  export default {
    plugins: [
-     pluginCSS({ filename: 'tokens.css }),
+     pluginSass({
+       pluginCSS: { filename: 'tokens.css' },
+     }),
    ],
  };
```

This changes `token('color.blue')` to return CSS vars rather than the original values. To learn more, [read the dos](../plugin-sass).
