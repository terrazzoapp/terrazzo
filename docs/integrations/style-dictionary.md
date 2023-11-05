---
title: Style Dictionary
---

# Style Dictionary

You can migrate your [Style Dictionary](https://amzn.github.io/style-dictionary) tokens to the Design Tokens Format Module (DTFM) standard by running the following command (granted you have [the CLI installed](/guides/cli)):

```bash
npx co convert style-dictionary-tokens.json --out tokens.json
```

After running `npx co convert` it’s not recommended to keep using the Style Dictionary format.

::: warning
This is **NOT** a perfect conversion. This is only meant to do most of the work of migrating to DTFM, but you’ll still have to do some clean up and migrate the parts that weren’t able to be converted.
:::

## Why convert to DTFM?

::: tip

Only you can decide what’s best, and don’t fix your design tooling if it isn’t broken! Only switch to DTFM if it makes sense for your project.

:::

There are reasons to switch from Style Dictionary to DTFM. While Style Dictionary is a powerful and flexible tool, it also requires more configuration and maintenance than DTFM does. For example, Style Dictionary requires you place all your colors underneath a top-level `color` group. If you want to reference colors elsewhere, you’ll have to configure all your transformers to look for them. The same applies for `size` and `time` tokens.

Further, Style Dictionary is missing more advanced features like `gradient`, `typography`, and `shadow` tokens from the DTFM spec, to name a few (and adding them results in nonstandard usage that would be improved by opting for a standard that supports them out-of-the-box).

While Style Dictionary was a significant trailblazer in managing design tokens and was the first mature library to accomplish this elegantly, the new DTFM spec is being designed to replace the Style Dictionary format by improving on its flaws. In fact, DTFM is more influenced by Style Dictionary than any other format, so rest assured that while migrating can be hard work, the goal of DTFM is to support all of Style Dictionary’s functionality and then some.
