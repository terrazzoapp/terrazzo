---
title: DTCG Tokens
layout: ../../../layouts/docs.astro
---

# DTCG Tokens

The <abbr title="Design Tokens Community Group">DTCG</abbr> format is a [W3C Community Group specification](https://www.designtokens.org/) started in 2020 and aims to outline a standard, universal design token format that works for all forms of digital design (including web, print, native apps, and beyond).

DTCG tokens are stored in JSON, and look something like the following:

:::code-group

```json [my-ds.tokens.json]
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

:::

By storing tokens in a universal format like JSON, you can centrally manage them and generate code for any output target including web and native apps.

## Types

Currently, the DTCG format defines the following types:

| Type | Description |
|:-----|:------------|
| [Color](/docs/reference/tokens#color) | A flat color. |
| [Dimension](/docs/reference/tokens#dimension) | A unit for sizing, spacing, etc. |
| [Font Family](/docs/reference/tokens#font-family) | A font family, with fallbacks. |
| [Font Weight](/docs/reference/tokens#font-weight) | A font weight, such as normal or bold. |
| [Duration](/docs/reference/tokens#duration) | A unit for time. |
| [Cubic Bézier](/docs/reference/tokens#cubic-bezier) | A Cubic Bézier for animations. |
| [Number](/docs/reference/tokens#number) | A number without units. |
| [Stroke Style](/docs/reference/tokens#stroke) | A stroke. |
| [Border](/docs/reference/tokens#border) | An element border style. |
| [Transition](/docs/reference/tokens#transition) | A pairing of timing, duration, and a Cubic Bézier to form an animation. |
| [Shadow](/docs/reference/tokens#shadow) | A drop shadow or inner shadow. |
| [Gradient](/docs/reference/tokens#gradient) | A gradient of colors. |
| [Typography](/docs/reference/tokens#typography) | A complete typographic style, including family, weight, line height, and more. |

In addition, Terrazzo also allows 3 additional custom types: [Link](/docs/reference/tokens), [Boolean](/docs/reference/tokens), and [String](/docs/reference/tokens). But it may require writing your own to take full advantage of these types.

## Hierarchy

DTCG token files are infinitely-nestable to create your token structure. For example, if you had a `color.base.blue.500` token, you’d express it like so:

:::code-group

```jsonc [my-ds.tokens.json]
{
  "color": {
    "base": {
      "blue": {
        "500": { /* … */ }
      }
    }
  }
}
```

:::

By allowing your JSON structure to nest, you avoid errors by **avoiding duplication.** For example, if you had to express your tokens like so:

:::code-group

```jsonc [my-ds.tokens.json]
{
  "color.base.blue.100": { /* … */ },
  "color.base.blue.200": { /* … */ },
  "color.base.bleu.300": { /* … */ },
  "color.base.blue.400": { /* … */ },
}
```

:::

It would be easy to miss the typo of “bleu!” But by declaring every group name once and only once, you make mistakes impossible.

## Format

You can [find the official format here](https://designtokens.org/TR/2025.10/format/). But for convenience, we also have [a list of token types](/docs/reference/tokens) Terrazzo supports.

## Further Reading

- [Official specification (latest version)](https://designtokens.org/TR/2025.10/format/)
