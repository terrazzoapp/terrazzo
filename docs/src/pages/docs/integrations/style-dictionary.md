---
title: Style Dictionary
layout: ../../../layouts/docs.astro
---

# Style Dictionary

You can migrate your <a href="https://amzn.github.io/style-dictionary" target="_blank" rel="noopener noreferrer">Style Dictionary</a> tokens to the W3C format by running the following command (granted you have [the CLI installed](/docs/reference/cli)):

```bash
npx co convert style-dictionary-tokens.json --out tokens.json
```

<div class="callout" role="note">

⚠️ **Warning**
This is **NOT** meant to be a comprehensive conversion. The W3C format is not 1:1 compatible with Style Dictionary. This will not import your transformations, and it will probably make mistakes, and miss tokens. This is only meant for **migrating** to the W3C format permanently, and is meant to save you some work by giving you a starting point you’ll have to clean up afterward.

After running `npx co convert` it’s not recommended to keep using the Style Dictionary format.

</div>

## Why convert to W3C Design Tokens?

While Style Dictionary is a powerful and flexible tool, it also requires more configuration and maintenance than the W3C Design Token format does. For example, Style Dictionary requires you place all your colors underneath a top-level `color` group. If you want to reference colors elsewhere, you’ll have to configure all your transformers to look for them. The same applies for `size` and `time` tokens.

Further, Style Dictionary is missing more advanced features like `gradient`, `typography`, and `shadow` tokens from the W3C spec, to name a few.

While Style Dictionary was a significant trailblazer in managing design tokens and was the first mature library to accomplish this elegantly, the W3C spec is being actively designed to make up for Style Dictionary’s shortcomings. The new W3C spec is arguably more influenced by Style Dictionary than any other tool, and takes into account Style Dictionary’s way of doing things. W3C is meant to replace the Style Dictionary format eventually.
