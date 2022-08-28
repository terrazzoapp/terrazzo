---
title: Tokens
layout: ../../../layouts/docs.astro
---

# Tokens

Tokens are defined via the [the W3C Design Tokens format][dt] schema (Feb 2022). Cobalt aims to supports 100% of the spec as-outlined, but with the following known extensions:

- Cobalt supports [Link](#link) tokens for files
- Cobalt introduces the concept of [Modes](#modes)
- While the spec technically prohibits unknown keys or properties; Cobalt ignores them.

Any other deviations can be treated as unintentional (so please [file an issue!](https://github.com/drwpow/cobalt-ui/issues)).

<h2 id="color">
  <div class="symbol symbol--color">
    <svg class="symbol-bg"><use xlink:href="#hex"></svg>
    <svg class="symbol-fg"><use xlink:href="#hex"></svg>
  </div>
  Color
</h2>

A CSS-valid color as defined in [**8.1**][color].

| Property | Type     | Description                                                                                                                                                                                                                                                |
| :------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$type`  | `string` | **color**                                                                                                                                                                                                                                                  |
| `$value` | `string` | A hexadecimal color. 3-, 6-, and 8-character (with alpha) are all allowed. The original spec limits valid colors to hexadecimal only, but Cobalt allows any valid CSS color (parsed by [better-color-tools](https://github.com/drwpow/better-color-tools)) |

```json
{
  "blue": {
    "$type": "color",
    "$value": "#fa4549"
  }
}
```

<h2 id="font">
  <div class="symbol symbol--font">
    <svg class="symbol-bg"><use xlink:href="#hex"></svg>
    <div class="symbol-fg">Aa</div>
  </div>
  Font
</h2>

A font name as defined as [**8.2**][font].

| Property | Type                 | Description                                                                                                |
| :------- | :------------------- | :--------------------------------------------------------------------------------------------------------- |
| `$type`  | `string`             | **font**                                                                                                   |
| `$value` | `string \| string[]` | Either a string for a single font name, or an array of strings to include fallbacks (most preferred first) |

```json
{
  "no-fallbacks": {
    "$type": "font",
    "$value": "Graphik Regular"
  },
  "with-fallbacks": {
    "$type": "font",
    "$value": ["Graphik Regular", "-system-ui", "Helvetica", "sans-serif"]
  }
}
```

<h2 id="dimension">
  <div class="symbol symbol--dimension">
    <svg class="symbol-bg"><use xlink:href="#hex"></svg>
    <div class="symbol-fg"></div>
  </div>
  Dimension
</h2>

A unit of distance as defined as [**8.3**][dimension].

| Property | Type     | Description             |
| :------- | :------- | :---------------------- |
| `$type`  | `string` | **dimension**           |
| `$value` | `string` | A dimension, with units |

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

<h2 id="duration">
  <div class="symbol symbol--duration">
    <svg class="symbol-bg"><use xlink:href="#hex"></svg>
    <div class="symbol-fg"></div>
  </div>
  Duration
</h2>

A length of time as defined as [**8.4**][duration].

| Property | Type     | Description                                                                   |
| :------- | :------- | :---------------------------------------------------------------------------- |
| `$type`  | `string` | **duration**                                                                  |
| `$value` | `string` | A length of time, suffixed either by **ms** (milliseconds) or **s** (seconds) |

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

<h2 id="cubic-bezier">
  <div class="symbol symbol--cubic-bezier">
    <svg class="symbol-bg"><use xlink:href="#hex"></svg>
    <div class="symbol-fg"></div>
  </div>
  Cubic bézier
</h2>

An animation easing curve as defined in [**8.5**][cubic-bezier].

| Property | Type                               | Description                                                                                             |
| :------- | :--------------------------------- | :------------------------------------------------------------------------------------------------------ |
| `$type`  | `string`                           | **cubicBezier**                                                                                         |
| `$value` | `[number, number, number, number]` | An array of four numbers [𝑥1, 𝑦1, 𝑥2, 𝑦2] that behaves the same as the CSS **cubic-bezier()** function. |

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

<h2 id="link">
  <div class="symbol symbol--link">
    <svg class="symbol-bg"><use xlink:href="#hex"></svg>
    <div class="symbol-fg"></div>
  </div>
  Link
</h2>

**Cobalt extension**. A link to a [resource](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link) such as an image.

| Property | Type     | Description                                                        |
| :------- | :------- | :----------------------------------------------------------------- |
| `$type`  | `string` | **link**                                                           |
| `$value` | `string` | Path to a resource, which can either be a partial or complete URL. |

```json
{
  "iconAlert": {
    "$type": "link",
    "$value": "/assets/icons/alert.svg"
  }
}
```

<h2 id="stroke-style">
  <div class="symbol symbol--stroke-style">
    <svg class="symbol-bg"><use xlink:href="#hex"></svg>
    <div class="symbol-fg"></div>
  </div>
  Stroke style
</h2>

| Property | Type     | Description                                                                                |
| :------- | :------- | :----------------------------------------------------------------------------------------- |
| `$type`  | `string` | **strokeStyle**                                                                            |
| `$value` | `string` | Must be one of `solid`, `dashed`, `dotted`, `double`, `groove`, `ridge`, `outset`, `inset` |

A type of stroke as defined in [**9.2**][stroke-style].

_Note: only string values are accepted for now_

```json
{
  "focus-ring-style": {
    "$type": "strokeStyle",
    "$value": "dashed"
  }
}
```

<h2 id="stroke-border">
  <div class="symbol symbol--border">
    <svg class="symbol-bg"><use xlink:href="#hex"></svg>
    <div class="symbol-fg"></div>
  </div>
  Border
</h2>

A border as defined in [**9.3**][border] consisting of a `color` ([color](#color)), `width` ([dimension](#dimension)), and `style` ([strokeStyle](#stroke-style)).

| Property | Type     | Description                                                            |
| :------- | :------- | :--------------------------------------------------------------------- |
| `$type`  | `string` | **border**                                                             |
| `$value` | `object` | Specify a `color`, `width`, and `style` for this token (all required). |

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

<h2 id="transition">
  <div class="symbol symbol--transition">
    <svg class="symbol-bg"><use xlink:href="#hex"></svg>
    <div class="symbol-fg"></div>
  </div>
  Transition
</h2>

A composite type combining **duration** and **cubicBezier** types to form a CSS transition, as defined in [**9.4**][transition].

| Property | Type     | Description                                                                                                                             |
| :------- | :------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| `$type`  | `string` | **transition**                                                                                                                          |
| `$value` | `object` | Specify a **duration**, **delay**, and **timingFunction** that combine to make the transition. **delay** is optional (defaults to `0`). |

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

<h2 id="shadow">
  <div class="symbol symbol--shadow">
    <svg class="symbol-bg"><use xlink:href="#hex"></svg>
    <div class="symbol-fg"></div>
  </div>
  Shadow
</h2>

A composite type combining **dimension** with a **color** to form a CSS `box-shadow`, as defined in [**9.5**][shadow]

| Property | Type     | Description                                                                                                                    |
| :------- | :------- | :----------------------------------------------------------------------------------------------------------------------------- |
| `$type`  | `string` | **transition**                                                                                                                 |
| `$value` | `object` | Specify a **offsetX**, **offsetY**, **blur**, **spread**, and **color** to form a shadow. **color** is the only required prop. |

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

<h2 id="gradient">
  <div class="symbol symbol--gradient">
    <svg class="symbol-bg"><use xlink:href="#hex"></svg>
    <svg class="symbol-fg"><use xlink:href="#hex"></svg>
  </div>
  Gradient
</h2>

A composite type combining **color** and percentages (normalized to **1**) to form the stops of a CSS gradient, as defined in [**9.6**][gradient].

_Note: you’ll notice that there’s information missing on whether this is a `linear-gradient()`, `radial-gradient()`, `conic-gradient()`_

| Property | Type                                    | Description                                                                                  |
| :------- | :-------------------------------------- | :------------------------------------------------------------------------------------------- |
| `$type`  | `string`                                | **transition**                                                                               |
| `$value` | `{ color: string, position: number }[]` | Array of stops that provdide both a **color** and **position**, from `0` (0%) to `1` (100%). |

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

<h2 id="typography">
  <div class="symbol symbol--typography">
    <svg class="symbol-bg"><use xlink:href="#hex"></svg>
    <div class="symbol-fg">Aa</div>
  </div>
  Typography
</h2>

A composite type combining **font** and **dimension** to form a complete typographic style, as defined in [**9.7**][typography].

| Property | Type     | Description                                                                                                                                                                                                              |
| :------- | :------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$type`  | `string` | **transition**                                                                                                                                                                                                           |
| `$value` | `object` | Specify any typographic CSS properties in **camelCase** format. Although the spec limits the properties to only a few, Cobalt allows any typographic-related attributes including **letterSpacing** and **fontVariant**. |

```json
{
  "body": {
    "$type": "typography",
    "$value": {
      "fontFamily": ["Helvetica", "-system-ui", "sans-serif"],
      "fontSize": "24px",
      "fontStyle": "normal",
      "fontWeight": 400,
      "letterSpacing": 0,
      "lineHeight": 1.5,
      "textTransform": "none"
    }
  }
}
```

## Groups

A group is a way to collect similar tokens. A group is made by omitting `$value` (and it is impossible for a group to have a `$value`). In the schema, all reserved names start with a `$`. All other properties will be treated either as tokens or other sub-groups.

| Property                    | Type       | Description                                                                               |
| :-------------------------- | :--------- | :---------------------------------------------------------------------------------------- |
| `$description`              | `string`   | (optional) Set a human-readable description for this group                                |
| `$type`                     | `string`   | (optional) Set a default type for all child tokens                                        |
| `$extensions`:              | `object`   | (optional) Any arbitrary data is allowed within `$extensions` object.                     |
| `$extensions.requiredModes` | `string[]` | (optional) **Cobalt**: Enforce [mode IDs][modes] that must be present on all child tokens |

**Example**

In this example, both `color` and `typography` are groups, as neither have a `$value`. But `typography` also has a subgroup: `family`. Groups can be nested infinitely, as long as they’re not inside tokens.

```json
{
  "color": {
    "$description": "color palette",
    "red": {
      "$type": "color",
      "$value": "#fa4549"
    }
  },
  "typography": {
    "$description": "Typographic styles",
    "family": {
      "GraphikRegular": {
        "$type": "font",
        "$value": "Graphik Regular"
      }
    }
  }
}
```

## Custom types

Any other **$type** will be treated as a custom type. **$value** may have any shape desired. But note that custom types will likely break existing plugins unless you configure them (the CSS and Sass plugins have a **transformer** option), or unless you write your own plugin for Cobalt (which is easier than some may think!).

_Should a type be added? [Suggest it be added!](https://github.com/design-tokens/community-group)_

## Aliasing

Types can be aliased [as defined in the Design Tokens spec](https://design-tokens.github.io/community-group/format/#aliases-references) by using dot-delimited path syntax, wrapped in curly braces (e.g., `{groupA.groupB.token}`):

```json
{
  "color": {
    "blue": {
      "$type": "color",
      "$value": "#218bff"
    },
    "green": {
      "$type": "color",
      "$value": "#6fdd8b"
    },
    "action": {
      "$type": "color",
      "$value": "{color.blue}"
    }
  },
  "gradient": {
    "$type": "gradient",
    "$value": [
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
    "$type": "color",
    "$value": "#cf222e"
  },
  "redClorblind": {
    "$type": "color",
    "$value": "#ac5e00"
  }
}
```

This _works_ but has several problems:

- ❌ multiple palettes are mixed into one
- ❌ this suggests **red** and **redColorblind** should be used alongside one another (defeating the whole purpose!)
- ❌ it’s unclear what the purpose of **redColorblind** is, and will likely be avoided by engineers

To address all these, let’s use modes instead by adding an **$extensions.modes** property:

```json
{
  "red": {
    "$type": "token",
    "$value": "#cf222e",
    "$extensions": {
      "mode": {
        "standard": "#cf222e",
        "colorblind": "#ac5e00"
      }
    }
  }
}
```

This is much better:

- ✅ palettes are kept separate
- ✅ when **colorblind** mode is enabled, it prevents standard red from being used
- ✅ in code, switching from **standard** to **colorblind** mode automatically creates the palette

There’s a lot of flexibility you can unlock with modes. [Read more about using modes][modes]

## Examples

Some examples of open design systems using the W3C Design Tokens Community format

_Note: all examples are unofficial and for demonstration purposes only; all companies referenced retain full ownership over their respective systems, and are unaffiliated with this project:_

- [GitHub Primer](https://github.com/drwpow/cobalt-ui/tree/main/examples/github)
- [IBM Carbon](https://github.com/drwpow/cobalt-ui/tree/main/examples/ibm)
- [Adobe Spectrum](https://github.com/drwpow/cobalt-ui/tree/main/examples/adobe)
- [Salesforce Lightning](https://github.com/drwpow/cobalt-ui/tree/main/examples/salesforce)
- [Shopify Polaris](https://github.com/drwpow/cobalt-ui/tree/main/examples/shopify)
- [Apple Human Interface Guidelines](https://github.com/drwpow/cobalt-ui/tree/main/examples/apple)

[box-shadow]: https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow
[border]: https://design-tokens.github.io/community-group/format/#border
[color]: https://design-tokens.github.io/community-group/format/#color
[conic-gradient]: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient()
[cubic-bezier]: https://design-tokens.github.io/community-group/format/#cubic-bezier
[dimension]: https://design-tokens.github.io/community-group/format/#dimension
[duration]: https://design-tokens.github.io/community-group/format/#duration
[dt]: https://design-tokens.github.io/community-group/format/
[examples]: https://github.com/drwpow/cobalt-ui/blob/main/examples/
[font]: https://design-tokens.github.io/community-group/format/#font
[gradient]: https://design-tokens.github.io/community-group/format/#gradient
[linear-gradient]: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient()
[modes]: ./guides/modes
[openapi]: https://swagger.io/specification/
[plugins]: ./plugins
[radial-gradient]: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient()
[repeating-linear-gradient]: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/repeating-linear-gradient()
[repeating-radial-gradient]: https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/repeating-radial-gradient()
[stroke-style]: https://design-tokens.github.io/community-group/format/#stroke-style
[shadow]: https://design-tokens.github.io/community-group/format/#shadow
[text-shadow]: https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow
[tokens]: ./tokens
[transition]: https://design-tokens.github.io/community-group/format/#transition
[typography]: https://design-tokens.github.io/community-group/format/#typography
