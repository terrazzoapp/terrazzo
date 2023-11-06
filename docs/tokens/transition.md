---
title: Transition
---

# Transition

A composite type combining [duration](/tokens/duration) and [cubicBezier](/tokens/cubic-bezier) types to form a CSS transition, as defined in [9.4](https://design-tokens.github.io/community-group/format/#transition).

::: code-group

```json [JSON]
{
  "easeOutQuick": {
    "$type": "transition",
    "$value": {
      "duration": "150ms",
      "delay": "0ms",
      "timingFunction": [0.33, 1, 0.68, 1]
    }
  }
}
```

```yaml [YAML]
easeOutQuick:
  $type: transition
  $value:
    duration: 150ms
    delay: 0ms
    timingFunction:
      - 0.33
      - 1
      - 0.68
      - 1
```

:::

| Property       |   Type   | Description                                                                                                                                                  |
| :------------- | :------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"transition"`                                                                                                                                 |
| `$value`       | `object` | **Required.** Specify [`duration`](/tokens/duration), [`delay`](/tokens/duration) (optional; defaults to `0`), and [`timingFunction`](/tokens/cubic-bezier). |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                                                                                               |
