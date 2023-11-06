---
title: Figma
---

# Figma

Because Figma doesn’t have a way to export the [Design Tokens Format Module (DTFM)](https://designtokens.org) directly, you’ll need a plugin to export your styles to the DTFM format.

The plugin we recommend for now is [Tokens Studio for Figma](https://tokens.studio). Though it doesn’t support DTFM directly either, it does allow you to export your design tokens in a format Cobalt can read.

::: info

This only allows syncing _from_ Figma. Syncing _to_ Figma isn’t possible today, but the Cobalt team is actively building something to make this possible. Stay tuned! 📺

:::

## Exporting from Tokens Studio

Once your design tokens are in Tokens Studio ([docs](https://docs.tokens.studio/tokens/creating-tokens)), use [any of the approved sync methods](https://docs.tokens.studio/sync/sync) to export a `tokens.json` file. Then use Cobalt as you would normally:

```js
import pluginCSS from '@cobalt-ui/plugin-css';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [pluginCSS()],
};
```

Once your sync method is set up, it should be a snap to re-export that `tokens.json` file every time something updates.

## Support

| Tokens Studio Type                                                                | Supported | Notes                                                                                                                                                  |
| :-------------------------------------------------------------------------------- | :-------: | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Sizing](https://docs.tokens.studio/available-tokens/sizing-tokens)               |    ✅     | Converted to [Dimension](/tokens/dimension).                                                                                                           |
| [Spacing](https://docs.tokens.studio/available-tokens/spacing-tokens)             |    ✅     | Converted to [Dimension](/tokens/dimension).                                                                                                           |
| [Color](https://docs.tokens.studio/available-tokens/color-tokens)                 |    ✅     | Flat colors are kept as [Color](/tokens/color) while gradients are converted to [Gradient](/tokens/gradient). Modifiers aren’t supported.              |
| [Border radius](https://docs.tokens.studio/available-tokens/border-radius-tokens) |    ✅     | Converted to [Dimension](/tokens/dimension). Multiple values are expanded into 4 tokens (`*TopLeft`, `*TopRight`, `*BottomLeft`, `*BottomRight`).      |
| [Border width](https://docs.tokens.studio/available-tokens/border-width-tokens)   |    ✅     | Converted to [Dimension](/tokens/dimension).                                                                                                           |
| [Shadow](https://docs.tokens.studio/available-tokens/shadow-tokens)               |    ✅     | Basically equivalent to [Shadow](/tokens/shadow).                                                                                                      |
| [Opacity](https://docs.tokens.studio/available-tokens/opacity-tokens)             |    ✅     | Converted to [Number](/tokens/number)                                                                                                                  |
| [Typography](https://docs.tokens.studio/available-tokens/typography-tokens)       |    ✅     | Basically equivalent to [Typography](/tokens/typography). **Text decoration** and **Text Case** must be flattened as there is no DTFM spec equivalent. |
| [Asset](https://docs.tokens.studio/available-tokens/asset-tokens)                 |    ❌     | TODO. Cobalt supports [Link](/tokens/link), which should be an equivalent.                                                                             |
| [Composition](https://docs.tokens.studio/available-tokens/composition-tokens)     |    ❌     | Unsupported because this is a paid feature.                                                                                                            |
| [Dimension](https://docs.tokens.studio/available-tokens/dimension-tokens)         |    ✅     | Direct equivalent to [Dimension](/tokens/dimension).                                                                                                   |
| [Border](https://docs.tokens.studio/available-tokens/border-tokens)               |    ✅     | Direct equivalent to [Border](/tokens/border).                                                                                                         |

#### Notes

- **Duration** and **Cubic Bézier** types aren’t supported by Tokens Studio (because Figma currently doesn’t support animations). So to use those types you’ll need to convert your tokens into DTFM.
- Though Cobalt preserves your [Token Sets](https://docs.tokens.studio/themes/token-sets), which means most aliases will work, Token Studio’s [Advanced Themes](https://docs.tokens.studio/themes/themes-pro) is a paid feature and is therefore not supported. Though you could manually upconvert Token Studio themes to [modes](/guides/modes).
