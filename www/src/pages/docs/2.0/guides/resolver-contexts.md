---
title: Resolver Contexts (Themes)
layout: ../../../../layouts/docs.astro
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
      contextSelectors: [
        { selector: ":root", context: { theme: "light" } },
        {
          selector: "@media (prefers-color-scheme: dark)",
          context: { theme: "dark" },
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

To see more examples of how resolvers can work, [**play around with Resolvers in the Playground**](https://dtcg-resolver-playground.pages.dev)!

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
+       contextSelectors: [
+         { selector: ":root", context: { tzMode: "light" } },
+         { selector: "@media (prefers-color-scheme: dark)", context: { tzMode: "dark" } },
        ],
      }),
    ],
  };
```

:::

Note that even if we’re not using the new resolver syntax, Terrazzo will simply pretend like we had a secret modifier called `tzMode`.
