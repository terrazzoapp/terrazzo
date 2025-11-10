---
title: Modes + Theming
layout: ../../../layouts/docs.astro
---

# Modes + Theming

:::note

**Update Oct 2025**: The first stable version, [v2025.10](https://www.designtokens.org/technical-reports/), is live! Among the many updates, DTCG now supports [resolvers](https://www.designtokens.org/tr/2025.10/resolver/) which are the standard way to solve this problem. See the [resolver section](#dtcg-resolvers).

:::

Modes are **alternate values of a token.** Token modes aren’t supported by the DTCG spec yet, but even so are a common part of most design systems. Modes can solve common problems like theming, responsive design, accessibility options, user preference, and more!

## Modes in everyday use

- [Figma Variable modes](https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables)

## Modes for color

An example of using modes is GitHub Primer’s color system that powers themes.

<figure>
  <img src="/assets/github-themes.png" aria-hidden />
  <figcaption>GitHub’s theme switcher menu</figcaption>
</figure>

Currently, GitHub supports the following themes:

1. Light default
2. Light high contrast
3. Light Protanopia & Deuteranopia
4. Light Tritanopia
5. Dark default
6. Dark high contrast
7. Dark Protanopia & Deuteranopia
8. Dark Tritanopia

Consider the complexity of managing those colors across an entire design system of multiple components and multiple platforms (native, web, etc.). We’ll outline a naïve approach of what this looks like with and without modes.

### Without modes

Thinking of just one color in the system (we’ll call it `color.green` for simplicity), a naïve implementation would look like:

:::code-group

```json [tokens.json]
{
  "color": {
    "$type": "color",
    "green-light": { "$value": "#2da44e" },
    "green-light-high-contrast": { "$value": "#117f32" },
    "green-light-protanopia-deuteronopia": { "$value": "#0088ff" },
    "green-light-tritanopia": { "$value": "#0088ff" },
    "green-dark": { "$value": "#2ea043" },
    "green-dark-high-contrast": { "$value": "#09b43a" },
    "green-light-protanopia-deuteronopia": { "$value": "#1585fd" },
    "green-light-tritanopia": { "$value": "#1585fd" }
  }
}
```

:::

And this makes sense, until you start thinking of semantic tokens:

:::code-group

```json [tokens.json]
{
  "button-bg": { "$value": "{color.green-light}" }
}
```

:::

“This doesn’t work,” you say—we need to support all color modes. Suddenly you end up with a mess (inspect the CSS to see something even worse than `tokens.json`):

:::code-group

```css [button.css]
/* button must have theme-aware styles */
.button {
  background: var(--button-bg-light);
}
.color-mode-light-high-contrast .button {
  background: var(--button-bg-light-high-contrast);
}
.color-mode-light-protanopia-deuteranopia .button {
  background: var(--button-bg-light-protanopia-deuteranopia);
}
.color-mode-light-tritanopia .button {
  background: var(--button-bg-light-tritanopia);
}
.color-mode-dark .button {
  background: var(--button-bg-dark);
}
.color-mode-dark-high-contrast .button {
  background: var(--button-bg-dark-high-contrast);
}
.color-mode-dark-protanopia-deuteranopia .button {
  background: var(--button-bg-dark-protanopia-deuteranopia);
}
.color-mode-dark-tritanopia .button {
  background: var(--button-bg-dark-tritanopia);
}
```

```json [tokens.json]
{
  "button-bg-light": { "$value": "{color.green-light}" },
  "button-bg-light-high-contrast": {
    "$value": "{color.green-light-high-contrast}"
  },
  "button-bg-light-protanopia-deuteranopia": {
    "$value": "{color.green-light-protanopia-deuteranopia}"
  },
  "button-bg-light-tritanopia": { "$value": "{color.green-light-tritanopia}" },
  "button-bg-dark": { "$value": "{color.green-dark}" },
  "button-bg-dark-high-contrast": { "$value": "{color.green-high-contrast}" },
  "button-bg-dark-protanopia-deuteranopia": {
    "$value": "{color.green-dark-protanopia-deuteranopia}"
  },
  "button-bg-dark-trianopia": { "$value": "{color.green-dark-tritanopia}" }
}
```

```css [global.css]
:root {
  --color-green-light: #2da44e;
  --color-green-light-high-contrast: #117f32;
  --color-green-light-protanopia-deuteranopia: #0088ff;
  --color-green-light-tritanopia: #0088ff;
  --color-green-dark: #2ea043;
  --color-green-dark-high-contrast: #09b43a;
  --color-green-dark-protanopia-deuteranopia: #1585fd;
  --color-green-dark-tritanopia: #1585fd;
}
```

:::

Keep in mind this is **for a single component, and a single property!** Imagine applying this to dozens of components with dozens of propreties each. Without modes, you exponentially increase the number of tokens you have to manage, and make the mapping from token → component property more complex than it needs to be.

But wait—_it gets worse!_ Lying in wait are even _bigger_ problems with this approach:

1. ❌ **There are no boundaries.** Just because a protanopia token _exists_ doesn’t mean you properly enforce it gets used in the right contexts. Further, there’s nothing stopping colorblind and non-colorblind tokens from being mixed together in unexpected (non-accessible) ways
2. ❌ **Components are overloaded with responsibility.** Components can’t simply use `color.green`; every component has to be aware of user color preferences (since all components use color). Which balloons in technical complexity.
3. ❌ **Brittle.** This requires so much manual effort in thousands of component property mappings, there are bound to be mistakes in implementation.

### With modes

Modes can clean all this up by associating multiple modes with a single token:

:::code-group

```css [button.css]
.button {
  background: var(--button-bg);
}
```

```json [tokens.json]
{
  "color": {
    "$type": "color",
    "green": {
      "$value": "#2da44e",
      "$extensions": {
        "mode": {
          "light": "#2da44e",
          "light-high-contrast": "#117f32",
          "light-protanopia-deuteronopia": "#0088ff",
          "light-tritanopia": "#0088ff",
          "dark": "#2ea043",
          "dark-high-contrast": "#09b43a",
          "light-protanopia-deuteronopia": "#1585fd",
          "light-tritanopia": "#1585fd"
        }
      }
    }
  },
  "button-bg": { "$value": "{color.green}" }
}
```

```css [global.css]
:root {
  --color-green: #2da44e;
  --button-bg: var(--color-green);
}
.color-mode-light-high-contrast {
  --color-green: #117f32;
}
.color-mode-light-protanopia-deuteranopia {
  --color-green: #0088ff;
}
.color-mode-light-tritanopia {
  --color-green: #0088ff;
}
.color-mode-dark {
  --color-green: #2ea043;
}
.color-mode-dark-high-contrast {
  --color-green: #09b43a;
}
.color-mode-dark-protanopia-deuteranopia {
  --color-green: #1585fd;
}
.color-mode-dark-tritanopia {
  --color-green: #1585fd;
}
```

:::

This is more than just a simple rearranging; it consolidates 8 color modes into 1 token that solves all the following problems:

1. ✅ **Simplified mapping.** Components don’t have to take on the complex mapping between color themes and properties; they simply refer to the core tokens and the rest is handled automatically.
1. ✅ **Reduced component burden.** Components just have to refer to that `color.green` token, and no longer have to know anything about user color preferences.
1. ✅ **Automatically correct context.** Color values are enforced to be their correct values form a single, central place (rather than thousands of component properties). You’re no longer in danger of mixing colorblind tokens with non-colorblind tokens, or light and dark, etc.

## Modes for typography

Another common usecase for modes is typographic sizes. Typography sizes are one of the most frequently-adjusted user preferences (both for accessibility reasons as well as personal preference). And modes make managing this much easier.

<figure>
  <img src="/assets/apple-hig-typography.png" aria-hidden />
  <figcaption>Apple’s Human Interface Guidelines typographic size table</figcaption>
</figure>

### Without modes

Just as with colors, we run into the exact same problem—if we have 1 token _per size_, then all of our components have to have deep-awareness of all themes and user preferences, and we have to maintain hundreds (if not thousands) of mappings from tokens → component properties.

:::code-group

```css [heading.css]
/* heading must have theme-aware styles */
.heading {
  font-size: var(--typography-size-title1-large);
}
.type-mode-xsmall .heading {
  font-size: var(--typography-size-title1-xsmall);
}
.type-mode-small .heading {
  font-size: var(--typography-size-title1-small);
}
.type-mode-medium .heading {
  font-size: var(--typography-size-title1-medium);
}
.type-mode-large .heading {
  font-size: var(--typography-size-title1-large);
}
.type-mode-xlarge .heading {
  font-size: var(--typography-size-title1-xlarge);
}
.type-mode-xxlarge .heading {
  font-size: var(--typography-size-title1-xxlarge);
}
.type-mode-xxxlarge .heading {
  font-size: var(--typography-size-title1-xxxlarge);
}
```

```json [tokens.json]
{
  "typography": {
    "size": {
      "$type": "dimension",
      "title1-xSmall": { "$value": "25px" },
      "title1-Small": { "$value": "26px" },
      "title1-Medium": { "$value": "27px" },
      "title1-Large": { "$value": "28px" },
      "title1-xLarge": { "$value": "30px" },
      "title1-xxLarge": { "$value": "32px" },
      "title1-xxxLarge": { "$value": "32px" }
    }
  }
}
```

```css [global.css]
:root {
  --typography-size-title1-xsmall: 25px;
  --typography-size-title1-small: 26px;
  --typography-size-title1-medium: 27px;
  --typography-size-title1-large: 28px;
  --typography-size-title1-xlarge: 30px;
  --typography-size-title1-xxlarge: 32px;
  --typography-size-title1-xxxlarge: 32px;
}
```

:::

### With modes

Also as with colors, modes dramatically reduces the overall number of tokens we have to manage, without also foregoing all the user preferences and accessibility features we’re supporting. It just moves the complexity into a more-easily-managed, central location:

:::code-group

```css [heading.css]
.heading {
  font-size: var(--typography-size-title1);
}
```

```json [tokens.json]
{
  "typography": {
    "size": {
      "$type": "dimension",
      "title1": {
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
}
```

```css [global.css]
:root {
  --typography-size-title1: 27px;
}
.type-mode-xsmall {
  --typography-size-title1: 25px;
}
.type-mode-small {
  --typography-size-title1: 26px;
}
.type-mode-medium {
  --typography-size-title1: 27px;
}
.type-mode-large {
  --typography-size-title1: 28px;
}
.type-mode-xlarge {
  --typography-size-title1: 30px;
}
.type-mode-xxlarge {
  --typography-size-title1: 32px;
}
.type-mode-xxxlarge {
  --typography-size-title1: 32px;
}
```

:::

## Best practices

A mode is best used for 2 variations that are never used together.

Back to the color example, if a user has requested high contrast colors, we’d never want to show them the default (non-high contrast) green; we’d want to preserve their preferences.

So following that, here are some common scenarios for when modes should—or shouldn’t—be used.

### ✅ Do

Do use modes for when a user can’t be in 2 contexts on the same page:

- User preferences (e.g. text size, reduced motion, colorblind mode)
  0- Device (e.g. mobile or desktop)
- Region/language
- Product/application area (e.g. marketing site vs dashboard UI)

### ❌ Don’t

Don’t use modes for things that can be used on the same page:

- Semantic color (e.g. success or error)
- Localized state (e.g. disabled or active)
- Color shades/hues
- Components (e.g. Card or Button)

## DTCG Resolvers

In Oct 2025, about 4 years after Cobalt pioneered the modes approach in 2021, DTCG has decided [resolvers](https://www.designtokens.org/tr/2025.10/resolver/) will be the way forward to solve this. Resolvers were suggested by Tokens Studio folks, taking into account Terrazzo modes and dozens of other implementations, while solving some of the problems (in fact, the Terrazzo team worked on this as well!).

Namely, the following problems are solved by using a resolver instead of Terrazzo modes:

1. **Fallbacks**: this is the main one. Say you have a `dark-protanopia` mode that’s not available for some tokens. How do you specify you want to fall back to `dark` mode, not `light`? With a resolver you can!
2. **Duplication**: another way of framing the previous problem, was that you had to duplicate values over and over again so all modes had 100% coverage. But resolvers require only _unique_ values, resulting in smaller, simpler systems.
3. **Semantics**: Terrazzo modes all coexist in the same space, for instance `light` and `large` may conflict when they should have nothing to do with each other. A resolver has separate “swimlanes” where those would be associated with `theme` and `size` respectively, keeping intent and application clearer.

However, the resolver spec _does not_ solve a problem where multiple contexts all fight over the same token—that, ultimately is up to decisions and architecture you make that allows that to be possible.

As of Nov 2025, Terrazzo is actively working on supporting resolvers, as well as the full v2025.10 version of DTCG, in Terrazzo’s first stable release. Stay tuned!
