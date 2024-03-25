---
title: Color Token
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

## See also

Color is a frequently-used base token that can be aliased within the following composite token types:

- [Border (color)](/tokens/border)
- [Gradient](/tokens/gradient)
- [Shadow](/tokens/shadow)
- [Gradient](/tokens/gradient)

## Global options

See [color-specific configuration options](/advanced/config#color)

## Tips & recommendations

- [Culori](https://culorijs.org/) is the preferred library for working with color. It’s great both as an accurate, complete color science library that can parse & generate any format. But is also easy-to-use for simple color operations and is fast and [lightweight](https://culorijs.org/guides/tree-shaking/) (even on the client).
- Prefer the [OKLCH](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl) format for declaring colors ([why?](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)). It’s not only a [futureproof standard](https://www.w3.org/TR/css-color-4/#ok-lab); it also allows for better color manipulation than sRGB/hex and is more perceptually-even.
- To generate accessible color ramps, give [Leonardo](https://leonardocolor.io/) a try.
