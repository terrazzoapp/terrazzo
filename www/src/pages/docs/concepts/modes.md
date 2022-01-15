---
title: Modes
layout: ../../../layouts/docs.astro
---

# Modes

Modes are **alternate forms of a token.** Although this isn’t a concept unique to Cobalt, you may not be used to thinking of tokens in this way before.

Probably the most common form of modes are “themes,” for example if a website or app has a **light theme** and a **dark theme**. But while themes are modes, modes are also much broader and can be used in other ways as well. For example, on GitHub, enabling
colorblind-friendly colors would constitute a mode. On iOS, adjusting the base text size, which cascades to the whole type scale, is also a form of a mode. Another way of thinking about modes is thinking about meta-collections of tokens that can be toggled
together. Below are 2 examples of modes as they relatea to color and typography:

## Modes in Color

<figure>
  <img src="/images/mode-github.png" width="2034" height="1162">
  <figcaption>GitHub’s settings allow not only light and dark modes, but alternate color themes for color blindness.</figcaption>
</figure>

Here’s one example of how `color.red_4` may be represented in `tokens.json`

```json
{
  "color": {
    "metadata": {
      "requiredModes": ["light", "light_colorblind", "light_high_contrast", "dark", "dark_colorblind", "dark_high_contrast"]
    }
  },
  "red_4": {
    "name": "Red (4)",
    "type": "color",
    "value": "#fa4549",
    "mode": {
      "light": "#fa4549",
      "light_colorblind": "#d08002",
      "light_high_contrast": "#d5232c",
      "dark": "#f85149",
      "dark_colorblind": "#c38000",
      "dark_high_contrast": "#ff6a69"
    }
  }
}
```

You can see that `color.red_4` still occupies the same place on the palette. But based on the mode, can take on different values to serve users better.

Though not shown, this could also relate to icons as well—based on the color mode selected, icons may either get different colors, or different stroke/fill treatments to keep contrast and visibility consistent.

## Modes in Typography

Modes aren’t just used for color; they can be used for typography, too. Apple lets users set the base text size, which then cascades to all typography for apps. In this sense, each font size (e.g. Heading, Body, Title 1, Title 2, Title 3), not only have
their default sizes, but have alternate modes based on the user’s base font size.

<figure>
  <img src="/images/mode-apple.png" width="1562" height="898">
  <figcaption>Apple’s dynamic text sizes use modes to control multiple type scales</figcaption>
</figure>

Here’s how `type.size.title_1` could be represented in `tokens.json`:

```json
{
  "metadata": {
    "requiredModes": ["xSmall", "Small", "Medium", "Large", "xLarge", "xxLarge", "xxxLarge"]
  },
  "size": {
    "title_1": {
      "name": "Title 1",
      "type": "dimension",
      "value": "28px",
      "mode": {
        "xSmall": "25px",
        "Small": "26px",
        "Medium": "27px",
        "Large": "28px",
        "xLarge": "30px",
        "xxLarge": "32px",
        "xxxLarge": "32px"
      }
    }
  }
}
```

This lets a type style be adaptive to user settings rather than managing dozens of values all over the place.

## Additional thoughts

These are just a few common examples of modes, but modes aren’t limited to these examples. Any time a user setting can cascade to multiple token values, you may consider using a mode.

However, it’s important not to go overboard on modes! If any tokens can be used next to one another, those are separate tokens, not a mode. For example, `Heading 1`, `Heading 2`, and `Heading 3` aren’t modes of “Heading;” they’re simply different tokens
because they should all be used together. But a mode would be a user adjusting the base size, where `Heading 1` may be based off the user’s base size.

The longer you work with modes and your design system, the clearer it will be. Until then, experiment! And see what works for you.
