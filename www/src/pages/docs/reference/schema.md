---
title: tokens.yaml Specification
layout: ../../../layouts/docs.astro
---

# Cobalt Schema Specification v1

`tokens.yaml` consists of 2 parts: the [Document root](#document-root) and [nested tokens](#tokens).

## Document root

The top level of `tokens.yaml` contains information about the file. It may contain the following keys:

| Key        |   Required   | Description                                                                                                                       |
| :--------- | :----------: | :-------------------------------------------------------------------------------------------------------------------------------- |
| `name`     |              | The name of your tokens or design system                                                                                          |
| `metadata` |              | Arbitrary user data. Metadata isn’t read or used by Cobalt. But you can store notes, links, or any other data in here you’d like. |
| `tokens`   | **required** | An object of tokens (see [Tokens](#tokens-and-groups))                                                                            |

#### Example

```yaml
name: My Tokens
metadata:
  documentation_url: https://tokens.dev/docs
  foo: 123
tokens:
  # …
```

## Tokens and Groups

### Tokens

[Tokens][concepts-tokens] are the elemental building blocks of any design system. They encompass colors, typography, grid spacing, icons, and more. To declare a new token, you’ll need to create a unique ID under `tokens` in the document root, along with
all necessary data for that token:

| Key           |   Required   | Description                                                                 |
| :------------ | :----------: | :-------------------------------------------------------------------------- |
| `name`        |              | A human-readable name for this token                                        |
| `description` |              | A longer description about this token’s purpose, usage, etc.                |
| `type`        | **required** | `token`, `url`, or `file`                                                   |
| `value`       | **required** | The token’s default value along with any [mode values][concepts-modes] used |

#### Types

Almost every token will use `type: token`. This allows the greatest flexibility for your design system, as a token can be a color, number, string—anything. The only times to use `file` or `url` are when you are either pointing to a local file on disk or a
remote URL. `file` and `url` types can unlock special features for the [plugins][plugins] you have enabled (such as embedding SVG icons into CSS).

#### Example

```yaml
name: My Tokens
tokens:
  color_blue:
    name: Brand Blue
    type: token
    value:
      default: '#0969da'
  color_green:
    name: Brand Green
    type: token
    value:
      default: '#1a7f37'
  font_helvetica:
    name: Helvetica
    type: token
    value:
      default: Helvetica
  icon_alert:
    name: Alert
    type: url
    value:
      default: https://cdn.icons.dev/alert_24.svg
```

### Groups

Groups keep tokens tidy and encourage good namespacing. To declare a group, provide the following keys:

| Key           |   Required   | Description                                                  |
| :------------ | :----------: | :----------------------------------------------------------- |
| `name`        |              | A human-readable name for this group                         |
| `description` |              | A longer description about this group’s purpose, usage, etc. |
| `type`        | **required** | `"group"`                                                    |
| `tokens`      | **required** | Key–value object of [Tokens](#tokens) underneath this group. |

### Example

```yaml
name: My Tokens
tokens:
  color:
    type: group
    tokens:
      blue:
        name: Brand Blue
        type: token
        value:
          default: '#0969da'
      green:
        name: Brand Green
        type: token
        value:
          default: '#1a7f37'
  type:
    type: group
    tokens:
      family:
        type: group
        tokens:
          helvetica:
            name: Helvetica
            type: token
            value:
              default: Helvetica
  icon:
    type: group
    tokens:
      alert:
        name: Alert
        type: url
        value:
          default: https://cdn.icons.dev/alert_24.svg
```

## Advanced Syntax

### Modes

[Modes][concepts-modes] are alternate versions of your tokens. For example, say your design system has a **standard** palette and an alternate version optimized for **colorblind** users. Here’s one way you could declare that:

```yaml
# ❌ Mixing "standard" and "colorblind" palettes
tokens:
  red:
    type: token
    value:
      default: '#cf222e'
  red_colorblind:
    type: token
    value:
      default: '#ac5e00'
```

This _works_ but has several problems:

- ❌ multiple palettes are mixed into one
- ❌ this suggests `red` and `red_colorblind` should be used alongside one another (defeating the whole purpose!)
- ❌ it’s unclear what the purpose of `red_colorblind` is, and will likely be avoided by engineers

To address all these, let’s use modes instead:

```yaml
# ✅ Separating palettes into modes
tokens:
  group:
    type: color
    modes:
      - standard
      - colorblind
    tokens:
      red:
        type: token
        value:
          default: '#cf222e'
          standard: '#cf222e'
          colorblind: '#ac5e00'
```

This is much better:

- ✅ palettes are kept separate
- ✅ when `colorblind` mode is enabled, it prevents standard red from being used
- ✅ in code, switching from `standard` to `colorblind` mode automatically creates the palette

There’s a lot of flexibility you can unlock with modes. [Read more about using modes][concepts-modes]

### Optional syntax

Adding all your tokens into `tokens.yaml` can result in a lot of noise. So if desired, you can take advantage of some optional space savers:

#### Skip type

Whenever `type` is omitted, `type: token` is assumed:

```diff
  tokens:
    blue:
-     type: token
      value:
        default: '#0969da'
```

#### Skip default

If a token only has one value–`default`—you can flatten it:

```diff
  tokens:
    blue:
      type: token
-     value:
-       default: '#0969da'
+     value: '#0969da'
```

#### Flatten modes

In cases where modes have a logical order (e.g. sizes), you can turn an object of values into an array (with `default` first, followed by modes:)

```diff
  tokens:
    type:
      type: group
      modes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
      tokens:
        size:
          type: token
-         value:
-           default: 16
-           XS: 10
-           S: 12
-           M: 16
-           L: 18
-           XXL: 22
+         value: [16, 10, 12, 16, 18, 22]
```

_Note: it’s best to avoid flattening modes when they don’t have a logical order, such as color modes._

## Examples

[View examples of `tokens.yaml` on GitHub][examples]

[concepts-modes]: /docs/concepts/modes
[concepts-tokens]: /docs/concepts/tokens
[examples]: https://github.com/drwpow/cobalt-ui/blob/main/examples/
[jsonschema]: https://json-schema.org/
[openapi]: https://swagger.io/specification/
[plugins]: /docs/plugins
[yaml]: https://yaml.org/
