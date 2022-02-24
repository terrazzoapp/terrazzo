---
title: Modes
layout: ../../../layouts/docs.astro
---

# Modes

Modes are **alternate forms of a token.** Although this isn’t a concept unique to Cobalt, you may not be used to thinking of tokens in this way before.

Modes are somewhat related to “themes” in that as an application may have a **light theme** and a **dark theme**, your color pallette could have a **light mode** and **dark mode** for every color. But modes and theming differ in their scope. Themes are huge, and creating a theme often involves _duplicating all your tokens and modifying almost every one._ Conversely, modes only apply to small groups of tokens, and are easy to add, remove, or modify.

Two examples of modes can be found below: in the first example, with GitHub’s **color modes**, and further down, with Apple’s Human Interface **typography size modes**.

## Modes in Color

Using modes for your color tokens, you can create multiple themes for your site without having to affect anything else. GitHub’s Primer design system has 6 modes:

- light (default)
- dark
- light (colorblind)
- light (high contrast)
- dark (colorblind)
- dark (high contrast)

<figure>
  <img src="/images/mode-github.png" width="2034" height="1162">
  <figcaption>GitHub’s settings allow not only light and dark modes, but alternate color themes for color blindness.</figcaption>
</figure>

Here’s how that translates into `tokens.json`:

```json
{
  "color": {
    "red4": {
      "$type": "color",
      "$value": "#fa4549",
      "$extensions": {
        "mode": {
          "light": "#fa4549",
          "lightColorblind": "#d08002",
          "lightHighContrast": "#d5232c",
          "dark": "#f85149",
          "darkColorblind": "#c38000",
          "darkHighContrast": "#ff6a69"
        }
      }
    }
  }
}
```

You can see that `color.red_4` still occupies the same place on the palette. But based on the mode, can take on different values to serve users better.

Though not shown, this could also relate to icons as well—based on the color mode selected, icons may either get different colors, or different stroke/fill treatments to keep contrast and visibility consistent.

## Modes in Typography

Apple’s Human Interface guidelines outline a user size preference. If users need to make the text bigger or smaller, they can adjust to their taste. But how does that apply to the existing typographic stack (e.g. Heading, Body, Title 1, Title 2 … )?

<figure>
  <img src="/images/mode-apple.png" width="1562" height="898">
  <figcaption>Apple’s dynamic text sizes use modes to control multiple type scales</figcaption>
</figure>

Here’s how `type.size.title1` could be represented in `tokens.json`:

```json
{
  "size": {
    "title1": {
      "$name": "Title 1",
      "$type": "dimension",
      "$value": "28px",
      "$extensions": {
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
}
```

Using modes, it’s much easier to preserve typographic hierarchy through a wide range of base text sizes (and you could even make individual adjustments as well).

## Checking modes

Sometimes you may want to check that all modes exist for a group. You can assert type checking with `metadata.requiredModes`:

```json
{
  "color": {
    "$extensions": {
      "requiredModes": ["light", "lightColorblind", "lightHighContrast", "dark", "darkColorblind", "darkHighContrast"]
    },
    "red-4": {
      "$type": "color",
      "$value": "#fa4549",
      "$extensions": {
        "mode": {
          "light": "#fa4549",
          "lightColorblind": "#d08002",
          "lightHighContrast": "#d5232c",
          "dark": "#f85149",
          "darkColorblind": "#c38000"
        }
      }
    }
  }
}
```

In the above example, we’d have an error on our `red-4` color because the `dark-high-contrast` mode is missing.

## Additional thoughts

These are just a few common examples of modes, but modes aren’t limited to these examples. Any time a user setting should produce alternate versions of a token, consider using a mode.

You want to use a mode when **2 versions should never be used together.** Back to GitHub’s color modes example, we never want to use a non-colorblind-friendly green while in colorblind mode. We want to _only_ use colorblind-friendly modes in colorblind mode. Modes help us isolate those values (keeping in mind, though, that we can simply omit certain modes if we’d like to use their defaults).

Though using modes may be a new concept, the more you experiment with them and find what works, the more you can unlock the flexibility of your design system without having to manage multiple complete versions of it.
