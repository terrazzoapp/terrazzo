---
title: Border
---

# Border

A composite type combining a [color](/tokens/color), [dimension](/tokens/dimension), and [stroke style](/tokens/stroke-style), as defined in [9.3](https://design-tokens.github.io/community-group/format/#border).

::: code-group

```json [JSON]
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

```yaml [YAML]
heavy:
  $type: border
  $value:
    color: '#36363600'
    width: 3px
    style: solid
```

:::

| Property       |   Type   | Description                                                                                                        |
| :------------- | :------: | :----------------------------------------------------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"border"`                                                                                           |
| `$value`       | `object` | **Required.** Specify [`color`](/tokens/color), [`width`](/tokens/dimension), and [`style`](/tokens/stroke-style). |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                                                     |
