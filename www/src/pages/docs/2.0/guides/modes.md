---
title: Modes + Theming
layout: ../../../../layouts/docs.astro
---

# Modes + Theming

:::note
As of Dec 2024, the DTCG spec is in the process of reviewing a new proposal that can tackle modes and theming at a greater scale. These docs outline the approach that Terrazzo pioneered in 2021, and still supports today. [See the Resolver Proposal section](#dtcg-resolver-proposal) to learn more.
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

## DTCG Resolver proposal

The [Resolver proposal](https://resolver-spec.netlify.app/info/rationale/) is a currently-under-review proposal that is the next iteration on the modes idea. It keeps all of the functionality, while solving for additional problems in an elegant and performant way. While this modes approach was pioneered by Cobalt in 2021, and Figma Variables took the same approach, there were some problems left to be solved by this method.

### Response to modes

This section is a background of why the Resolver proposal was sought due to limitations with modes.

#### Problem 1: multi-axis modes

The main problem with modes is that in many ways they can only represent one axis. This is why many systems, including Figma Variables, represent the values in a table—rows represent tokens, columns represent modes. But what if you need “columns” in a different dimension?

Consider GitHub’s color example just above—you have light and dark mode, and high contrast and colorblind modes. You could interpret those as 2 “axes:” theme and diminished color vision. Though it’s possible to manage those with modes, you have to calculate every permutation of both axes, which results in a _lot_ of tokens to manage. Multiply that across your entire design system, and you [just have a headache](https://www.youtube.com/watch?v=-qlAjXbbn6k).

#### Problem 2: fallbacks

Continuing the same train of thought, say along the diminished color vision axis, many modes shared several values. You would have to redeclare and duplicate those values over-and-over again, since modes only allow for a single default fallback\*. The Resolver proposal allows you, for every axis, to declare the fallback order, so you can create more of a “tree” of tokens.

While that may sound more complex, in practice it results in an exponentially-reduced number of tokens to manage. And allows you to more-easily scale your design system, because you “opt in” to complexity, rather than having to engineer your way out of day 1 complexity.

:::note

Terrazzo 1.0 (Cobalt) experimented with a way to use modes in aliases (`{token.foo#mode}`), but the value was ambiguous! Saying “pretend we’re in mode X while we’re in mode Y” is doable across a single mode. But opening up that can of worms doesn’t stop people from having _those_ alias to other modes as well, and you end up in a state of confusion where neither user nor machine is quite sure what mode to apply if the aliases can jump back-and-forth across multiple modes at any time (_“If everything is a mode, nothing is!“_).

:::

#### Problem 3: which mode when?

The last major problem of modes is that there’s no clear boundary as to what triggers what mode, and when—that is up for you to decide. While there are best practices outlined here, that mechanism is opaque. That can lead to unnecessary complexity when you have “mixed modes,” pulling tokens from multiple modes at once.

While the Resolver Proposal doesn’t fully outline the mode changes in code form, it does do some work of providing stronger “hints” around the mechanisms to load a certain set of tokens. It implements the principles of [functional purity](https://en.wikipedia.org/wiki/Pure_function), and makes it simple to tell given a couple “inputs” (e.g. “light + high contrast” or “dark + deuteranopia”), what the outputs (tokens) will be.

### Resources

So while we’ve outlined some of the shortfalls of modes, the actual syntax is still under editor review and will be shared more in detail later. The current draft version is **able to solve all problems mentioned here, plus some.** But making sure other problems don’t sneak in accidentally, and simplifying the syntax to be as easy-to-use as possible, is still in progress. So rather than go into further detail on the “how,” you can consult the following resources until more is ready to share:

- [Resolver proposal site, with examples](https://resolver-spec.netlify.app/)
- [Resolver proposal early prototype proof of concept](https://0lrskm.csb.app/)

Look forward to hear more about the Resolver proposal in early 2025!
