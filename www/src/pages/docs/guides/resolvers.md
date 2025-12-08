---
title: Resolvers
layout: ../../../../layouts/docs.astro
---

## Resolvers

A [resolver](https://www.designtokens.org/tr/2025.10/resolver) is a meta-file that describes how collections of DTCG tokens relate to one another. In its simplest form, a resolver can flatten multiple tokens JSON files into one. But most of the time resolvers are used to provide contextual token values, such as light/dark mode, color themes, or other complex usecases.

Resolvers are a DTCG standard, and the successor to legacy [modes](/docs/guides/modes) that are only understood by Terrazzo/Cobalt.

## Writing a resolver

You can think of a resolver as an “entry” file to your tokens, similar to an entry file to a bundler like webpack or Rollup. A resolver describes how all of your tokens should be collated, or _resolved_, into a final set.

### Name, version, and description

The first step is naming your resolver and declaring the `version` of the specification. There’s only one valid version: `2025.10`. This is reserved for future versions.

You may also optionally declare a `description` to add additional detail, but it’s not necessary.

:::code-group

```json [my-ds.resolver.json]
{
  "name": "My DS",
  "description": "v2.1 of the design system",
  "version": "2025.10"
}
```

:::

### Sets

A set is any arbitrary group of tokens that are meaningful to you. To some folks they may want to separate [primitive, semantic, and component tokens](https://thedesignsystem.guide/design-tokens) into different sets. For others, they may want to separate different categories of tokens such as colors, typography, and spacing tokens into individual sets. There’s no wrong answer! In many cases, you’ll just start off with a single set, and break it out when it grows too large.

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

### Modifiers

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
        "dark-high-contrast": [{ "$ref": "./theme/dark-hc.json" }]
      }
    },
    "breakpoint": {
      "description": "Responsive size",
      "contexts": {
        "sm": [
          { "$ref": "./breakpoint/sm.json" },
          { "$ref": "./typography/sm.json" }
        ]
        "md": [],
        "lg": [
          { "$ref": "./breakpoint/lg.json" },
          { "$ref": "./typography/lg.json" }
        ],
      },
      "default": "md"
    }
  }
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

## FAQ

### Do I have to have my tokens in multiple files?

No! You can actually have one `.resolver.json` file that declares all of your tokens, sets, and modifiers with no external references. See the [bundling guide](https://www.designtokens.org/tr/2025.10/resolver/#bundling) in the specification for more info.

### Is a resolver required now?

No. But a resolver is required whenever you have contextual values such as themes or color modes.
