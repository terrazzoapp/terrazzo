---
title: Resolver Contexts (Themes)
layout: ../../../layouts/docs.astro
---

# Resolver Contexts (Themes)

:::info

Contexts is the successor to [legacy modes](#modes-legacy) introduced way back in 2021. Contexts accomplishes the same purposes of theming but in a better package.

:::

Contexts are a way of expressing alternate values of a token, for example color themes like light mode and dark mode. But they can be used for even more, including, but not limited to:

- Color blindness (protanopia/deuteranopia/tritanopia)
- High contrast mode
- Text size
- Screen size
- Device (mobile/tablet/desktop)

## Setup

The easiest way to consume contexts is to have your JSON tokens separated into different files. For example, let’s say you want to orchestrate **light and dark mode**. You may organize some files like so:

```
tokens/
├── foundation/
│   ├── colors.tokens.json
│   └── layout.tokens.json
└── themes/
    ├── light.tokens.json
    └── dark.tokens.json
```

Let’s say within the `foundation/` folder, everything always gets applied—the `colors.tokens.json` and `layout.tokens.json` are consistent no matter what. But the `themes/light.tokens.json` or `themes/dark.tokens.json` may override some values depending on whether a user is in light or dark mode.

As a simple example, let’s just look at how `color.bg` and `color.text` change between light and dark mode:

:::code-group

```json [foundation/colors.tokens.json]
{
  "color": {
    "gray": {
      "200": {
        "$value": { "colorSpace": "srgb", "components": [0.82, 0.82, 0.82] },
        "$type": "color"
      },
      "900": {
        "$value": { "colorSpace": "srgb", "components": [0.04, 0.04, 0.04] },
        "$type": "color"
      }
    }
  }
}
```

```json [theme/light.tokens.json]
{
  "color": {
    "bg": { "$value": "{color.gray.200}", "$type": "color" },
    "text": { "$value": "{color.gray.900}", "$type": "color" }
  }
}
```

```json [theme/dark.tokens.json]
{
  "color": {
    "bg": { "$value": "{color.gray.900}", "$type": "color" },
    "text": { "$value": "{color.gray.200}", "$type": "color" }
  }
}
```

:::

Note that `light.tokens.json` and `dark.tokens.json` have aliases to tokens that don’t exist in the same file. In other words, they’re **incomplete** and need more context as to the missing tokens. That’s where a [resolver](#resolver) comes in!

## Resolver

Here’s what a [Resolver](/docs/2.0/guides/resolvers/) example for this system could look like:

:::code-group

```jsonc [my-design-system.resolver.json]
{
  "name": "My Design System",
  "version": "2025.10",
  "resolutionOrder": [
    { "$ref": "#/sets/foundation" },
    { "$ref": "#/modifiers/theme" },
  ],
  "sets": {
    "foundation": {
      "sources": [
        { "$ref": "foundation/colors.tokens.json" },
        { "$ref": "foundation/layout.tokens.json" },
      ],
    },
  },
  "modifiers": {
    "theme": {
      "contexts": {
        "light": [{ "$ref": "theme/light.tokens.json" }],
        "dark": [{ "$ref": "theme/dark.tokens.json" }],
      },
    },
  },
}
```

:::

Remember from [the previous guide](/docs/2.0/guides/resolvers/#resolutionorder) how resolution order works:

1. **resolutionOrder** is traversed
1. **#/sets/foundation** is parsed, and the tokens `foundation/colors.tokens.json` and `foundation/layout.tokens.json` are merged in that order.
1. **#/modifiers/theme** is parsed, which contains a “fork” for either light or dark theme, depending on the user’s input.

How you provide that “input” for the modifier depends on the tool. In Terrazzo’s case, that’s usually passed into [plugin options](/docs/integrations/). For example, for the [CSS plugin](/docs/integrations/css/):

:::code-group

```ts [terrazzo.config.ts]
import css from "@terrazzo/plugin-css";

export default {
  plugins: [
    css({
      permutations: [
        {
          input: { tzMode: "light" },
          prepare: (contents) => `:root {\n  ${contents}\n}`,
        },
        {
          input: { tzMode: "dark" },
          prepare: (contents) =>
            `@media (prefers-color-scheme: dark) {\n  :root {\n    ${contents}\n  }\n}`,
        },
      ],
    }),
  ],
};
```

:::

This would then apply the light theme by default (`:root`), and then the dark theme if the user’s system was in dark mode.

:::tip

The context was called `theme` because our modifier lived at `#/modifiers/theme`. We could have named our modifier anything we want. You can also have as many additional modifiers you want (as long as 2 modifiers don’t share the same name).

:::

Inputs will differ by plugin, because the code will differ! How you map contexts to each code output could vary wildly, so be sure to read the documentation for each plugin you’re using.

### Playground

To see more examples of how resolvers can work, [**play around with Resolvers in the Playground**](https://www.designtokens.org/playground/)!

## Modes (legacy)

Legacy modes are still supported, if you were using Cobalt 1.0 or Terrazzo beta. In your tokens, you can keep `$extensions.mode`. But just map each context to a special `tzMode` namespace. In this way, you can use both old and new syntax together, without conflicts!

Here’s an example how the options would change for the CSS plugin:

:::code-group

```diff [terrazzo.config.ts]
  import css from "@terrazzo/plugin-css";

  export default {
    plugins: [
      css({
-       modeSelectors: [
-         { selector: ":root", mode: "light" },
-         { selector: "@media (prefers-color-scheme: dark)", mode: "dark" },
+       permutations: [
+         { input: { tzMode: "light" }, prepare: (contents) => `:root {\n  ${contents}\n}` },
+         { input: { tzMode: "dark" }, prepare: (contents) => `@media (prefers-color-scheme: dark) {\n  :root {\n    ${contents}\n  }\n}` },
        ],
      }),
    ],
  };
```

:::

Note that even if we’re not using the new resolver syntax, Terrazzo will simply pretend like we had a secret modifier called `tzMode`.

## Examples

### Multi-brand

When working on a multi-brand system, where you want to have 1 resolver that goes beyond simple light and dark modes, to declaring different themes, and possibly even accessibility enhancements like colorblind and high contrast themes. But still want to use the same tokens.

Naively, you may start out with this initially:

```jsonc
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/resolver.json",
  "version": "2025.10",
  "resolutionOrder": [
    { "$ref": "#/modifiers/color-mode" },
    { "$ref": "#/modifiers/brand" },
  ],
  "modifiers": {
    "color-mode": {
      "contexts": {
        "light": [{ "$ref": "color-mode/light.json" }],
        "dark": [{ "$ref": "color-mode/dark.json" }],
      },
    },
    "brand": {
      "contexts": {
        "a": [{ "$ref": "brand/a.json" }],
        "b": [{ "$ref": "brand/b.json" }],
        "c": [{ "$ref": "brand/c.json" }],
      },
    },
  },
}
```

But putting this into practice, let’s take a single color, say, `color.error`. Let’s say in `#/modifiers/color-mode`, it’s [[oklch 0.7 0.15 30]] in `light`, and [[oklch 0.5 0.15 30]] in `dark`. In `#/modifiers/brand`, let’s say brand `b` adjusts the error color ever-so-slightly to [[oklch 0.68 0.18 35]]. But wait—is that for `light` or `dark` mode? Uh-oh! It looks like you need `b-light` and `b-dark` as different contexts—one modifier is now leaking into the other because they’re both managing the same colors.

You can see how this only gets harder with more modifiers, and more tokens—eventually you want _some_ value for `color.error` to materialize, AND have it respect `color-mode` and `brand`.

✅ The simplest solution is to smush all the color modifiers together:

```jsonc
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/resolver.json",
  "version": "2025.10",
  "resolutionOrder": [{ "$ref": "#/modifiers/theme" }],
  "modifiers": {
    "theme": {
      "contexts": {
        "a-light": [
          { "$ref": "color-mode/light.json" },
          { "$ref": "brand/a.json" },
        ],
        "a-dark": [
          { "$ref": "color-mode/dark.json" },
          { "$ref": "brand/a.json" },
        ],
        "b-light": [
          { "$ref": "color-mode/light.json" },
          { "$ref": "brand/b.json" },
        ],
        "b-dark": [
          { "$ref": "color-mode/dark.json" },
          { "$ref": "brand/b.json" },
        ],
        "c-light": [
          { "$ref": "color-mode/light.json" },
          { "$ref": "brand/c.json" },
        ],
        "c-dark": [
          { "$ref": "color-mode/dark.json" },
          { "$ref": "brand/c.json" },
        ],
      },
    },
  },
}
```

The hard truth is this is _really_ what you’re dealing with underneath—you’re dealing with the same overlaps in the end. But now they are more explicit. Note that we didn’t even have to reorder any files! And we’re **still deduplicating** because we’re referring to the same token files over and over again (referring to the same files—rather than _tokens_—is deduplication!).

Some may be keen to notice that we _may not_ have resolved our original issue just by combining modifiers. We may still have missing colors in some of these contexts. But the important difference is **we now have a mechanism to surgically fix the issue.** If our issue was in `b-dark`, we can modify that one, and only that one. But in the bad example, changing either `#/modifiers/color-mode` or `#/modifiers/brand` may have cascading issues that may have affected other tokens unintentionally.

That’s the power in combining modifiers—making token fixes more surgical, and limiting the blast radius from a single change cascading to the entire system breaking.
