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

> ⚠️ **Compatibility Warning**
>
> While Cobalt will do the best job it can converting from Tokens Studio for Figma’s format, some types may be incompatible. If you encounter any problems, please [file an issue](https://github.com/drwpow/cobalt-ui/issues).
