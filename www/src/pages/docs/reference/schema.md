---
title: tokens.yaml Specification
layout: ../../../layouts/docs.astro
---

# Cobalt Schema Specification v0 Beta

The Cobalt schema is a unique spec. Though it’s heavily inspired by [the W3C Design Tokens Community Group](https://github.com/design-tokens/community-group) spec, the

## Document root

The top level of `tokens.yaml` contains information about the file. It may contain the following keys:

| Key        |   Required   | Description                                                                                                                       |
| :--------- | :----------: | :-------------------------------------------------------------------------------------------------------------------------------- |
| `name`     |              | The name of your tokens or design system                                                                                          |
| `version`  |              | Cobalt version (currently `0.1`). Not required in beta, but will be for versions `1.0` and greater.                               |
| `metadata` |              | Arbitrary user data. Metadata isn’t read or used by Cobalt. But you can store notes, links, or any other data in here you’d like. |
| `tokens`   | **required** | An object of tokens (see [Tokens](#tokens))                                                                                       |

#### Example

```yaml
name: My Tokens
metadata:
  documentation_url: https://tokens.dev/docs
  foo: 123
tokens:
  # …
```

## Tokens

[Tokens] are the fundamental building blocks of your design system, and typically include colors, typography, and other values.

#### Properties

The following properties are shared among all token types

| Key           | Description                                                             |
| :------------ | :---------------------------------------------------------------------- |
| `type`        | The type of token ([see “types” below](#types))                         |
| `value`       | The token’s value. This differs based on `type`.                        |
| `name`        | (optional) A human-readable name for this token                         |
| `description` | (optional) A longer description about this token’s purpose, usage, etc. |

#### Types

| `type`            | Description                                                                                 | Origin                                                                                           |
| :---------------- | :------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------- |
| `color`           | A color represented in hexadecimal                                                          | [W3C Design Tokens CG][color]                                                                    |
| `dimension`       | A size in UI (e.g. `8px` or `2.5rem`                                                        | [W3C Design Tokens CG][dimension]                                                                |
| `font`            | A font name (e.g. `Vulf Mono`)                                                              | [W3C Design Tokens CG][font]                                                                     |
| `cubic-bezier`    | An easing curve for animation                                                               | [W3C Design Tokens CG](https://design-tokens.github.io/community-group/format/#cubic-bezier)     |
| `file`            | A local file on the file system (e.g. `./icons/alert.svg`)                                  | Cobalt                                                                                           |
| `url`             | A remote URL (e.g. `https://mycdn.com/image.jpg`)                                           | Cobalt                                                                                           |
| `shadow`          | A drop shadow, inner shadow, or text shadow to be applied on anything that accepts shadows. | Cobalt                                                                                           |
| `linear-gradient` | A [linear-gradient]                                                                         | Cobalt                                                                                           |
| `radial-gradient` | A [radial-gradient]                                                                         | Cobalt                                                                                           |
| `conic-gradient`  | A [conic-gradient]                                                                          | Cobalt                                                                                           |
| (other)           | Any other value is treated as a [custom type](#custom-type)                                 | [W3C Design Tokens CG](https://design-tokens.github.io/community-group/format/#additional-types) |

### Color

A color represented in hexadecimal. For transparency, 8-digit hex codes are accepted as well ([docs][color])

**Example**

```yaml
tokens:
  color:
    red:
      type: color
      value: "#fa4549"
```

### Dimension

A unit of measurement ([docs][dimension]).

```yaml
tokens:
  space:
    s:
      type: dimension
      value: 8px
    m:
      type: dimension
      value: 16px
    l:
      type: dimension
      value: 32px
```

_Note: the [Design Tokens Spec][dimension] currently restricts dimension to `px` or `rem`. Cobalt intentionally avoids this restriction._

### Font

A font family name, expressed either as a string, or as an array from most- to least-preferred ([docs][font]).

```yaml
tokens:
  font:
    Graphik_Regular:
      type: font
      value: Graphik Regular
    Graphik_Italic:
      type: font
      value: Graphik Italic
    Graphik_Bold:
      type: font
      value: Graphik Bold
    Graphik_Bold_Italic:
      type: font
      value: Graphik Bold Italic
    body:
      type: font
      value:
        - Graphik Regular
        - system-ui
        - sans-serif
```

### Cubic bézier

An animation easing curve, expressed as [𝑥1, 𝑦1, 𝑥2, 𝑦2] ([docs][cubic-bezier]).

```yaml
tokens:
  easing:
    sine:
      type: cubic-bezier
      value: [0.5, 0, 0.5, 1]
    ease_in:
      type: cubic-bezier
      value: [0.5, 0, 1, 0.5]
    ease_out:
      type: cubic-bezier
      value: [0, 0.5, 0.5, 1]
```

### File

A relative path to a file (could be on disk, or locally on the server).

```yaml
tokens:
  icon:
    alert:
      type: file
      value: ./icons/alert.svg
    arrow_right:
      type: file
      value: ./icons/arrow-right.svg
    docs:
      type: file
      value: ./icons/docs.svg
```

### URL

A link to a remote URL. Must begin with `http://` or `https://`.

```yaml
tokens:
  img:
    profile_pablo:
      type: url
      value: https://imagedelivery.net/ZWd9g1K7eljCn_KDTu_OWA/profile_pablo.jpg
    profile_sarah:
      type: url
      value: https://imagedelivery.net/ZWd9g1K7eljCn_KDTu_OWA/profile_sarah.jpg
```

### Shadow

An array of CSS shadows. Could be used with [box-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow), [text-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow), or any other shadow.

**Example**

```yaml
tokens:
  shadow:
    card_near:
      type: shadow
      value:
        - "0 1px 1px #0000000c"
        - "0 2px 2px #0000000c"
        - "0 4px 4px #0000000c"
        - "0 8px 8px #0000000c"
```

### Linear gradient

A CSS [linear gradient][linear-gradient].

**Example**

```yaml
tokens:
  gradient:
    lighten:
      type: linear-gradient
      value: "135deg, #000000ff, #00000000"
    rainbow:
      type: linear-gradient
      value: "to right top, #ff0000 0%, #ffa500 14%, #ffd700 29%, #7cfc00 43%, #00ffff 57%, #4169e1 71%, #9400d3 86%, #ff00ff 100%"
```

### Radial gradient

A CSS [radial gradient][radial-gradient].

**Example**

```yaml
tokens:
  gradient:
    pink:
      type: radial-gradient
      value: "ellipse at center center, #fd5353, #d04dd9"
```

### Conic gradient

A CSS [conic gradient][conic-gradient].

**Example**

```yaml
tokens:
  gradient:
    pinwheel:
      type: conic-gradient
      value: "from 5deg, #ff0000 0deg, #ffa500 72deg, #ffff00 144deg, #008000 216deg, #0000ff 360deg"
```

### Custom types

Any other `type` value will be treated as a custom type. It has no restrictions other than `type` and `value` being required. `value` may have any shape desired; it won’t be validated.

```yaml
tokens:
```

_Should a type be added? [Please open an issue!](https://github.com/drwpow/cobalt-ui/issues/new)_

### Group

A group is a way to collect similar tokens. A group is made by omitting `type:`. A group only has one reserved name: `modes`. Children can be named anything other than `modes`.

| Property | Type       | Description                                          |
| :------- | :--------- | :--------------------------------------------------- |
| `modes`  | `string[]` | (optional) Array of [modes] that apply to all tokens |

_Note: unlike tokens, Groups can’t have a `name` or `description`. Those will be treated as if they are tokens._

**Example**

In this example, both `color` and `font` are groups, as they don’t have a `type`. But `font` also has a subgroup: `family`. Groups can be nested infinitely, as long as they’re not inside tokens.

```yaml
tokens:
  color:
    red:
      type: color
      value: "#fa4549"
  font:
    family:
      Graphik_Regular:
        type: font
        value: Graphik Regular
```

## Reusing values (aliasing)

Reusing another value can be done by declaring another ID for `value`, prefixed with `$`:

```yaml
tokens:
  space:
    l:
      type: dimension
      value: 32px
  text:
    heading:
      padding-top:
        type: dimension
        value: $space.l
```

Here, `text.heading.padding-top` reuses the value from `space.l`. When the base value updates, so will the alias.

Note that **tokens must be of the same type to reuse values.** Reusing values may also be done for [Modes](#modes), too, but all modes must be redeclared (otherwise they may cause conflicts or unpredictable behavior).

To alias modes, use the `#` character followed by the mode:

```yaml
tokens:
  color:
    blue:
      type: color
      value: '#218bff'
      mode:
        light: '#218bff'
        dark: '#388bfd'
    action:
      type: color
      value: $color.blue
      mode:
        light: $color.blue#light
        dark: $color.blue#dark
```

## Modes

[Modes] are alternate versions of your tokens. For example, say your design system has a **standard** palette and an alternate version optimized for **colorblind** users. Here’s one way you could declare that:

```yaml
# ❌ Mixing "standard" and "colorblind" palettes
tokens:
  red:
    type: token
    value:
      default: "#cf222e"
  red_colorblind:
    type: token
    value:
      default: "#ac5e00"
```

This _works_ but has several problems:

- ❌ multiple palettes are mixed into one
- ❌ this suggests `red` and `red_colorblind` should be used alongside one another (defeating the whole purpose!)
- ❌ it’s unclear what the purpose of `red_colorblind` is, and will likely be avoided by engineers

To address all these, let’s use modes instead:

```yaml
# ✅ Separating palettes into modes
tokens:
  group:
    type: color
    modes:
      - standard
      - colorblind
    tokens:
      red:
        type: token
        value:
          default: "#cf222e"
          standard: "#cf222e"
          colorblind: "#ac5e00"
```

This is much better:

- ✅ palettes are kept separate
- ✅ when `colorblind` mode is enabled, it prevents standard red from being used
- ✅ in code, switching from `standard` to `colorblind` mode automatically creates the palette

There’s a lot of flexibility you can unlock with modes. [Read more about using modes][concepts-modes]

### Optional syntax

Adding all your tokens into `tokens.yaml` can result in a lot of noise. So if desired, you can take advantage of some optional space savers:

#### Ordered modes

In cases where modes have a logical order (e.g. sizes), you can turn an object of values into an array (with `default` first, followed by modes:)

```diff
  tokens:
    font:
      modes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      size:
        type: dimension
-       value: 16px
-       mode:
-         XS: 10
-         S: 12
-         M: 16
-         L: 18
-         XXL: 22
+       mode: [16, 10, 12, 16, 18, 22]
```

_Note: it’s best to avoid flattening modes when they don’t have a logical order, such as color modes._

## Examples

[View examples of `tokens.yaml` on GitHub][examples]

[box=shadow]: https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow
[color]: https://design-tokens.github.io/community-group/format/#color
[concepts-tokens]: /docs/concepts/tokens
[conic-gradient]: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient()
[cubic-bezier]: https://design-tokens.github.io/community-group/format/#cubic-bezier
[dimension]: https://design-tokens.github.io/community-group/format/#dimension
[examples]: https://github.com/drwpow/cobalt-ui/blob/main/examples/
[font]: https://design-tokens.github.io/community-group/format/#font
[gradient]: https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Gradients
[jsonschema]: https://json-schema.org/
[linear-gradient]: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient()
[modes]: /docs/concepts/modes
[openapi]: https://swagger.io/specification/
[plugins]: /docs/plugins
[radial-gradient]: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient()
[repeating-linear-gradient]: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/repeating-linear-gradient()
[repeating-radial-gradient]: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/repeating-radial-gradient()
[text-shadow]: https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow
