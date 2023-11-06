---
title: color
---

# Color

A CSS-valid color as defined in [8.1](https://design-tokens.github.io/community-group/format/#color).

::: code-group

```json [JSON]
{
  "blue": {
    "600": {
      "$type": "color",
      "$value": "oklch(60% 0.216564 269)"
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

| Property       |   Type   | Description                                                                                                                 |
| :------------- | :------: | :-------------------------------------------------------------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"color"`                                                                                                     |
| `$value`       | `string` | **Required.** Though the spec limits valid colors to hex, Cobalt allows any color (parsed by [Culori](https://culorijs.org) |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                                                              |

## See Also

Color is a frequently-used base token that can be aliased within the following composite token types:

- [Border (color)](/tokens/border)
- [Gradient](/tokens/gradient)
- [Shadow](/tokens/shadow)
- [Gradient](/tokens/gradient)
