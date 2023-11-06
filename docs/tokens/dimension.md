---
title: Dimension
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

## See Also

Note that dimensions **must have units.** To specify a number without units, see [number](/tokens/number).
