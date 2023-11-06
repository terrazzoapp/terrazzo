---
title: Link Token
---

# Link

**Cobalt extension**. A link to a [resource](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/link) such as an image. Not a supported token type outside of Cobalt.

::: code-group

```json [JSON]
{
  "iconAlert": {
    "$type": "link",
    "$value": "/assets/icons/alert.svg"
  }
}
```

```yaml [YAML]
iconAlert:
  $type: link
  $value: /assets/icons/alert.svg
```

:::

| Property       |   Type   | Description                                                                      |
| :------------- | :------: | :------------------------------------------------------------------------------- |
| `$type`        | `string` | **Required.** `"link"`                                                           |
| `$value`       | `string` | **Required.** Path to a resource, which can either be a partial or complete URL. |
| `$description` | `string` | (Optional) A description of this token and its intended usage.                   |

## Usage

Assets such as icons, images, and logos are a critical part of any design system. The behavior of how assets are handled depends on the [plugin](/guides/getting-started#next-steps) used. For example, the [CSS plugin](/integrations/css) can optionally embed small files directly into CSS for performance.

There’s also the image optimization plugin (coming soon) that can optimize image and icon assets.

Refer to each plugin’s documentation to learn what special features are available for Link token types.

```

```
