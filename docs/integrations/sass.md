---
title: Sass Integration
---

# Sass Integration

Generate `.scss` and `.sass` from your Design Tokens Community Group (DTCG) tokens.

## Setup

::: tip

Make sure you have the [Cobalt CLI](/guides/cli) installed!

:::

Install the plugin (and its dependency) from npm:

```sh
npm i -D @cobalt-ui/plugin-sass @cobalt-ui/plugin-css
```

Then add to your `tokens.config.mjs` file:

::: code-group

```js [tokens.config.mjs]
import pluginSass from '@cobalt-ui/plugin-sass'; // [!code ++]

/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [pluginSass()], // [!code ++]
};
```

:::

And run:

```sh
npx co build
```

You’ll then generate a `./tokens/index.scss` file that exports a `token()` function you can use to grab tokens:

```scss
@use '../tokens' as *; // update '../tokens' to match your location of tokens/index.scss

.heading {
  color: token('color.blue');
  font-size: token('typography.size.xxl');
}
```

## Usage

The generated Sass outputs the following helpers:

- [`token()`](#token)
- [`typography()`](#typography)
- [`listModes()`](#list-modes)

### `token()`

The main way you’ll use the token is by importing the `token()` function to grab a token by its ID (separated by dots):

```scss
@use '../tokens' as *; // update '../tokens' to match your location of tokens/index.scss

.heading {
  color: token('color.blue');
  font-size: token('typography.size.xxl');
}

body[color-mode='dark'] .heading {
  color: token('color.blue', 'dark'); // pull "dark" mode variant
}
```

Note that a function has a few advantages over plain Sass variables:

- ✅ The name perfectly matches your schema (no guessing!)
- ✅ You can programmatically pull values (which is more difficult to do with Sass vars)
- ✅ Use the same function to access [modes](#modes)

### typography()

[Sass mixin](https://sass-lang.com/documentation/at-rules/mixin/) to inject all styles from a [typography](https://cobalt-ui.pages.dev/docs/tokens/#typography) token. Optionally provide the **mode** as the 2nd param.

```scss
@include typography($tokenID, [$mode]);
```

```scss
@use '../tokens' as *;

h2 {
  @include typography('typography.heading-2');

  font-size: token('typography.size.xxl'); // overrides can still be applied after the mixin!
}
```

Note that you can override any individual property so long as it comes _after_ the mixin.

### listModes()

The `listModes()` function lists all modes a token has defined. This returns a [Sass list](https://sass-lang.com/documentation/values/lists/). This can be used to generate styles for specific modes:

```scss
@use '../tokens' as *;

@for $mode in listModes('color.blue') {
  [data-color-mode='#{$mode}'] {
    color: token('color.blue', $mode);
  }
}
```

## CSS Variable Mode

By default, this plugin converts tokens to pure Sass variables. But if you’d like to take advantage of dynamic CSS variables (which support dynamic [modes](/integrations/css#modes)), you can use in conjunction with the [CSS plugin](/integrations/css). This gives you all the flexibility and benefits of modern CSS while still keeping the typechecking properties of Sass.

To use CSS variables instead of Sass variables, set the `pluginCSS` option (can be an empty object or contain configurations):

::: code-group

```js [tokens.config.mjs] {7-14}
import pluginSass from '@cobalt-ui/plugin-sass';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  plugins: [
    pluginSass({
      pluginCSS: {
        prefix: 'ds',
        modeSelectors: [
          {mode: 'light', tokens: ['color.*'], selectors: ['[data-color-theme="light"]']},
          {mode: 'dark', tokens: ['color.*'], selectors: ['[data-color-theme="dark"]']},
        ],
      },
    }),
```

:::

From here you can set [any option the CSS plugin allows](/integrations/css).

::: tip

Don’t forget to import the `./tokens/tokens.css` file into your app as well so those variables are defined!

:::

::: warning

Don’t load another instance of @cobalt-ui/plugin-css, otherwise they may conflict!

:::

### Tips

Though CSS variable mode is recommended, there may be some caveats to be aware of. One example is that you’ll lose the ability for Sass to change opacity, however, you can achieve the same results with the [color-mix()](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix) function:

```scss
.text {
  color: rgba(token('color.ui.foreground'), 0.75); // [!code --]
  color: color-mix(in oklab, #{token('color.ui.foreground')}, 25% transparent); // [!code ++]
}
```

You’ll also lose Sass’ ability to perform math on the values, however, CSS’ built-in `calc()` can do the same:

```scss
.nav {
  margin-left: -0.5 * token('space.sm'); // [!code --]
  margin-left: calc(-0.5 * #{token('space.ms')}); // [!code ++]
}
```

In either case, letting the browser do the work is better, especially considering CSS variables are dynamic and can be modified on-the-fly.

::: tip

Always use `in oklab` as the default colorspace for `color-mix()`. It usually outperforms other blending methods ([comparison](https://better-color-tools.pages.dev/mix)).

:::

## Config

Here are all plugin options, along with their default values:

:::code-group

```js [tokens.config.mjs]
import pluginSass from '@cobalt-ui/plugin-sass';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginSass({
      /** set the filename inside outDir */
      filename: './index.scss',
      /** output CSS vars generated by @cobalt-ui/plugin-css */
      pluginCSS: undefined,
      /** use indented syntax? (.sass format) */
      indentedSyntax: false,
      /** embed file tokens? */
      embedFiles: false,
      /** handle specific token types */
      transform(token, mode) {
        // Replace "sans-serif" with "Brand Sans" for font tokens
        if (token.$type === 'fontFamily') {
          return token.$value.replace('sans-serif', 'Brand Sans');
        }
      },
    }),
  ],
};
```

:::

## Color tokens

::: code-group

```js [tokens.config.mjs] {5}
/** @type {import('@cobalt-ui/core').Config} */
export default {
  plugins: [
    pluginSass({
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

## Link tokens

Say you have [link tokens](/tokens/link) in your `tokens.json`:

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

```scss
.icon-alert {
  background-image: token('icon.alert'); // url('./icon/alert.svg')
}
```

In some scenarios this is preferable, but in others, this may result in too many requests and may result in degraded performance. You can set `embedFiles: true` to generate the following instead:

```scss
.icon-alert {
  background-image: token('icon.alert'); // url('image/svg+xml;utf8,<svg …></svg>');
}
```

::: tip

The Sass plugin uses [SVGO](https://github.com/svg/svgo) to optimize SVGs at lossless quality. However, raster images won’t be optimized so quality isn’t degraded.

:::

[Read more about the advantages to inlining files](https://css-tricks.com/data-uris/)

## Transform

Inside plugin options, you can specify an optional `transform()` function:

::: code-group

```js [tokens.config.mjs] {7-13}
/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginSass({
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
    pluginSass({
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
