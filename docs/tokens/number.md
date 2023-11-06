---
title: Number Token
---

# Number

A number as defined in [8.7](https://design-tokens.github.io/community-group/format/#number).

::: code-group

```json [JSON]
{
  "line-height-large": {
    "$type": "number",
    "$value": 100
  }
}
```

```yaml [YAML]
line-height-large:
  $type: number
  $value: 100
```

:::

| Property       |   Type   | Description                                                             |
| :------------- | :------: | :---------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"number"`                                                |
| `$value`       | `number` | **Required.** A number, which can be positive, negative, or a fraction. |
| `$description` | `string` | (Optional) A description of this token and its intended usage.          |

## Usage

A `number` token theoretically has many creative uses. But in practice. It can’t be used for a [font weight](/tokens/font-weight), and has no units like a [dimension](/tokens/dimension) requires.

However, it can be used for `lineHeight` within a [typography token](/tokens/typography) (as a shorthand for [em](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units#relative_length_units) dimension), as well as stops within a [gradient token](/tokens/gradient).

## See also

- [Gradient](/tokens/gradient)
- [Typography](/tokens/typography)
