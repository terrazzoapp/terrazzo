---
title: Shadow Token
---

# Shadow

A composite type combining [dimension](/tokens/dimension) with a [color](/tokens/color) to form a CSS `box-shadow`, as defined in [9.5](https://design-tokens.github.io/community-group/format/#shadow).

::: code-group

```json [JSON]
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

```yaml [YAML]
shadow-md:
  $type: shadow
  $value:
    offsetX: 0px
    offsetY: 4px
    blur: 8px
    spread: 0
    color: "rgb(0, 0, 0, 0.15)"
```

:::

| Property       |   Type   | Description                                                                                                                                                                                                                         |
| :------------- | :------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"shadow"`                                                                                                                                                                                                            |
| `$value`       | `object` | **Required.** Specify [`offsetX`](/tokens/dimension), [`offsetY`](/tokens/dimension), [`blur`](/tokens/dimension), [`spread`](/tokens/dimension), and [`color`](/tokens/color) to form a shadow. `color` is the only required prop. |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                                                                                                                                                                      |

## Tips & recommendations

- For smoother shadows, try [layering multiple](https://shadows.brumm.af/).
