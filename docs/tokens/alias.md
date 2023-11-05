---
title: Alias
---

# Alias

Types can be aliased by using dot-delimited path syntax, wrapped in curly braces, as defined in [3.8](https://design-tokens.github.io/community-group/format/#alias-reference):

::: code-group

```json [JSON] {16,23,24}
{
  "color": {
    "base": {
      "blue": {
        "$type": "color",
        "$value": "#218bff"
      },
      "green": {
        "$type": "color",
        "$value": "#6fdd8b"
      }
    },
    "semantic": {
      "action": {
        "$type": "color",
        "$value": "{color.base.blue}"
      }
    }
  },
  "gradient": {
    "$type": "gradient",
    "$value": [
      {"color": "{color.base.blue}", "position": 0},
      {"color": "{color.base.green}", "position": 1}
    ]
  }
}
```

```yaml [YAML] {12,16,18}
color:
  base:
    blue:
      $type: color
      $value: '#218bff'
    green:
      $type: color
      $value: '#6fdd8b'
  semantic:
    action:
      $type: color
      $value: '{color.base.blue}'
gradient:
  $type: gradient
  $value:
    - color: '{color.base.blue}'
      position: 0
    - color: '{color.base.green}'
      position: 1
```

:::

## Notes

- Aliases can even alias aliases! So long as they’re not an infinite loop, you can alias as many times as you want.
