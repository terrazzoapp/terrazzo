---
title: DTCG Tokens
layout: ../../../layouts/docs.astro
---

# DTCG Tokens

The <abbr title="Design Tokens Community Group">DTCG</abbr> format is a [W3C Community Group specification](https://www.designtokens.org/) started in 2020 and aims to outline a standard, universal design token format that works for all forms of digital design (including web, print, native apps, and beyond).

DTCG tokens are stored in JSON, and look something like the following:

```json
{
  "rebeccapurple": {
    "$type": "color",
    "$value": {
      "colorSpace": "srgb",
      "components": [0.4, 0.2, 0.6]
    }
  }
}
```

By storing tokens in a universal format like JSON, you can centrally manage them and generate code for any output target including web and native apps.

## Format

You can [find the official format here](https://tr.designtokens.org/format/). But for convenience, we also have [a list of token types](/docs/reference/tokens) Terrazzo supports.
