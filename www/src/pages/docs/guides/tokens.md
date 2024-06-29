---
title: Design Tokens
layout: ../../../layouts/docs.astro
---

# Design Tokens

Design Tokens are an essential part of managing a design system. But until recently, what shape design tokens took—and how they were managed—varied wildly.

Terrazzo is a project that builds off the [DTCG Tokens Spec](/docs/reference/tokens) to help build a standardized practice around managing & deploying design tokens. In this document, you’ll gain a practical introduction to how Terrazzo views design tokens.

## To standardize, or not?

Whether you view your design tokens as standard or nonstandard will affect whether you use Terrazzo, some other tool, or build your own. Terrazzo takes the same stance as the DTCG format: **design tokens should be standardized.** This means that colors, typography, spacing, and more should be expressed in predictable ways.

The advantage of using a standard tokens format is you can get up-and-running faster because the tooling already exists. But the downside is potentially having restrictions on how your design system thinks about tokens.

Conversely, defining your own custom format can be freeing in some ways, while creating a ton of work and maintenance for your entire design system team. Be sure to weigh the advantages and disadvantages carefully before continuing!

## Starting with DTCG

DTCG encourages having tokens in a central `tokens.json` file (or you can split it up into multiple files if you prefer, e.g. `colors.json`). Inside that file, you’ll create something like the following:

:::code-group

```json [tokens.json]
{
  "color": {
    "$type": "color",
    "core": {
      "blue": {
        "100": {
          "$value": {
            "colorSpace": "oklch",
            "channels": [0.9931, 0.0034, 247.8571]
          }
        },
        "200": {
          "$value": {
            "colorSpace": "oklch",
            "channels": [0.982, 0.0092, 242.8346]
          }
        },
        "300": {
          "$value": {
            "colorSpace": "oklch",
            "channels": [0.9597, 0.0201, 238.6626]
          }
        }
        // …
      }
    }
  }
}
```

:::

You want to organize your tokens into a “tree,” grouping them into specific groups that describe what they do.

In this example, we have a `color → core → blue` hierarchy, within which we have `100`, `200`, `300`, … tokens. These are marked as `$type: "color"` tokens (tokens will take the closest `$type`; you can declare it once on the top-level group to save repetition). And each color declares its color within `$value`.

:::tip

The `$` sign is special, and marks reserved words such as `$type` and `$value`.

:::

Though color tokens are usually the largest part of a design system, you can also use [Dimension](/docs/reference/tokens#dimension) (spacing), [Typography](http://localhost:4321/docs/reference/tokens#typography), [Border](/docs/reference/tokens#border), [and more](/docs/reference/tokens).

Once your tokens are defined as JSON, you can convert your tokens to any language, such as [CSS](/docs/cli/integrations/css), [JS](/docs/cli/integrations/js), and more.
