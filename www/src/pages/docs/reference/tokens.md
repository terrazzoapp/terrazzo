---
title: Token Types
layout: ../../../layouts/docs.astro
---

# Types

This is a complete reference for all token types supported by Terrazzo. This includes all of the [DTCG Format](https://design-tokens.github.io/community-group/format/), as well as Terrazzo extensions like link, boolean, string, etc.

## Color

Any [CSS Module 4](https://www.w3.org/TR/css-color-4/#predefined) color as defined in [DTCG 8.1](https://design-tokens.github.io/community-group/format/#color).

:::code-group

```json [JSON]
{
  "blue": {
    "600": {
      "$type": "color",
      "$value": {
        "colorSpace": "oklch",
        "components": [0.6, 0.216564, 269],
        "alpha": 1
      }
    }
  }
}
```

```yaml [YAML]
blue:
  600:
    $type: color
    $value: oklch(60% 0.216564 269)
```

:::

| Property       | Type     | Description                                                                                                                     |
| :------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------ |
| `$type`        | `string` | **Required.** `"color"`                                                                                                         |
| `$value`       | `string` | **Required.** An object with required `colorSpace` and `components` keys. `alpha` and `hex` (sRGB fallback color) are optional. |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                                                                  |

### See also

Color is a frequently-used base token that can be aliased within the following composite token types:

- [Border](#border)
- [Gradient](#gradient)
- [Shadow](#shadow)

### Tips & recommendations

- [Color.js](https://colorjs.io/docs/procedural) is the preferred library for working with color. It’s great both as an accurate, complete color science library that can parse & generate any format. But is also easy-to-use for simple color operations and is fast and [lightweight](https://colorjs.io/docs/procedural) (even on the client)
- Prefer the [OKLCH](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl) format for declaring colors ([why?](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)). It’s not only a [futureproof standard](https://www.w3.org/TR/css-color-4/#ok-lab); it also allows for better color manipulation than sRGB/hex and is more perceptually-even.

## Dimension

A unit of distance as defined in [DTCG 8.2](https://design-tokens.github.io/community-group/format/#dimension).

```json
{
  "space": {
    "md": {
      "$type": "dimension",
      "$value": "16px"
    },
    "lg": {
      "$type": "dimension",
      "$value": "32px"
    }
  }
}
```

| Property       | Type     | Description                                                    |
| :------------- | :------- | :------------------------------------------------------------- |
| `$type`        | `string` | **Required**. `"dimension"`                                    |
| `$value`       | `string` | **Required**. A number with units.                             |
| `$description` | `string` | (Optional) A description of this token and its intended usage. |

### Uses

Dimension is one of the most versatile token types, and can be used for:

- Spacing (margin, padding, gutters)
- Font size
- Line height
- Border width
- Shadow size & width
- …and more

As such, organizing dimension tokens properly (and setting good `$description`s) is important!

### See also

Note that dimensions **must have units.** To specify a number without units, see [number](#number).

### Tips & recommendations

- Prefer `rem`s over `px` whenever possible. It’s not only [more accessible](https://www.joshwcomeau.com/css/surprising-truth-about-pixels-and-accessibility/#accessibility-considerations-5), it’s also easier to enforce consistent grids & spacing (e.g. `13px` doesn’t stand out as much as `0.8125rem`).
- Prefer unitless [numbers](#number) for line heights.

## Font Family

A font name (and optional fallbacks) as defined in [DTCG 8.3](https://design-tokens.github.io/community-group/format/#font-family).

```json
{
  "no-fallbacks": {
    "$type": "fontFamily",
    "$value": "Graphik Regular"
  },
  "with-fallbacks": {
    "$type": "fontFamily",
    "$value": ["Graphik Regular", "-system-ui", "Helvetica", "sans-serif"]
  }
}
```

| Property       | Type                   | Description                                                                                                              |
| :------------- | :--------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| `$type`        | `string`               | **Required.** `"fontFamily"`                                                                                             |
| `$value`       | `string` \| `string[]` | **Required.** Either a string for a single font name, or an array of strings to include fallbacks (most preferred first) |
| `$description` | `string`               | (Optional) A description of this token and its intended usage.                                                           |

### Notes

- In an old version of the spec, this originally had a `$type` of `font`.

### See also

- Font Family is a part of the [Typography](#typography) type

### Tips & recommendations

- The following universal fallback font stack is recommended for your base typography tokens:
  ```
  -apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji`
  ```
  This falls back to system fonts (if a glyph isn’t available) and enables emojis in every OS.

## Font Weight

A font weight as defined in [DTCG 8.4](https://design-tokens.github.io/community-group/format/#font-weight).

```json
{
  "font-weight-default": {
    "$type": "fontWeight",
    "$value": 350
  },
  "font-weight-thick": {
    "$type": "fontWeight",
    "$value": "extra-bold"
  }
}
```

| Property       | Type     | Description                                                                                                                           |
| :------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------ |
| `$type`        | `string` | **Required.** `"fontWeight"`                                                                                                          |
| `$value`       | `number` | **Required.** Either a font weight number `1` (lightest) –`999` (heaviest), or an [approved alias](#aliases) of a font weight number. |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                                                                        |

### Aliases

A font weight can be a number from `1` (lightest) – `999` (heaviest), but the following string keywords may also be used (and _only_ the following words):

| Weight | Alias                        |
| :----- | :--------------------------- |
| 100    | `thin`, `hairline`           |
| 200    | `extra-light`, `ultra-light` |
| 300    | `light`                      |
| 400    | `normal`, `regular`, `book`  |
| 500    | `medium`                     |
| 600    | `semi-bold`, `demi-bold`     |
| 700    | `bold`                       |
| 800    | `extra-bold`, `ultra-bold`   |
| 900    | `black`, `heavy`             |
| 950    | `extra-black`, `ultra-black` |

### Notes

- Though this seems similar to a [number token](#number), the difference is the string aliases, and the fact that this can _only_ be used for font weights (and [typography tokens](#typography)).

### See also

- Font Weight is a part of the [Typography](#typography) type

## Duration

A length of time as defined in [DTCG 8.5](https://design-tokens.github.io/community-group/format/#duration).

```json
{
  "quick": {
    "$type": "duration",
    "$value": "100ms"
  },
  "moderate": {
    "$type": "duration",
    "$value": "0.25s"
  }
}
```

| Property       | Type     | Description                                                                             |
| :------------- | :------- | :-------------------------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"duration"`                                                              |
| `$value`       | `string` | **Required.** A length of time, suffixed either by `ms` (milliseconds) or `s` (seconds) |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                          |

### See also

- Duration can also be used within a [transition token](#transition).

### Tips & recommendations

- Most UI animations should exist between `100ms` – `1s` ([source](https://www.nngroup.com/articles/response-times-3-important-limits/)), ideally on the faster end. Any faster and it seems glitchy or unintentional; any slower and it feels unresponsive.

## Cubic Bézier

An easing curve as defined in DTCG [8.6](https://design-tokens.github.io/community-group/format/#cubic-bezier).

```json
{
  "linear": {
    "$type": "cubicBezier",
    "$value": [0, 0, 1, 1]
  },
  "easeOutCubic": {
    "$type": "cubicBezier",
    "$value": [0.33, 1, 0.68, 1]
  },
  "easeInCubic": {
    "$type": "cubicBezier",
    "$value": [0.32, 0, 0.67, 0]
  },
  "easeInOutCubic": {
    "$type": "cubicBezier",
    "$value": [0.65, 0, 0.35, 1]
  }
}
```

| Property       | Type                               | Description                                                                                                                                                                 |
| :------------- | :--------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$type`        | `string`                           | **Required.** `"cubicBezier"`                                                                                                                                               |
| `$value`       | `[number, number, number, number]` | **Required.** An array of four numbers [𝑥1, 𝑦1, 𝑥2, 𝑦2] that behaves the same as a [CSS easing function](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function). |
| `$description` | `string`                           | (Optional) A description of this token and its intended usage.                                                                                                              |

### See also

- A Cubic Bézier can be used within a [transition token](#transition).

### Tips & recommendations

- For a list of common easing functions, refer to [easings.net](https://easings.net/).
- For most UI animations, prefer [ease-out curves](https://pow.rs/blog/animation-easings/), though in some instances linear or ease-in curves help ([guide](https://pow.rs/blog/animation-easings/)).

## Number

A number as defined in [DTCG 8.7](https://design-tokens.github.io/community-group/format/#number).

```json
{
  "line-height-large": {
    "$type": "number",
    "$value": 100
  }
}
```

| Property       | Type     | Description                                                             |
| :------------- | :------- | :---------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"number"`                                                |
| `$value`       | `number` | **Required.** A number, which can be positive, negative, or a fraction. |
| `$description` | `string` | (Optional) A description of this token and its intended usage.          |

### Usage

A `number` token theoretically has many creative uses. But in practice. It can’t be used for a [font weight](#font-weight), and has no units like a [dimension](#dimension) requires.

However, it can be used for `lineHeight` within a [typography token](#typography) (as a shorthand for [em](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units#relative_length_units) dimension), as well as stops within a [gradient token](#gradient).

### See also

- [Gradient](#gradient)
- [Typography](#typography)

## Link (extension)

**Terrazzo extension**. A link to a [resource](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link) such as an image. Not a supported token type outside of Terrazzo.

```json
{
  "iconAlert": {
    "$type": "link",
    "$value": "/assets/icons/alert.svg"
  }
}
```

| Property       | Type     | Description                                                                      |
| :------------- | :------- | :------------------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"link"`                                                           |
| `$value`       | `string` | **Required.** Path to a resource, which can either be a partial or complete URL. |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                   |

### Usage

Assets such as icons, images, and logos are a critical part of any design system. The behavior of how assets are handled depends on the [plugin](/docs) used. For example, the [CSS plugin](/docs/integrations/css) can optionally embed small files directly into CSS for performance.

There’s also the image optimization plugin (coming soon) that can optimize image and icon assets.

Refer to each plugin’s documentation to learn what special features are available for Link token types.

## Boolean (extension)

**Terrazzo extension**. A true/false token used for simple logic.

```json
{
  "isDisabled": {
    "$type": "boolean",
    "$value": false
  }
}
```

## String (extension)

**Terrazzo extension**. An undefined token that requires the user to define its purpose.

```json
{
  "myCustomValue": {
    "$type": "string",
    "$value": ""
  }
}
```

### Usage

:::warning

String types don’t have behavior in most plugins, and are only an escape hatch for custom plugins. String tokens are NOT RECOMMENDED for user-readable content, since tokens are not meant for internationalization.

:::

## Stroke Style

A type of stroke as defined in [DTCG 9.2](https://design-tokens.github.io/community-group/format/#stroke-style).

```json
{
  "focus-ring-style": {
    "$type": "strokeStyle",
    "$value": "dashed"
  },
  "alert-border-style": {
    "$type": "strokeStyle",
    "$value": {
      "dashArray": ["0.5rem", "0.25rem"],
      "lineCap": "round"
    }
  }
}
```

| Property       | Type                 | Description                                                    |
| :------------- | :------------------- | :------------------------------------------------------------- |
| `$type`        | `string`             | **Required**. `"strokeStyle"`                                  |
| `$value`       | `string` \| `object` | See [Value types](#value-types)                                |
| `$description` | `string`             | (Optional) A description of this token and its intended usage. |

### Value types

A Stroke Style token’s `$value` must be either of 2 possible types: `string` or `object`

#### String

A string value as defined in [9.2.1](https://design-tokens.github.io/community-group/format/#string-value) must be one of the following keywords that correspond to the [equivalent CSS line styles](https://developer.mozilla.org/en-US/docs/Web/CSS/line-style#values):

- `solid`
- `dashed`
- `dotted`
- `double`
- `groove`
- `ridge`
- `outset`
- `inset`

#### Object

An object value as defined in [9.2.2](https://design-tokens.github.io/community-group/format/#object-value) is an object that must have the following 2 properties:

| Property    | Type       | Description                                                                        |
| :---------- | :--------- | :--------------------------------------------------------------------------------- |
| `dashArray` | `string[]` | An array of [dimension values](#dimension) that specify alternating dashes & gaps. |
| `lineCap`   | `string`   | Must be one of `round`, `butt`, or `square`.                                       |

### Notes

- Stroke Style is the only [composite token](https://design-tokens.github.io/community-group/format/#composite-types) type that can also be used in another composite type ([Border](#border))

### See also

- [Border](#border)

## Border

A composite type combining a [color](#color), [dimension](#dimension), and [stroke style](#stroke-style), as defined in [DTCG 9.3](https://design-tokens.github.io/community-group/format/#border).

```json
{
  "heavy": {
    "$type": "border",
    "$value": {
      "color": "#36363600",
      "width": "3px",
      "style": "solid"
    }
  }
}
```

| Property       | Type     | Description                                                                                   |
| :------------- | :------- | :-------------------------------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"border"`                                                                      |
| `$value`       | `object` | **Required.** Specify [`color`](#color), [`width`](#dimension), and [`style`](#stroke-style). |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                                |

## Transition

A composite type combining [duration](#duration) and [cubicBezier](#cubic-bezier) types to form a CSS transition, as defined in [DTCG 9.4](https://design-tokens.github.io/community-group/format/#transition).

```json
{
  "easeOutQuick": {
    "$type": "transition",
    "$value": {
      "duration": "150ms",
      "delay": "0ms",
      "timingFunction": [0.33, 1, 0.68, 1]
    }
  }
}
```

| Property       | Type     | Description                                                                                                                             |
| :------------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"transition"`                                                                                                            |
| `$value`       | `object` | **Required.** Specify [`duration`](#duration), [`delay`](#duration) (optional; defaults to `0`), and [`timingFunction`](#cubic-bezier). |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                                                                          |

## Shadow

A composite type combining [dimension](#dimension) with a [color](#color) to form a CSS `box-shadow`, as defined in [DTCG 9.5](https://design-tokens.github.io/community-group/format/#shadow).

```json
{
  "shadow-md": {
    "$type": "shadow",
    "$value": {
      "offsetX": "0px",
      "offsetY": "4px",
      "blur": "8px",
      "spread": 0,
      "color": "rgb(0, 0, 0, 0.15)"
    }
  }
}
```

| Property       | Type     | Description                                                                                                                                                                                      |
| :------------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"shadow"`                                                                                                                                                                         |
| `$value`       | `object` | **Required.** Specify [`offsetX`](#dimension), [`offsetY`](#dimension), [`blur`](#dimension), [`spread`](#dimension), and [`color`](#color) to form a shadow. `color` is the only required prop. |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                                                                                                                                   |

### Tips & recommendations

- For smoother shadows, try [layering multiple](https://shadows.brumm.af/).

## Gradient

A composite type combining [color](#color) and [number](#number)(normalized to `1`) to form the stops of a CSS gradient, as defined in [DTCG 9.6](https://design-tokens.github.io/community-group/format/#gradient).

```json
{
  "rainbow": {
    "$type": "gradient",
    "$value": [
      { "color": "red", "position": 0 },
      { "color": "orange", "position": 0.175 },
      { "color": "yellow", "position": 0.325 },
      { "color": "lawngreen", "position": 0.5 },
      { "color": "blue", "position": 0.675 },
      { "color": "indigo", "position": 0.825 },
      { "color": "violet", "position": 1 }
    ]
  }
}
```

| Property       | Type     | Description                                                                                                          |
| :------------- | :------- | :------------------------------------------------------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"gradient"`                                                                                           |
| `$value`       | `object` | **Required.** Specify an array of objects with [`color`](/tokens/color) and [`position`](/tokens/number) properties. |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                                                       |

### Notes

- This token is currently missing information on whether this is a [linear](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient), [radial](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient), or [conic](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient) gradient. In most Terrazzo plugins, `linear` gradient is assumed.

### Tips & recommendations

- [Color.js](https://colorjs.io/docs/procedural) is the preferred library for working with color. It’s great both as an accurate, complete color science library that can parse & generate any format. But is also easy-to-use for simple color operations and is fast and [lightweight](https://colorjs.io/docs/procedural) (even on the client)
- Prefer the [OKLCH](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl) format for declaring colors ([why?](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)). It’s not only a [futureproof standard](https://www.w3.org/TR/css-color-4/#ok-lab); it also allows for better color manipulation than sRGB/hex and is more perceptually-even.

## Typography

A composite type combining [fontFamily](#font-family), [dimension](#dimension), and other properties to form a complete typographic style, as defined in [DTCG 9.7](https://design-tokens.github.io/community-group/format/#typography).

```json
{
  "bodyText": {
    "$type": "typography",
    "$value": {
      "fontFamily": ["Helvetica", "-system-ui", "sans-serif"],
      "fontSize": "1.5rem",
      "fontStyle": "normal",
      "fontWeight": 400,
      "letterSpacing": 0,
      "lineHeight": 1.5,
      "textTransform": "none"
    }
  }
}
```

| Property       | Type     | Description                                                                                                                                                                                                            |
| :------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"typography"`                                                                                                                                                                                           |
| `$value`       | `object` | **Required.** Specify any typographic CSS properties in _camelCase_ format. Although the spec limits the properties to only a few, Terrazzo allows any valid attributes including `letterSpacing`, `fontVariant`, etc. |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                                                                                                                                                         |

### Tips & recommendations

- Though the DTCG spec doesn’t technically allow it, declare any/all CSS typography properties on typography tokens. Without these, you couldn’t use things like [variable font properties](https://fonts.google.com/knowledge/introducing_type/introducing_variable_fonts) in your design system. Plugins may simply ignore properties that don’t apply for the given build target.
