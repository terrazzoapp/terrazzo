---
title: Group
---

# Group

A group is a way to collect similar tokens. Any nested object in your schema that is not a token counts as a group. Groups can be nested infinitely, and even set default `$type`s that apply to all children.

::: code-group

```json [JSON] {2,3,8,9,10,11,16,17}
{
  "color": {
    "$description": "color palette",
    "red": {
      "$type": "color",
      "$value": "#fa4549"
    }
  },
  "typography": {
    "$description": "Typographic styles",
    "family": {
      "GraphikRegular": {
        "$type": "fontFamily",
        "$value": "Graphik Regular"
      }
    }
  }
}
```

```yaml [YAML] {1,2,6,7,8}
color:
  $description: color palette
  red:
    $type: color
    $value: '#fa4549'
typography:
  $description: Typographic styles
  family:
    GraphikRegular:
      $type: fontFamily
      $value: Graphik Regular
```

:::

| Property                    |    Type    | Description                                                                                        |
| :-------------------------- | :--------: | :------------------------------------------------------------------------------------------------- |
| `$type`                     |  `string`  | (Optional) Set a default `$type` that applies to all children (unless one is specified on a token) |
| `$description`              |  `string`  | (Optional) A description of this group.                                                            |
| `$extensions`               |  `object`  | (Optional) Any arbitrary data is allowed within `$extensions` object.                              |
| `$extensions.requiredModes` | `string[]` | (Optional) **Cobalt**: Enforce [mode IDs](/guides/modes) that must be present on all child tokens. |

## Notes

- Groups can’t be aliased; only token `$value`s can accept aliases.
- A token can’t contain a group. Many design systems want to have a “default” token for each group, and the only way to do this is to reserve a special name in your schema for this purpose (such as `default`).
