---
title: Font Family Token
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

- Font Family is a part of the [Typography](/tokens/typography) type

## Tips & recommendations

- The following universal fallback font stack is recommended for your base typography tokens:
  ```
  -apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji`
  ```
  This falls back to system fonts (if a glyph isn’t available) and enables emojis in every OS.
