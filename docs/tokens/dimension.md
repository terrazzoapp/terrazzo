---
title: Dimension Token
---

# Dimension

A unit of distance as defined in [8.2](https://design-tokens.github.io/community-group/format/#dimension).

::: code-group

```json [JSON]
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

```yaml [YAML]
space:
  md:
    $type: dimension
    $value: 10px
  lg:
    $type: dimension
    $value: 32px
```

:::

| Property       |   Type   | Description                                                    |
| :------------- | :------: | :------------------------------------------------------------- |
| `$type`        | `string` | **Required**. `"dimension"`                                    |
| `$value`       | `string` | **Required**. A number with units.                             |
| `$description` | `string` | (Optional) A description of this token and its intended usage. |

## Uses

Dimension is one of the most versatile token types, and can be used for:

- Spacing (margin, padding, gutters)
- Font size
- Line height
- Border width
- Shadow size & width
- …and more

As such, organizing dimension tokens properly (and setting good `$description`s) is important!

## See also

Note that dimensions **must have units.** To specify a number without units, see [number](/tokens/number).

## Tips & recommendations

- Prefer `rem`s over `px` whenever possible. It’s not only [more accessible](https://www.joshwcomeau.com/css/surprising-truth-about-pixels-and-accessibility/#accessibility-considerations-5), it’s also easier to enforce consistent grids & spacing (e.g. `13px` doesn’t stand out as much as `0.8125rem`).
- Prefer unitless [numbers](/tokens/number) for line heights.
