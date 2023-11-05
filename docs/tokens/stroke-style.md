---
title: Stroke Style
---

# Stroke Style

A type of stroke as defined in [9.2](https://design-tokens.github.io/community-group/format/#stroke-style).

::: code-group

```json [JSON]
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

```yaml [YAML]
focus-ring-style:
  $type: strokeStyle
  $value: dashed
alert-border-style:
  $type: strokeStyle
  $value:
    dashArray:
      - 0.5rem
      - 0.25rem
    lineCap: round
```

:::

| Property       |         Type         | Description                                                    |
| :------------- | :------------------: | :------------------------------------------------------------- |
| `$type`        |       `string`       | **Required**. `"strokeStyle"`                                  |
| `$value`       | `string` \| `object` | See [Value types](#value-types)                                |
| `$description` |       `string`       | (Optional) A description of this token and its intended usage. |

## Value types

A Stroke Style token’s `$value` must be either of 2 possible types: `string` or `object`

### String

A string value as defined in [9.2.1](https://design-tokens.github.io/community-group/format/#string-value) must be one of the following keywords that correspond to the [equivalent CSS line styles](https://developer.mozilla.org/en-US/docs/Web/CSS/line-style#values):

- `solid`
- `dashed`
- `dotted`
- `double`
- `groove`
- `ridge`
- `outset`
- `inset`

### Object

An object value as defined in [9.2.2](https://design-tokens.github.io/community-group/format/#object-value) is an object that must have the following 2 properties:

| Property    |    Type    | Description                                                                               |
| :---------- | :--------: | :---------------------------------------------------------------------------------------- |
| `dashArray` | `string[]` | An array of [dimension values](/tokens/dimension) that specify alternating dashes & gaps. |
| `lineCap`   |  `string`  | Must be one of `round`, `butt`, or `square`.                                              |

## Notes

- Stroke Style is the only [composite token](https://design-tokens.github.io/community-group/format/#composite-types) type that can also be used in another composite type ([Border](/tokens/border))

## See also

- [Border](/tokens/border)
