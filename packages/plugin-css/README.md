# @cobalt-ui/plugin-css

Generate CSS output for [Cobalt](https://cobalt-ui.pages.dev) from design tokens.

Automatically generates 🌈 [**P3 colors**](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/color-gamut) for more vibrant colors on displays that support it.

## Setup

```
npm i -D @cobalt-ui/plugin-css
```

```js
// tokens.config.mjs
import css from '@cobalt-ui/plugin-css';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    css({
      /** set the filename inside outDir */
      filename: './tokens.css',
      /** create selector wrappers around modes */
      modeSelectors: {
        // …
      },
      /** embed file tokens? */
      embedFiles: false,
      /** handle specific token types */
      transform: {
        color: (value, token) => {
          return value;
        },
      },
      /** (optional) prefix variable names */
      prefix: '--my-prefix',
    }),
  ],
};
```

## Usage

Running `npx co build` with the plugin set up will generate a `tokens/tokens.css` file. Inspect that, and import where desired and use the [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) as desired ([docs](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)).

## Config

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
        'color.base#dark': ['body[data-color-mode="dark"]'],
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

Inside plugin options, you can specify transforms [per-type](https://cobalt-ui.pages.dev/docs/tokens):

```js
/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    pluginCSS({
      transform: {
        color: (value, token) => {
          return value;
        },
        dimension: (value, token) => {
          return value;
        },
        font: (value, token) => {
          return value;
        },
        duration: (value, token) => {
          return value;
        },
        cubicBezier: (value, token) => {
          return value;
        },
        link: (value, token) => {
          return value;
        },
        transition: (value, token) => {
          return value;
        },
        shadow: (value, token) => {
          return value;
        },
        gradient: (value, token) => {
          return value;
        },
        typography: (value, token) => {
          return value;
        },
      },
    }),
  ],
};
```

⚠️ Whenever you override a transformer for a token type, it’s now up to you to handle everything! You may also need the help of utilities like [better-color-tools](https://github.com/drwpow/better-color-tools)

#### Custom tokens

If you have your own custom token type, e.g. `my-custom-type`, you can add more keys to `transform` to handle it, like so:

```js
/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    pluginCSS({
      transform: {
        'my-custom-type': (value, token) => {
          return String(value);
        },
      },
    }),
  ],
};
```
