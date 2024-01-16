---
title: Duration Token
---

# Duration

A length of time as defined in [8.5](https://design-tokens.github.io/community-group/format/#duration).

::: code-group

```json [JSON]
{
  "quick": {
    "$type": "duration",
    "$value": "100ms"
  },
  "moderate": {
    "$type": "duration",
    "$value": "0.25s"
  }
}
```

```yaml [YAML]
quick:
  $type: duration
  $value: 100ms
moderate:
  $type: duration
  $value: 0.25s
```

:::

| Property       |   Type   | Description                                                                             |
| :------------- | :------: | :-------------------------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"duration"`                                                              |
| `$value`       | `string` | **Required.** A length of time, suffixed either by `ms` (milliseconds) or `s` (seconds) |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                          |

## See also

- Duration can also be used within a [transition token](/tokens/transition).

## Tips & recommendations

- Most UI animations should exist between `100ms` – `1s` ([source](https://www.nngroup.com/articles/response-times-3-important-limits/)), ideally on the faster end. Any faster and it seems glitchy or unintentional; any slower and it feels unresponsive.
