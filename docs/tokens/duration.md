---
title: Duration
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
