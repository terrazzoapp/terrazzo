# @cobalt-ui/plugin-css

Generate CSS output for [Cobalt](https://cobalt-ui.pages.dev) from design tokens.

## Setup

```
npm i -D @cobalt-ui/plugin-css
```

```js
// cobalt.config.mjs
import css from "@cobalt-ui/plugin-css";

export default {
  plugins: [
    css({
      /** set the filename inside outDir */
      fileName: "./tokens.css",
      /** create selector wrappers around modes */
      modeSelectors: {
        // …
      },
      /** modify values (overwrite default CSS transform) */
      transformValue(token, mode) {
        return mode ? token.mode[mode] : token.value;
      },
      /** don’t like the name of CSS variables? change ’em! */
      transformVariableNames(name, group) {
        return `--${name.replace(/[._]/g, "-")}`;
      },
    }),
  ],
};
```

## Usage

### Modes

To generate CSS for Modes, add a `modeSelectors: {}` object to your config, and specify `mode: [selector1, selector2, …]`.

For example, if your `color` group has `light` and `dark` modes, and want to generate `theme--light` and `theme--dark` classes:

```js
// cobalt.config.mjs
import css from '@cobalt-ui/plugin-css';

export default [
  plugins: [
    css({
      modeSelectors: {
        color: {
          light: ['.theme--light'],
          dark: ['.theme--dark'],
        },
      },
    }),
  ],
]
```

This will generate the following CSS:

```css
/* default theme set by tokens.yaml (same as "light") */
:root {
  --color-blue: #0969da;
  --color-green: #2da44e;
  --color-red: #cf222e;
  /* … */
}

/* light theme colors */
.theme--light {
  --color-blue: #0969da;
  --color-green: #2da44e;
  --color-red: #cf222e;
  /* … */
}

/* dark theme colors */
.theme--dark {
  --color-blue: #1f6feb;
  --color-green: #2ea043;
  --color-red: #da3633;
  /* … */
}
```

But more than just classes can be used (that’s why it’s called `modeSelectors` and not `modeClasses`)! You could also generate CSS if your `type.size` group had `desktop` and `mobile` sizes:

```js
// cobalt.config.mjs
import css from "@cobalt-ui/plugin-css";

export default {
  plugins: [
    css({
      modeSelectors: {
        "type.size": {
          desktop: ["@media (min-width: 600px)"],
        },
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

To learn about modes, [read the documentation](https://cobalt-ui.pages.dev/docs/modes)

## Features

- `type: file`: base64 encodes the file into the CSS
- `type: url`: converts to a plain `url()`

## Tools

When you import your generated TypeScript, you’ll find more than just your tokens—you’ll find some handy utilities in there as well.

### Color

TODO
