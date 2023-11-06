---
title: Gradient Token
---

# Gradient

A composite type combining [color](/tokens/color) and [number](/tokens/number)(normalized to `1`) to form the stops of a CSS gradient, as defined in [9.6](https://design-tokens.github.io/community-group/format/#gradient).

::: code-group

```json [JSON]
{
  "rainbow": {
    "$type": "gradient",
    "$value": [
      {"color": "red", "position": 0},
      {"color": "orange", "position": 0.175},
      {"color": "yellow", "position": 0.325},
      {"color": "lawngreen", "position": 0.5},
      {"color": "blue", "position": 0.675},
      {"color": "indigo", "position": 0.825},
      {"color": "violet", "position": 1}
    ]
  }
}
```

```yaml [YAML]
rainbow:
  $type: gradient
  $value:
    - color: red
      position: 0
    - color: orange
      position: 0.175
    - color: yellow
      position: 0.325
    - color: lawngreen
      position: 0.5
    - color: blue
      position: 0.675
    - color: indigo
      position: 0.825
    - color: violet
      position: 1
```

:::

| Property       |   Type   | Description                                                                                                          |
| :------------- | :------: | :------------------------------------------------------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"gradient"`                                                                                           |
| `$value`       | `object` | **Required.** Specify an array of objects with [`color`](/tokens/color) and [`position`](/tokens/number) properties. |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                                                       |

## Notes

- This token is currently missing information on whether this is a [linear](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient), [radial](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient), or [conic](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient) gradient. In most Cobalt plugins, `linear` gradient is assumed.
