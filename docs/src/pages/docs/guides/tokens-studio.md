---
title: Tokens Studio for Figma
layout: ../../../layouts/docs.astro
---

# Tokens Studio for Figma

![Tokens Studio for Figma](/images/tokens-studio-for-figma.png)

[Tokens Studio for Figma](https://tokens.studio/) is a free plugin that makes managing design tokens in Figma easy ([docs](https://docs.tokens.studio/)). While it doesn’t use the W3C Design Tokens format like Cobalt does, Cobalt supports most of Tokens Studio’s format.

To use Tokens Studio, first export a `tokens.json` file using [any of the approved sync methods](https://docs.tokens.studio/sync/sync). Then use Cobalt as you would normally:

```js
import pluginCSS from '@cobalt-ui/plugin-css';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [pluginCSS()],
};
```

## Compatibility

| Token Studio Token                                                                | Supported | Notes                                                                                                                                                                    |
| :-------------------------------------------------------------------------------- | :-------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Sizing](https://docs.tokens.studio/available-tokens/sizing-tokens)               |    ✅     | Converted to [Dimension](/docs/tokens/#dimension).                                                                                                                       |
| [Spacing](https://docs.tokens.studio/available-tokens/spacing-tokens)             |    ✅     | Converted to [Dimension](/docs/tokens/#dimension).                                                                                                                       |
| [Color](https://docs.tokens.studio/available-tokens/color-tokens)                 |    ✅     | Flat colors are kept as [Color](/docs/tokens/#color) while gradients are converted to [Gradient](/docs/tokens/#gradient). Modifiers aren’t supported.                    |
| [Border radius](https://docs.tokens.studio/available-tokens/border-radius-tokens) |    ✅     | Converted to [Dimension](/docs/tokens/#dimension). Multiple values are expanded into 4 tokens (`*TopLeft`, `*TopRight`, `*BottomLeft`, `*BottomRight`).                  |
| [Border width](https://docs.tokens.studio/available-tokens/border-width-tokens)   |    ✅     | Converted to [Dimension](/docs/tokens/#dimension).                                                                                                                       |
| [Shadow](https://docs.tokens.studio/available-tokens/shadow-tokens)               |    ✅     | Basically equivalent to [Shadow](/docs/tokens/#shadow).                                                                                                                  |
| [Opacity](https://docs.tokens.studio/available-tokens/opacity-tokens)             |    ✅     | Converted to [Number](/docs/tokens/#number)                                                                                                                              |
| [Typography](https://docs.tokens.studio/available-tokens/typography-tokens)       |    ✅     | Basically equivalent to [Typography](/docs/tokens/#typography). **Text decoration** and **Text Case** must be flattened as there is no W3C Design Token spec equivalent. |
| [Asset](https://docs.tokens.studio/available-tokens/asset-tokens)                 |    ❌     | TODO. Cobalt supports [Link](/docs/tokens/#link), which should be an equivalent.                                                                                         |
| [Composition](https://docs.tokens.studio/available-tokens/composition-tokens)     |    ❌     | Unsupported because this is a paid feature.                                                                                                                              |
| [Dimension](https://docs.tokens.studio/available-tokens/dimension-tokens)         |    ✅     | Direct equivalent to [Dimension](/docs/tokens/#dimension).                                                                                                               |
| [Border](https://docs.tokens.studio/available-tokens/border-tokens)               |    ✅     | Direct equivalent to [Border](/docs/tokens/#border).                                                                                                                     |

Note that **Duration** and **Cubic Bezier** aren’t supported by Tokens Studio (because Figma currently doesn’t support animations). So to use those types you’ll need to convert your tokens into the W3C Design Token format.
