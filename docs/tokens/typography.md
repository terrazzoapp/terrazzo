---
title: Typography Token
---

# Typography

A composite type combining [fontFamily](/tokens/font-family), [dimension](/tokens/dimension), and other properties to form a complete typographic style, as defined in [9.7](https://design-tokens.github.io/community-group/format/#typography).

::: code-group

```json [JSON]
{
  "bodyText": {
    "$type": "typography",
    "$value": {
      "fontFamily": ["Helvetica", "-system-ui", "sans-serif"],
      "fontSize": "24px",
      "fontStyle": "normal",
      "fontWeight": 400,
      "letterSpacing": 0,
      "lineHeight": 1.5,
      "textTransform": "none"
    }
  }
}
```

```yaml [YAML]
bodyText:
  $type: typography
  $value:
    fontFamily:
      - Helvetica
      - -system-ui
      - sans-serif
    fontSize: 24px
    fontStyle: normal
    fontWeight: 400
    letterSpacing: 0
    lineHeight: 1.5
    textTransform: none
```

:::

| Property       |   Type   | Description                                                                                                                                                                                                          |
| :------------- | :------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"typography"`                                                                                                                                                                                         |
| `$value`       | `object` | **Required.** Specify any typographic CSS properties in _camelCase_ format. Although the spec limits the properties to only a few, Cobalt allows any valid attributes including `letterSpacing`, `fontVariant`, etc. |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                                                                                                                                                       |
