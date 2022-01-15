---
title: tokens.json Specification
layout: ../../../layouts/docs.astro
---

# Specification

The types outlined here come straight from the [the W3C Design Tokens Community
Group](https://github.com/design-tokens/community-group) schema, but with a few
additions. Things marked with a 🔹 are Cobalt additions on top of the base
schema.

## Group

A group is a way to collect similar tokens. A group is made by omitting `type:`.
A group only has one reserved name: `metadata`. All other properties will be
treated either as tokens or other sub-groups.

| Property                    | Type       | Description                                                          |
| :-------------------------- | :--------- | :------------------------------------------------------------------- |
| `metadata`                  | `object`   | (optional) Place arbitrary metadata on the group                     |
| `metadata.type`             | `string`   | (optional) Set a default type for all child tokens                   |
| `metadata.requiredModes` 🔹 | `string[]` | (optional) Array of [modes] that must be present on all child tokens |

**Example**

In this example, both `color` and `typography` are groups, as they don’t have a
`type`. But `typography` also has a subgroup: `family`. Groups can be nested
infinitely, as long as they’re not inside tokens.

```json
{
  "color": {
    "metadata": {
      "description": "color palette"
    },
    "red": {
      "type": "color",
      "value": "#fa4549"
    }
  },
  "typography": {
    "metadata": {
      "description": "Typographic styles"
    },
    "family": {
      "Graphik_Regular": {
        "type": "font",
        "value": "Graphik Regular"
      }
    }
  }
}
```

## Tokens

The following properties are shared among all token types:

| Key           | Description                                                             |
| :------------ | :---------------------------------------------------------------------- |
| `type`        | The type of token ([see “types” below](#types))                         |
| `value`       | The token’s value. This differs based on `type`.                        |
| `description` | (optional) A longer description about this token’s purpose, usage, etc. |
| `name` 🔹     | (optional) A human-readable name for this token                         |

And the following types are all valid:

| `type`                         | Description                                                                                 |
| :----------------------------- | :------------------------------------------------------------------------------------------ |
| [`color`][color]               | A CSS-valid color                                                                           |
| [`dimension`][dimension]       | A size in UI (e.g. `8px` or `2.5rem`)                                                       |
| [`font`][font]                 | A font name (e.g. `Vulf Mono`)                                                              |
| [`duration`][duration]         | A measurement of time                                                                       |
| [`cubic-bezier`][cubic-bezier] | An easing curve for animation                                                               |
| `file`                         | A local file on the file system (e.g. `./icons/alert.svg`)                                  |
| `url` 🔹                       | A remote URL (e.g. `https://mycdn.com/image.jpg`)                                           |
| `shadow`                       | A drop shadow, inner shadow, or text shadow to be applied on anything that accepts shadows. |
| `gradient`                     | An array of colors with positions                                                           |
| `typography`                   | A collection of type styles (font size, font weight, leading, tracking, etc.)               |
| `transition`                   | A collection of durations and easing curves for a complete transition.                      |
| (other)                        | Any other value is treated as a [custom type](#custom-type)                                 |

### Color

A CSS-valid color as defined as [`8.1` of the Design Tokens spec][color]. The original definition limits colors to hexadecimal, but Cobalt allows any valid CSS color.

**Example**

```json
{
  "type": "color",
  "value": "#fa4549"
}
```

### Font

A font name as defined as [`8.2` of the Design Tokens spec][font]. Value may be a string or an array of strings from most- to least-preferred.

```json
{
  "type": "font",
  "value": "Graphik Regular"
}
```

### Dimension

A unit of distance as defined as [`8.3` of the Design Tokens spec][dimension]. The original definition limits units to `em` and `px` but Cobalt does not have this restriction.

```json
{
  "type": "dimension",
  "value": "8px"
}
```

### Duration

A unit of time as defined as [`8.4` of the Design Tokens spec][duration].

```json
{
  "type": "duration",
  "value": "100ms"
}
```

### Cubic bézier

An animation easing curve as defined as [`8.5` in the Design Tokens spec][cubic-bezier]. Value is an array of four numbers [𝑥1, 𝑦1, 𝑥2, 𝑦2] that behaves the same as the CSS `cubic-bezier()` function.

```json
{
  "type": "cubic-bezier",
  "value": [0.5, 0, 0.5, 1]
}
```

### File

A relative path to a file (could be on disk, or locally on the server).

```json
{
  "type": "file",
  "value": "./icons/alert.svg"
}
```

### URL 🔹

A link to a remote URL. Must begin with `http://` or `https://` otherwise an error will be thrown.

```json
{
  "type": "url",
  "value": "https://imagedelivery.net/ZWd9g1K7eljCn_KDTu_OWA/profile_pablo.jpg"
}
```

### Transition

A composite type combining `duration` and `cubic-bezier` types to form a CSS transition.

_Note: this is under review in the Design Tokens schema_

```json
{
  "type": "transition",
  "value": {
    "duration": "150ms",
    "delay": "0ms",
    "timing-function": [0.5, 0, 0.5, 1]
  }
}
```

### Shadow

A composite type combining `dimension`s with a `color` to form a CSS `box-shadow`.

_Note: this is under review in the Design Tokens schema_

```json
{
  "type": "shadow",
  "value": {
    "offset-x": "0px",
    "offset-y": "4px",
    "blur": "8px",
    "spread": 0,
    "color": "rgb(0, 0, 0, 0.15)"
  }
}
```

### Gradient

A composite type combining `color` and a position from `0–1` to form the stops of a CSS gradient.

_Note: this is under review in the Design Tokens schema_

_Note: you’ll notice that there’s information missing on whether this is a `linear-gradient()`, `radial-gradient()`, `conic-gradient()`_

```json
{
  "type": "gradient",
  "value": [
    { "color": "red", "position": 0 },
    { "color": "orange", "position": 0.175 },
    { "color": "yellow", "position": 0.325 },
    { "color": "lawngreen", "position": 0.5 },
    { "color": "blue", "position": 0.675 },
    { "color": "indigo", "position": 0.825 },
    { "color": "violet", "position": 1 }
  ]
}
```

### Typography

A composite type combining `font` and `dimension` to form a complete typographic style.

_Note: this is under review in the Design Tokens schema_

```json
{
  "type": "typography",
  "value": {
    "fontName": ["Helvetica", "-system-ui", "sans-serif"],
    "fontSize": "24px",
    "fontStyle": "normal",
    "fontWeight": 400,
    "lineHeight": 1.5,
    "letterSpacing": 0
  }
}
```

### Custom types

Any other `type` value will be treated as a custom type. It has no restrictions other than `type` and `value` being required. `value` may have any shape desired; it won’t be validated.

⚠️ Note that custom types may break existing plugins; extensive use of custom types may require writing your own plugins.

_Should a type be added? [Please open an issue!](https://github.com/drwpow/cobalt-ui/issues/new)_

## Aliasing

Types can be aliased [as defined in the Design Tokens spec](https://design-tokens.github.io/community-group/format/#aliases-references) by using the JSON pointer syntax:

```json
{
  "color": {
    "blue": {
      "type": "color",
      "value": "#218bff"
    },
    "green": {
      "type": "color",
      "value": "#6fdd8b"
    },
    "action": {
      "type": "color",
      "value": "{color.blue}"
    }
  },
  "gradient": {
    "type": "gradient",
    "value": [
      { "color": "{color.blue}", "position": 0 },
      { "color": "{color.green}", "position": 1 }
    ]
  }
}
```

## Modes

[Modes] are alternate versions of your tokens. For example, say your design system has a **standard** palette and an alternate version optimized for **colorblind** users. Here’s one way you could declare that:

```json
{
  "red": {
    "type": "color",
    "value": "#cf222e"
  },
  "red_colorblind": {
    "type": "color",
    "value": "#ac5e00"
  }
}
```

This _works_ but has several problems:

- ❌ multiple palettes are mixed into one
- ❌ this suggests `red` and `red_colorblind` should be used alongside one another (defeating the whole purpose!)
- ❌ it’s unclear what the purpose of `red_colorblind` is, and will likely be avoided by engineers

To address all these, let’s use modes instead:

```json
{
  "red": {
    "type": "token",
    "value": "#cf222e",
    "mode": {
      "standard": "#cf222e",
      "colorblind": "#ac5e00"
    }
  }
}
```

This is much better:

- ✅ palettes are kept separate
- ✅ when `colorblind` mode is enabled, it prevents standard red from being used
- ✅ in code, switching from `standard` to `colorblind` mode automatically creates the palette

There’s a lot of flexibility you can unlock with modes. [Read more about using modes][concepts-modes]

## Examples

[View examples of `tokens.json` on GitHub][examples]

[box=shadow]: https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow
[color]: https://design-tokens.github.io/community-group/format/#color
[concepts-tokens]: /docs/concepts/tokens
[conic-gradient]: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient()
[cubic-bezier]: https://design-tokens.github.io/community-group/format/#cubic-bezier
[dimension]: https://design-tokens.github.io/community-group/format/#dimension
[duration]: https://design-tokens.github.io/community-group/format/#ducration
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
[tokens]: /docs/concepts/tokens
