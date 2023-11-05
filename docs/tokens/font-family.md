---
title: Font Family
---

# Font Family

A font name (and optional fallbacks) as defined in [8.3](https://design-tokens.github.io/community-group/format/#font-family).

::: code-group

```json [JSON]
{
  "no-fallbacks": {
    "$type": "fontFamily",
    "$value": "Graphik Regular"
  },
  "with-fallbacks": {
    "$type": "fontFamily",
    "$value": ["Graphik Regular", "-system-ui", "Helvetica", "sans-serif"]
  }
}
```

```yaml [YAML]
no-fallbacks:
  $type: fontFamily
  $value: Graphik Regular
with-fallbacks:
  $type: fontFamily
  $value:
    - Graphik Regular
    - -system-ui
    - Helvetica
    - sans-serif
```

:::

| Property       |          Type          | Description                                                                                                              |
| :------------- | :--------------------: | :----------------------------------------------------------------------------------------------------------------------- |
| `$type`        |        `string`        | **Required.** `"fontFamily"`                                                                                             |
| `$value`       | `string` \| `string[]` | **Required.** Either a string for a single font name, or an array of strings to include fallbacks (most preferred first) |
| `$description` |        `string`        | (Optional) A description of this token and its intended usage.                                                           |

## Notes

- In an old version of the spec, this originally had a `$type` of `font`.

## See also

- [Typography tokens](/tokens/typography)

```

```
