---
title: tokens.json Manifest
---

# tokens.json

Your `tokens.json` (or `tokens.yaml`) file is a complete manifest of all your design tokens. It follows the [Design Token Format Module (DTFM)](https://www.w3.org/community/design-tokens/), an official standard for describing design tokens.

The format is currently in draft, and being developed by hundreds of design leaders that work at Figma, Adobe, Salesforce, Google, Amazon, Microsoft, Zeplin, Supernova, and more! But despite it still being a draft, it’s still a robust format and is becoming the de-facto standard for design tokens, and many popular design systems [like GitHub Primer](https://primer.style/) either have switched to DTFM or are planning to in the near future.

## DTFM Format

The basic design token consists of a simple JSON object with `$type` and `$value` (required), as well as an optional `$description` (highly-recommended to use to describe the token’s purpose, as well as usage instructions).

::: code-group

```json [JSON]
{
  "tokenName": {
    "$description": "(optional) A description of this token",
    "$type": "[token type]",
    "$value": "[token value - different shape depending on $type]",
    "$extensions": "(optional) Used by third-party tools"
  }
}
```

```yaml [YAML]
tokenName:
  $description: (optional) A description of this token
  $type: '[token type]'
  $value: '[token value - different shape depending on $type]'
  $extensions: (optional) Used by third-party tools
```

:::

Tokens can also be nested infinitely within other groups. A group counts as any arbitrary object wrapping the token (note that `$` prefixes are reserved for tokens, to prevent name conflicts):

::: code-group

```json [JSON]
{
  "groupA": {
    "groupB": {
      "token": {
        "$type": "color",
        "$value": "#000"
      }
    }
  }
}
```

```yaml [YAML]
groupA:
  groupB:
    token:
      $type: color
      $value: '#000'
```

:::

### Managing `tokens.json`

Currently, the only way to manage `tokens.json` is manually. But there are tools to make editing friendlier, such as [JSON Hero](https://jsonhero.io/).

::: tip

The Cobalt team is working on a visual GUI for editing/managing tokens, but it’s not ready yet. We’re planning on announcing it in early 2024.

:::

### Token Types

Within your `tokens.json`, you can use all of the following types of tokens:

- [Color](/tokens/color)
- [Dimension](/tokens/dimension) (can be used for spacing, font size, border width, etc.)
- [Font Family](/tokens/font-family)
- [Font Weight](/tokens/font-weight)
- [Duration](/tokens/duration)
- [Cubic bézier](/tokens/cubic-bezier)
- [Number](/tokens/number)
- [Link](/tokens/link) (for files, extension provided by Cobalt)
- [Stroke Style](/tokens/stroke-style)
- [Border](/tokens/border)
- [Transition](/tokens/transition)
- [Shadow](/tokens/shadow)
- [Gradient](/tokens/gradient)
- [Typography](/tokens/typography)

And in addition to these, you can also [group tokens](/tokens/group) in any hierarchy you’d like, as well as create your own [custom tokens](/tokens/custom).

### Cobalt extensions

Cobalt **is NOT** its own format; it is an implementation of DTFM as close to the spec as possible. However, just for quality of life, Cobalt supports a superset to DTFM, allowing:

- [Addition of a Link token for assets](/tokens/link)
- YAML is supported in addition to JSON
- Wider support for more values are expected, such as:
  - Color: any CSS-valid color is accepted, including [Oklab/Oklch](https://oklch.com) (the spec requires sRGB Hexadecimal)
  - Shadow: arrays of shadows are accepted (the spec only allows one shadow)
  - Typography: any CSS text property is accepted (the spec doesn’t allow things like `font-variant`).
- [Modes](/guides/modes) are allowed.

Any other deviations are considered unintentional. Please [file an issue](https://github.com/drwpow/cobalt-ui/issues) if you run across any!

## JSON or YAML?

Though the original [DTFM spec](https://design-tokens.github.io/community-group/format/) (and most examples) use JSON, Cobalt supports YAML equally well since it’s a 1:1 translation. But since YAML is an easier format to read and write, you may prefer it (the Cobalt maintainers do!). Wherever you see mention of `tokens.json`, know that Cobalt supports `tokens.yaml` equally well; the former is just used as the common term for simplicity.

_Tip: [Boop](https://boop.okat.best/) is a simple, secure tool to convert JSON to YAML in a snap._

## Combining multiple `tokens.json` files

With Cobalt, you can organize your tokens into separate files if you’d like, and they can all be flattened together. Pass in an array to `tokens` in your config:

::: code-group

```js [tokens.config.mjs]
/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: ['./token-src/colors.json', './token-src/typography.json', './token-src/icons.json', './token-src/spacing.json'],
};
```

:::

Note that this will flatten all tokens into one manifest, so you’ll have to handle conflicts if multiple tokens are named the same thing (including their groups).

## Naming / organization

Organization is completely up to you! The DTFM spec allows infinite nesting, and lets you name tokens anything, with the following exceptions:

- Token names or group names can’t …
  - … contain dots (`.`). These are reserved for shorthand IDs (e.g. `color.base.blue.500`).
  - … contain curly braces (`{}`). These are reserved for aliases (e.g. `{color.base.blue.500}`).
  - … start with `$`. These are reserved properties (e.g. `$type`).
- Tokens can’t contain sub-tokens (an object is either a token or a group, but never both).

### Best practices

Based on looking at dozens of design systems, here are a few tips and common patterns that we’ve seen:

- **Favor predictability.** For naming colors, `color.red` is better than `color.crimson`. Expand into more “creative” only after you’ve exhausted the predictable names.
- **Use aliasing.** You can create as many aliases as you’d like. For example, you could set `color.brand.primary`, `color.semantic.action`, and `color.semantic.info` all to `{color.base.blue.500}` and only have to manage one color instead of multiple.
- **Group tokens by type.** Most DSs contain obvious top-level groups such as `color.*`, `border.*`, `font.*`, and `space.*`. As you develop more semantic groups, you can always alias back to these tokens.
- **Dedupe types.** Groups let you set the default `$type` that apply to all children. So set `"$type": "color"` on your `color.*` group once to save typing on all child tokens (this also encourages good organization!).
- **Set descriptions.** Tokens and groups all support adding `$description`s. Take the time to describe how this token should (or shouldn’t) be used!

## Further Reading

- [The official DTFM specification](https://design-tokens.github.io/community-group/format/)
