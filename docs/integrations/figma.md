---
title: Figma Integration
---

# Figma Integration

Cobalt supports the following export methods from Figma:

1. **Styles**: no support¹. Variables are recommended.
2. **Variables**: [see docs](#figma-variables)
3. **Tokens Studio**: [see docs](#tokens-studio)

::: info

¹ Beta versions of Cobalt had Styles support, before Variables were announced. But Figma’s API made it not only difficult to convert Styles to DTCG, it also required more setup and headache for the designer and developer. However, Variables were built with the DTCG spec in mind, and couldn’t be easier.

:::

## Figma Variables

::: warning

Using the Figma Variables API currently [requires an Enterprise plan](https://www.figma.com/developers/api#variables) in Figma.

:::

[Figma Variables](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma) are currently in beta, but were designed to match the DTCG token format 1:1, and are expected to follow changes. Currently, the supported token types are:

| Figma Type |  DTCG Type  | Notes                           |
| :--------: | :---------: | :------------------------------ |
|  `color`   |   `color`   | Coverts to sRGB Hex by default. |
|  `number`  | `dimension` | Uses `px` by default.           |
|  `string`  |             | Ignored if no `type` specified. |
| `boolean`  |             | Ignored if no `type` specified. |

_Note: [typography variables](https://help.figma.com/hc/en-us/articles/4406787442711#variables) have been announced, but aren’t released yet. Cobalt will add support when they arrive._

### Setup

In your `tokens.config.js` file, add the Figma [share URL](https://help.figma.com/hc/en-us/articles/360040531773-Share-files-and-prototypes) as a token source:

```ts
/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: ['https://www.figma.com/file/OkPWSU0cusQTumCNno7dm8/Design-System?…'],
};
```

Next, you’ll need to create a [Figma Access Token](https://www.figma.com/developers/api#access-tokens) with the `file:read` and `file_variables:read` scopes and expose it as `FIGMA_ACCESS_TOKEN` in your `.zshrc` or `.bashrc` file (or in CI you can add this to [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions))

```sh
export FIGMA_API_TOKEN=abc123…
```

Then run `co build` as you would normally, and Cobalt will operate as if the Variables pulled from Figma existed in a local `tokens.json` file.

### Overrides

Figma Variables can be a **Color**, **Number**, **String**, or **Boolean.** Color translates directly to the DTCG [Color](/tokens/color) type, so those will work automatically. But for everything else, you’ll need to set up overrides to specify what token type each Figma Variable should be. To do so, specify selectors in a mapping in `figma.overrides` where the key is a glob pattern (or specific ID), and the value is an object with your desired DTCG type:

```ts
/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: ['https://www.figma.com/file/OkPWSU0cusQTumCNno7dm8/Design-System?…'],
  figma: {
    overrides: {
      'size/*': {$type: 'dimension'},
      'timing/*': {$type: 'duration'},
    },
  },
};
```

::: tip

If both a glob pattern and specific ID are provided, the specific ID takes priority.

:::

#### Advanced Overrides

`figma.overrides` also accepts 2 callback utilities to provide futher control over transforming Variables:

##### `rename()`

By default, tokens will keep the same name as your Figma Variables, but with `/` converted into `.`, e.g. `color/base/blue/500` → `color.base.blue.500`. But to rename certain tokens, you can provide a `transformID()` utility:

```ts
/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: ['https://www.figma.com/file/OkPWSU0cusQTumCNno7dm8/Design-System?…'],
  figma: {
    overrides: {
      'color/*': {
        // rename color/base/purple → color/base/violet
        rename(id) {
          return id.replace('color/base/purple', 'color/base/violet');
        },
      },
    },
  },
};
```

You can choose to keep the `/`s from Figma, or convert to `.` separators like DTCG requires; up to you. They both work the same way.

::: tip

If you return `undefined` or an empty string, it’ll keep its original name.

:::

##### `transform()`

This is useful when either `$type` isn’t enough, or you want to provide additional conversions. Here, for example, is how you’d take `px`-based number Variables and convert to `rem`s:

```ts
/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: ['https://www.figma.com/file/OkPWSU0cusQTumCNno7dm8/Design-System?…'],
  figma: {
    overrides: {
      'size/*': {
        $type: 'dimension',
        // convert px → rem
        transform({variable, collection, mode}) {
          const rawValue = variable.valuesByMode[mode.modeId];
          if (typeof rawValue === 'number') {
            return `${rawValue / 16}rem`;
          }
          // remember rawValue may be an alias of another Variable!
          // in that case, `typeof rawValue === "object" && rawValue.type === 'VARIABLE_ALIAS'`
        },
      },
    },
  },
};
```

::: info

`transform()` will only run a maximum of 1× per variable (you can’t do multiple runs with multiple matching globs).

:::

::: tip

You can even create aliases on-the-fly by either returning a DTCG alias string `"{color.base.blue}"`, or a Figma Variable alias type (`{ type: "VARIABLE_ALIAS", id: "xxxxxxx…" }`).

:::

## Tokens Studio

Once your design tokens are in Tokens Studio ([docs](https://docs.tokens.studio/tokens/creating-tokens)), use [any of the approved sync methods](https://docs.tokens.studio/sync/sync) to export a `tokens.json` file. Then use Cobalt as you would normally:

```js
import pluginCSS from '@cobalt-ui/plugin-css';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [pluginCSS()],
};
```

Once your sync method is set up, it should be a snap to re-export that `tokens.json` file every time something updates.

### Support

| Tokens Studio Type                                                                | Supported | Notes                                                                                                                                                  |
| :-------------------------------------------------------------------------------- | :-------: | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Sizing](https://docs.tokens.studio/available-tokens/sizing-tokens)               |    ✅     | Converted to [Dimension](/tokens/dimension).                                                                                                           |
| [Spacing](https://docs.tokens.studio/available-tokens/spacing-tokens)             |    ✅     | Converted to [Dimension](/tokens/dimension).                                                                                                           |
| [Color](https://docs.tokens.studio/available-tokens/color-tokens)                 |    ✅     | Flat colors are kept as [Color](/tokens/color) while gradients are converted to [Gradient](/tokens/gradient). Modifiers aren’t supported.              |
| [Border radius](https://docs.tokens.studio/available-tokens/border-radius-tokens) |    ✅     | Converted to [Dimension](/tokens/dimension). Multiple values are expanded into 4 tokens (`*TopLeft`, `*TopRight`, `*BottomLeft`, `*BottomRight`).      |
| [Border width](https://docs.tokens.studio/available-tokens/border-width-tokens)   |    ✅     | Converted to [Dimension](/tokens/dimension).                                                                                                           |
| [Shadow](https://docs.tokens.studio/available-tokens/shadow-tokens)               |    ✅     | Basically equivalent to [Shadow](/tokens/shadow).                                                                                                      |
| [Opacity](https://docs.tokens.studio/available-tokens/opacity-tokens)             |    ✅     | Converted to [Number](/tokens/number)                                                                                                                  |
| [Typography](https://docs.tokens.studio/available-tokens/typography-tokens)       |    ✅     | Basically equivalent to [Typography](/tokens/typography). **Text decoration** and **Text Case** must be flattened as there is no DTCG spec equivalent. |
| [Asset](https://docs.tokens.studio/available-tokens/asset-tokens)                 |    ❌     | TODO. Cobalt supports [Link](/tokens/link), which should be an equivalent.                                                                             |
| [Composition](https://docs.tokens.studio/available-tokens/composition-tokens)     |    ❌     | Unsupported because this is a paid feature.                                                                                                            |
| [Dimension](https://docs.tokens.studio/available-tokens/dimension-tokens)         |    ✅     | Direct equivalent to [Dimension](/tokens/dimension).                                                                                                   |
| [Border](https://docs.tokens.studio/available-tokens/border-tokens)               |    ✅     | Direct equivalent to [Border](/tokens/border).                                                                                                         |

#### Notes

- **Duration** and **Cubic Bézier** types aren’t supported by Tokens Studio (because Figma currently doesn’t support animations). So to use those types you’ll need to convert your tokens into DTCG.
- Though Cobalt preserves your [Token Sets](https://docs.tokens.studio/themes/token-sets), which means most aliases will work, Token Studio’s [Advanced Themes](https://docs.tokens.studio/themes/themes-pro) is a paid feature and is therefore not supported. Though you could manually upconvert Token Studio themes to [modes](/guides/modes).
