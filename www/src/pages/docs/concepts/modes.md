---
title: Modes
layout: ../../../layouts/docs.astro
---

# Modes

Modes are **alternate forms of a token.** Although this isn’t a concept unique
to Cobalt, you may not be used to thinking of tokens in this way before.

You’ve probably used **light mode** and **dark mode** for websites and apps.
Those are modes—alternate versions of a cohesive palette. But they can do more
than that, too. GitHub, for example, uses color modes to allow users to view the
site using colorblind-friendly palettes in addition to the typical light and
dark modes:

## Modes in Color

<figure>
  <img src="/images/mode-github.png" width="2034" height="1162">
  <figcaption>GitHub’s settings allow not only light and dark modes, but alternate color themes for color blindness.</figcaption>
</figure>

Here’s one example of how `color.red_4` may be represented in `tokens.yaml`

```yaml
tokens:
  color:
    type: group
    modes:
      - light
      - light_colorblind
      - light_high_contrast
      - dark
      - dark_colorblind
      - dark_high_contrast
    tokens:
      red_4:
        name: Red (4)
        value:
          default: '#fa4549' # default red (light mode)
          light: '#fa4549' # light mode
          light_colorblind: '#d08002' # colorblind theme
          light_high_contrast: '#d5232c' # high contrast theme
          dark: '#f85149' # dark mode
          dark_colorblind: '#c38000' # dark mode (colorblind)
          dark_high_contrast: '#ff6a69' # dark mode (high contrast)
```

You can see that `color.red_4` still occupies the same place on the palette. But
based on the mode, can take on different values to serve users better.

## Modes in Typography

Modes aren’t just used for color; they can be used for typography, too. Apple
lets users set the base text size, which then cascades to all typography for
apps. In this sense, each font size (e.g. Heading, Body, Title 1, Title 2, Title
3), not only have their default sizes, but have alternate modes based on the
user’s base font size.

<figure>
  <img src="/images/mode-apple.png" width="1562" height="898">
  <figcaption>Apple’s dynamic text sizes use modes to control multiple type scales</figcaption>
</figure>

Here’s how `type.size.title_1` could be represented in `tokens.yaml`:

```yaml
tokens:
  type:
    type: group
    modes:
      - xSmall
      - Small
      - Medium
      - Large
      - xLarge
      - xxLarge
      - xxxLarge
    tokens:
      size:
        type: group
        tokens:
          title_1:
            name: Title 1
            value:
              default: 28
              xSmall: 25
              Small: 26
              Medium: 27
              Large: 28
              xLarge: 30
              xxLarge: 32
              xxxLarge: 32

```

This lets a type style be adaptive to user settings rather than managing dozens
of values all over the place.

## More examples

Modes can be used for icons as well, adjusting the detail and relative
proportions for different sizes. Any time a token has an alternate form, that’s
a mode.

However, not everything is a mode. If any tokens should be used at the same
time, those are separate tokens, not a mode. For example, `Heading 1`, `Heading
2`, and `Heading 3` are different tokens as they all may be used at the same
time; they are not modes of one font size.

The longer you work with modes and your design system, the clearer it will be.
Until then, experiment! And see what works for you.
