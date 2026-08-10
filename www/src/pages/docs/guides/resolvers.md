---
title: Resolvers & Theming
layout: ../../../layouts/docs.astro
---

## Resolvers

A [resolver](https://www.designtokens.org/tr/2025.10/resolver) is the new way to describe your whole tokens system, including theming and alternate versions of tokens.

Resolvers are a DTCG standard, and the successor to legacy [modes](/docs/guides/modes) that are only understood by Terrazzo/Cobalt.

## Quickstart

Let’s say you want to orchestrate **light and dark mode**. You may organize some files like so:

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

```jsonc [foundation/colors.tokens.json]
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/format.json",
  "color": {
    "gray": {
      "200": {
        "$value": { "colorSpace": "srgb", "components": [0.82, 0.82, 0.82] },
        "$type": "color",
      },
      "900": {
        "$value": { "colorSpace": "srgb", "components": [0.04, 0.04, 0.04] },
        "$type": "color",
      },
    },
  },
}
```

```jsonc [foundation/layout.tokens.json]
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/format.json",
  "space": {
    "0": { "$value": { "value": 0, "unit": "rem" }, "$type": "dimension" },
    "xs": { "$value": { "value": 0.125, "unit": "rem" }, "$type": "dimension" },
    "s": { "$value": { "value": 0.25, "unit": "rem" }, "$type": "dimension" },
    "m": { "$value": { "value": 0.5, "unit": "rem" }, "$type": "dimension" },
    "l": { "$value": { "value": 1, "unit": "rem" }, "$type": "dimension" },
    "xl": { "$value": { "value": 2, "unit": "rem" }, "$type": "dimension" },
  },
}
```

```jsonc [theme/light.tokens.json]
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/format.json",
  "color": {
    "bg": { "$value": "{color.gray.200}", "$type": "color" },
    "text": { "$value": "{color.gray.900}", "$type": "color" },
  },
}
```

```jsonc [theme/dark.tokens.json]
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/format.json",
  "color": {
    "bg": { "$value": "{color.gray.900}", "$type": "color" },
    "text": { "$value": "{color.gray.200}", "$type": "color" },
  },
}
```

:::

Note that `light.tokens.json` and `dark.tokens.json` have aliases to tokens that don’t exist in the same file. In other words, they’re **incomplete** and need more context as to the missing tokens. That’s where a resolver comes in!

:::code-group

```jsonc [my-design-system.resolver.json]
{
  "$schema": "https://www.designtokens.org/schemas/2025.10/resolver.json",
  "name": "My Design System",
  "version": "2025.10",
  "resolutionOrder": [{ "$ref": "#/sets/foundation" }, { "$ref": "#/modifiers/theme" }],
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

Here’s how the tokens get resolved into their final values:

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
          input: { theme: "light" },
          prepare: (contents) => `:root {\n  ${contents}\n}`,
        },
        {
          input: { theme: "dark" },
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

### Playground

To see more examples of how resolvers can work, [**play around with Resolvers in the Playground**](https://www.designtokens.org/playground/)!

## Syntax

A resolver file is typically designated with a `.resolver.json` syntax, and contains the following properties:

### name, version, and description

`name` is the name of your DS. This is the human-readable name of your system.

`version` has only one possible value: `2025.10`. This is reserved for future versions. _Note: this is the version of the resolver schema, NOT the version of your DS!_

`description` is optional, but can be used to provide additional information such as which version the design system is on.

:::code-group

```json [my-ds.resolver.json]
{
  "name": "My DS",
  "description": "v2.1 of the design system",
  "version": "2025.10"
}
```

:::

### sets

A set is any group of tokens that **don’t have alternate values** that compose the base version of the design system. If you want to place all your base tokens into a single set, that’s fine. If you want to break them up into multiple. Sets are really only semantically-meaningful groups to you.

A good rule of thumb is simply start off with a single set, and break it up if it grows too large.

You declare a set by making an entry in the `sets` object, and pointing to the JSON files it comprises:

:::code-group

```jsonc [my-ds.resolver.json]
{
  "name": "My DS",
  "version": "2025.10",
  "sets": {
    "colors": {
      "description": "Color ramps and gradients",
      "sources": [
        { "$ref": "colors/ramps.tokens.json" },
        { "$ref": "colors/semantic.tokens.json" },
      ],
    },
    "typography": {
      "sources": [{ "$ref": "typography/fonts.tokens.json" }],
    },
    "sizing": {
      "description": "Margin, padding, and layout values",
      "sources": [
        { "$ref": "sizing/layout.tokens.json" },
        { "$ref": "sizing/breakpoints.tokens.json" },
        { "$ref": "sizing/padding.tokens.json" },
      ],
    },
  },
}
```

:::

In this example, we have 3 sets:

1. `colors`
1. `typography`
1. `sizing`

The order within the `sets` object does NOT matter—we’ll determine a final ordering within [resolutionOrder](#resolutionOrder). But the order within `sources` _DOES_. In case of a conflict, the occurrence of a token last in the array takes precedence.

For every set you may also optionally add a `description` but this isn’t required.

:::tip

`$ref` can be used to point anywhere! This can point to a remote file, _part_ of a remote file, another URL, or even a point in the same document. [Learn more](https://www.designtokens.org/tr/2025.10/resolver/#reference-objects).

:::

### modifiers

Modifiers, like sets, group tokens into meaningful groups. But they also allow for conditional values, where tokens resolve to different values in different contexts.

Each modifier has a `contexts` map that maps a condition to the tokens that get applied as a result.

:::code-group

```jsonc [my-ds.resolver.json]
{
  "name": "My DS",
  "version": "2025.10",
  "sets": {
    // …
  },
  "modifiers": {
    "theme": {
      "description": "Color theme",
      "contexts": {
        "light": [],
        "dark": [{ "$ref": "./theme/dark.json" }],
        "light-high-contrast": [{ "$ref": "./theme/light-hc.json" }],
        "dark-high-contrast": [{ "$ref": "./theme/dark-hc.json" }],
      },
    },
    "breakpoint": {
      "description": "Responsive size",
      "contexts": {
        "sm": [{ "$ref": "./breakpoint/sm.json" }, { "$ref": "./typography/sm.json" }],
        "md": [],
        "lg": [{ "$ref": "./breakpoint/lg.json" }, { "$ref": "./typography/lg.json" }],
      },
      "default": "md",
    },
  },
}
```

:::

In this example, we have 2 modifiers:

1. `theme`: has `light`, `dark`, `light-high-contrast`, and `dark-high-contrast` contexts.
1. `breakpoint`: has `sm`, `md` (default), and `lg` contexts.

For each modifier, **only 1 context can be activated at any time.** A consumer of this must specify one value for every modifier declared (unless that modifier declares a `default` context, which is optional; in our example, `breakpoint` declares `md` to be the default).

### resolutionOrder

The final piece of the puzzle is the resolution order. This is the top-level ordering of the final result, and declares which order the sets and modifiers get combined in.

:::code-group

```jsonc [my-ds.resolver.json]
{
  "name": "My DS",
  "version": "2025.10",
  "sets": {
    // …
  },
  "modifiers": {
    // …
  },
  "resolutionOrder": [
    { "$ref": "#/sets/colors" },
    { "$ref": "#/sets/sizing" },
    { "$ref": "#/sets/typography" },
    { "$ref": "#/modifiers/breakpoint" },
    { "$ref": "#/modifiers/theme" },
  ],
}
```

:::

Note that the order that sets and modifiers were originally declared in is arbitrary; this is the ordering that actually matters in the end. The order ultimately affects overrides, where in case of conflict, items later in the array will override any tokens that came before them.

Another way to look at this is `#/sets/[name]` and `#/modifiers/[name]` are the “dictionaries” to pull from, and `resolutionOrder` is the merge order of those dictionaries into one final result.

:::tip

Most of the time, modifiers come after sets, because conditional values almost always mean to override unconditional ones. Some systems may have some exceptions, of course, but in most systems, modifiers come at the end, and sets at the beginning.

:::

### Permutations

A **permutation** is a unique **output** of a resolver. It is the final values of tokens when you take any input, with defaults filled in. For example, if you had a `theme` modifier that defaulted to `"light"`, and a `text-size` modifier that defaulted to `medium`, then all of the following would result:

| Input                                         | Permutation                                   |
| :-------------------------------------------- | :-------------------------------------------- |
| `{}`                                          | `{ "theme": "light", "text-size": "medium" }` |
| `{ "theme": "light" }`                        | `{ "theme": "light", "text-size": "medium" }` |
| `{ "text-size": "medium" }`                   | `{ "theme": "light", "text-size": "medium" }` |
| `{ "theme": "light", "text-size": "medium" }` | `{ "theme": "light", "text-size": "medium" }` |

Notice how 4 different inputs will yield 1 permutation.

## Orthogonality

Best practice recommends your resolver is **orthogonal,** which is a fancy way of saying **no two modifiers operate on the same tokens.** An example of a non-orthogonal resolver:

```jsonc
{
  // ❌ light.tokens.json exists in 2 different modifiers
  "modifiers": {
    "mode": {
      "contexts": {
        "light": ["color/light.tokens.json"],
        "dark": ["color/dark.tokens.json"],
      },
    },
    "colorblind": {
      "contexts": {
        "default": [],
        "deuteranopia": ["color/light.tokens.json", "color/deuteranopia.tokens.json"],
      },
    },
  },
}
```

If you look closely, you’ll see that `{ mode: 'dark', colorblind: 'deuteranopia' }` could actually produce 2 completely different sets of tokens, depending on `resolutionOrder`:

1. if `mode` gets applied last, then our `deuteranopia` colors will get thrown out because they’ll be overridden by any `dark` colors ❌
2. if `colorblind` gets applied last, then our `dark` colors will get thrown out because they’ll be overridden by `light` and `deuteranopia` colors ❌

Instead, if we combine our color inputs into one modifier, we achieve orthogonality:

```jsonc
{
  // ✅ All colors exist in one modifier
  "modifiers": {
    "theme": {
      "contexts": {
        "light": ["color/light.tokens.json"],
        "light-deuteranopia": ["color/light.tokens.json", "color/light-deuteranopia.tokens.json"],
        "dark": ["color/dark.tokens.json"],
        "dark-deuteranopia": ["color/dark.tokens.json", "color/dark-deuteranopia.tokens.json"],
      },
    },
  },
}
```

Now, there’s only 1 `theme` input to manage, and it doesn’t matter what order `resolutionOrder` defines, it will always output the same value. This makes it **orthogonal**, and reduces footguns.

:::warning

Orthogonality isn’t limited to just filenames! Even declaring the **same token ID** in `a.tokens.json` and `b.tokens.json` in 2 different modifiers violates orthogonality, because that’s the same token. The test is “does the order in which modifiers apply affect the final output?” And if the answer is **yes**, your resolver isn’t orthogonal.

:::

## Transitioning from legacy modes

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

## FAQ

### Do I have to have my tokens in multiple files?

No! You can actually have one `.resolver.json` file that declares all of your tokens, sets, and modifiers with no external references. See the [bundling guide](https://www.designtokens.org/tr/2025.10/resolver/#bundling) in the specification for more info.

### What is best practice for modifiers?

Believe it or not, **one modifier per token `$type` is best.** So having e.g.:

- one modifier for `color` (and `gradient` and `shadow`, extensions of `color`)
- one modifier for `dimension` (and `typography`, which is an extension of `dimension`)
- one modifier for `duration` and `cubicBezier` (and `transition`, an extension of `duration`)
- etc.

Otherwise it’s near-impossible to achieve [orthogonality](#orthogonality) when you have the same token types split across multiple modifiers (technically doable, but hard, and brittle—a minor change could break orthogonality).

```jsonc [my-ds.resolver.json]
{
  "modifiers": {
    // One modifier for light/dark + theme + and high contrast
    "theme": {
      "light-themeA": [],
      "light-themeA-highContrast": [],
      "dark-themeA": [],
      "dark-themeA-highContrast": [],
      "light-themeB": [],
      "light-themeB-highContrast": [],
      "dark-themeB": [],
      "dark-themeB-highContrast": [],
      // …
    },
  },
}
```

Common pushback is “but what about all the duplication, and dealing with [combinatorial explosion](https://en.wikipedia.org/wiki/Combinatorial_explosion)? Wouldn’t it be cleaner to separate it out into multiple modifiers?” But it’s actually not at all—because you’re only _referencing_ token files in modifiers, you’re not dealing with combinatorial explosion directly, only enumerating permutations, which is not the same thing (you would be dealing with combinatorial explosion if you had to restate all values in every context, but you have `{ $ref: … }` to avoid that!).

Put another way, **something** has to deal with all the permutations of the system, _on some level_. You can either obfuscate it, and make that process very hard to reason about. Or you can flatten it like this, and the entire system’s complexity is managed in the easiest, clearest way possible. And it becomes harder to break orthogonality, because it would require a heavy refactor to do so.

### Do I have to use sets?

No! Sets are optional. Some design systems only use [modifiers](#modifiers), and that’s OK.
