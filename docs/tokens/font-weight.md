---
title: Font Weight
---

# Font Weight

A font weight as defined in [8.4](https://design-tokens.github.io/community-group/format/#font-weight).

::: code-group

```json [JSON]
{
  "font-weight-default": {
    "$type": "fontWeight",
    "$value": 350
  },
  "font-weight-thick": {
    "$type": "fontWeight",
    "$value": "extra-bold"
  }
}
```

```yaml [YAML]
font-weight-default:
  $type: fontWeight
  $value: 350
font-weight-thick:
  $type: fontWeight
  $value: extra-bold
```

:::

| Property       |   Type   | Description                                                                                                                           |
| :------------- | :------: | :------------------------------------------------------------------------------------------------------------------------------------ |
| `$type`        | `string` | **Required.** `"fontWeight"`                                                                                                          |
| `$value`       | `number` | **Required.** Either a font weight number `1` (lightest) –`999` (heaviest), or an [approved alias](#aliases) of a font weight number. |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                                                                        |

## Aliases

A font weight can be a number from `1` (lightest) – `999` (heaviest), but the following string keywords may also be used (and _only_ the following words):

| Weight | Alias                        |
| :----- | :--------------------------- |
| 100    | `thin`, `hairline`           |
| 200    | `extra-light`, `ultra-light` |
| 300    | `light`                      |
| 400    | `normal`, `regular`, `book`  |
| 500    | `medium`                     |
| 600    | `semi-bold`, `demi-bold`     |
| 700    | `bold`                       |
| 800    | `extra-bold`, `ultra-bold`   |
| 900    | `black`, `heavy`             |
| 950    | `extra-black`, `ultra-black` |

## Notes

- Though this seems similar to a [number token](/tokens/number), the difference is the string aliases, and the fact that this can _only_ be used for font weights (and [typography tokens](/tokens/typography)).

## See also

- [Typography tokens](/tokens/typography)
