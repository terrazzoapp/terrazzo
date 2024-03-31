---
title: Linting
---

# Linting

Token linting is the same as any other type of code linting—you can catch common errors in your tokens during your build such as naming mismatches, duplicate values, and even color contrast checks. Cobalt’s powerful linting capabilities can help catch a multitude of issues in any tokens manifest cheaply and instantly, without complex and expensive testing setups.

You can configure the rules in `lint.rules` key in [tokens.config.js](/advanced/config).

The syntax is similar to many linters such as ESLint. First you declare a **rule**, then whether you want it to throw an **error**, **warn**, or to be **off** completely:

::: code-group

```js [tokens.config.mjs]
/** @type {import("@cobalt-ui/core").Config} */
export default {
  lint: {
    rules: {
      "my-lint-rule": "error", // throw an error for this rule
      "my-lint-rule": "warn", // throw a warning for this rule
      "my-lint-rule": "off", // disable this rule
    },
  },
};
```

:::

Some rules allow for additional settings, depending on the rule. To set those, pass an array with the 1st item being a **severity** and the 2nd item being the **options**:

```js
export default {
  lint: {
    rules: {
      "my-lint-rule": ["error", { foo: "bar" }], // throw an error AND configure settings only for this rule
    },
  },
};
```

Not all rules have options. Refer to each rule’s documentation to see what it can accept.

## Built-in Rules

The following rules are all available in `@cobalt-ui/core` by default without any additional plugins.

| Rule                                                              | Default  | Description                                                                                                    |
| :---------------------------------------------------------------- | :------: | :------------------------------------------------------------------------------------------------------------- |
| [duplicate-values](#duplicate-values)                             | `"warn"` | Enforce no tokens have duplicate values.                                                                       |
| [naming](#naming)                                                 | `"off"`  | Enforce all token names follow a specific style (e.g. `kebab-case` or `camelCase`)                             |
| [required-children](#required-children)                           | `"off"`  | Enforces matching groups have required children.                                                               |
| [required-modes](#required-modes)                                 | `"off"`  | Enforces matching tokens have required [modes](/guides/modes).                                                 |
| [color/format](#color-format)                                     | `"off"`  | Enforce [color tokens](/tokens/color) are declared in a certain format (e.g. [oklch](https://oklch.com)).      |
| [color/gamut](#color-gamut)                                       | `"warn"` | Enforce [color tokens](/tokens/color) are displayable within the specified gamut (`srgb`, `p3`, or `rec2020`). |
| [typography/required-properties](#typography-required-properties) | `"off"`  | Enforce [typography tokens](/tokens/typography) have specific properties (e.g. `fontWeight`).                  |

### duplicate-values

Enforce no tokens have duplicate values.

```js
{
  "duplicate-values": ["error", { ignore: ["color.semantic.*"] }],
}
```

| Option   |    Type    | Description                                           |
| :------- | :--------: | :---------------------------------------------------- |
| `ignore` | `string[]` | (Optional) Token IDs to ignore. Supports globs (`*`). |

::: details ❌ Failures

```json
{
  "color": {
    "blue": {
      "100": { "$type": "color", "$value": "#3c3c43" },
      "200": { "$type": "color", "$value": "#3c3c43" }
    }
  }
}
```

:::

::: details ✅ OK

Aliases are OK:

```json
{
  "color": {
    "blue": {
      "100": { "$type": "color", "$value": "#3c3c43" },
      "200": { "$type": "color", "$value": "{color.blue.100}" }
    }
  }
}
```

Values that are equivalent but formatted differently aren’t violations:

```json
{
  "color": {
    "rgb": { "$type": "color", "$value": "#3c3c43" },
    "hsl": { "$type": "color", "$value": "hsl(240, 5.5%, 24.9%)" }
  }
}
```

:::

### naming

Require token IDs to match a consistent format.

```js
{
  naming: ["error", { format: "kebab-case" }],
}
```

Alternately, provide your own function that returns an error `string` on failure:

```js
{
  naming: [
    "error",
    {
      format: (tokenID) => (tokenID.includes("bad-word") ? "No bad words allowed!" : undefined),
    },
  ],
}
```

| Option   |         Type         | Description                                                                                                          |
| :------- | :------------------: | :------------------------------------------------------------------------------------------------------------------- |
| `format` | `string \| Function` | Enforce `kebab-case`, `PascalCase`, `camelCase`, `snake_case`, `SCREAMING_SNAKE_CASE`, or provide your own function. |
| `ignore` |      `string[]`      | (Optional) Token IDs to ignore. Supports globs (`*`).                                                                |

::: details ❌ Failures

`actionText` should be `action-text`:

```json
{
  "actionText": { "$type": "color", "$value": "#3c3c43" }
}
```

:::

::: details ✅ OK

```json
{
  "action-text": { "$type": "color", "$value": "#3c3c43" }
}
```

:::

### required-children

Require specific groups to have specific children.

| Option    |   Type    | Description                                                                                                                                   |
| :-------- | :-------: | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| `matches` | `Match[]` | Array of Matches. A Match has a `match` and `requiredTokens` and/or `requiredGroups`. All are `string[]`s. Only `match` supports globs (`*`). |

```js
{
  "required-children": [
    "error", // or "warn"
    {
      matches: [
        {
          match: ["color.base.*"],
          requiredTokens: ["100", "200", "300"],
        },
        {
          match: ["color.semantic.*"],
          requiredGroups: ["action", "error"],
        },
      ],
    },
  ],
}
```

::: details ❌ Failures

`color.blue` missing required child token `300`:

```json
{
  "color": {
    "base": {
      "blue": {
        "100": { "$type": "color", "$value": "#fbfdff" },
        "200": { "$type": "color", "$value": "#f4faff" }
      }
    }
  }
}
```

`color.semantic.*` missing required group `error`:

```json
{
  "color": {
    "semantic": {
      "action": {
        "text": { "$type": "color", "$value": "#5eb1ef" },
        "bg": { "$type": "color", "$value": "#fbfdff" }
      }
    }
  }
}
```

:::

::: details ✅ OK

`100`, `200`, and `300` are present for the entire `color.*` group:

```json
{
  "color": {
    "blue": {
      "100": { "$type": "color", "$value": "#fbfdff" },
      "200": { "$type": "color", "$value": "#f4faff" },
      "300": { "$type": "color", "$value": "#e6f4fe" }
    }
  }
}
```

`color.semantic.*` has both `action` and `error` groups:

```json
{
  "color": {
    "semantic": {
      "action": {
        "text": { "$type": "color", "$value": "#5eb1ef" },
        "bg": { "$type": "color", "$value": "#fbfdff" }
      },
      "error": {
        "text": { "$type": "color", "$value": "#eb8e90" },
        "bg": { "$type": "color", "$value": "#fff7f7" }
      }
    }
  }
}
```

:::

### required-modes

Require tokens to have specific [modes](/guides/modes). Provide a key–value list where the key is a token or group name (supports globs), and the value is an array of strings with required modes.

| Option    |   Type    | Description                                                                                                          |
| :-------- | :-------: | :------------------------------------------------------------------------------------------------------------------- |
| `matches` | `Match[]` | Array of Matches. A Match has a `match` and `requiredModes`. All are `string[]`s. Only `match` supports globs (`*`). |

::: tip

This replaces the older [$extensions.requiredModes](/guides/modes#validation) property that lives in `tokens.json`. This is more flexible, and doesn’t clutter up your tokens.

:::

```js
{
  "required-modes": [
    "error", // or "warn"
    {
      matches: [
        {
          match: ["typography.*"],
          requiredModes: ["mobile", "desktop"],
        },
      ],
    },
  ],
}
```

::: details ❌ Failures

`typography.size.body` missing required mode `"mobile"`

```json
{
  "typography": {
    "size": {
      "body": {
        "$type": "dimension",
        "$value": "16px",
        "$extensions": {
          "mode": {
            "desktop": "16px"
          }
        }
      }
    }
  }
}
```

:::

::: details ✅ OK

`typography.size.body` has all required modes `"mobile"` and `"desktop"`

```json
{
  "typography": {
    "size": {
      "body": {
        "$type": "dimension",
        "$value": "16px",
        "$extensions": {
          "mode": {
            "mobile": "16px",
            "desktop": "16px"
          }
        }
      }
    }
  }
}
```

:::

### color/format

::: warning

`color/format` will have breaking changes when the DTCG spec changes its `color` format ([discussion](https://github.com/design-tokens/community-group/issues/79)). If using this lint rule, expect changes in the future.

:::

Require [color tokens](/tokens/color) to match a specific format (only [CSS Color Module 4](https://www.w3.org/TR/css-color-4/#color-syntax) colorspaces supported).

| Option   |    Type    | Description                                                                                                                                                                              |
| :------- | :--------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format` |  `string`  | Specify any of the following: `hex`, `srgb`, `a98-rgb`, `display-p3`, `hsl`, `hsv`, `hwb`, `lab`, `lch`, `oklab`, `oklch`, `prophoto-rgb`, `rec2020`, `srgb-linear`, `xyz50`, or `xyz65` |
| `ignore` | `string[]` | (Optional) Token IDs to ignore. Supports globs (`*`).                                                                                                                                    |

```js
{
  "color/format": ["error", { format: "oklch" }],
}
```

::: details ❌ Failures

`color.base.purple` doesn’t match mode `oklch`:

```json
{
  "color": {
    "base": {
      "purple": { "$type": "color", "$value": "#ab4aba" }
    }
  }
}
```

:::

::: details ✅ OK

`color.base.purple` matches `oklch` format:

```json
{
  "color": {
    "base": {
      "purple": { "$type": "color", "$value": "oklch(57.87% 0.188 322.11)" }
    }
  }
}
```

:::

### color/gamut

Enforces colors are within `srgb` gamut (smallest), `p3` (medium; contains all of sRGB), or `rec2020` (largest; contains all of sRGB + P3).

Require [color tokens](/tokens/color) to match a specific format (only [CSS Color Module 4](https://www.w3.org/TR/css-color-4/#color-syntax) colorspaces supported).

| Option   |    Type    | Description                                           |
| :------- | :--------: | :---------------------------------------------------- |
| `gamut`  |  `string`  | `srgb`, `p3`, or `rec2020`.                           |
| `ignore` | `string[]` | (Optional) Token IDs to ignore. Supports globs (`*`). |

```js
{
  "color/gamut": ["error", { gamut: "srgb" }],
}
```

::: details ❌ Failures

`color.base.teal` is outside the sRGB range, which means it won’t display the same on older monitors:

```json
{
  "color": {
    "base": {
      "teal": { "$type": "color", "$value": "oklch(87.65% 0.276 173.65)" }
    }
  }
}
```

:::

::: details ✅ OK

`color.base.teal` is safely within the sRGB range:

```json
{
  "color": {
    "base": {
      "teal": { "$type": "color", "$value": "oklch(87.59% 0.167 173.65)" }
    }
  }
}
```

:::

### typography/required-properties

Enforces [typography tokens](/tokens/typography) have required properties. This is especially helpful when using [variable fonts](https://fonts.google.com/knowledge/introducing_type/introducing_variable_fonts).

| Option       |    Type    | Description                                           |
| :----------- | :--------: | :---------------------------------------------------- |
| `properties` | `string[]` | List of properties all typography tokens should have. |
| `ignore`     | `string[]` | (Optional) Token IDs to ignore. Supports globs (`*`). |

```js
{
  "typography/required-properties": ["error", { properties: ["fontSize", "fontFamily", "fontStyle", "fontWeight"] }],
}
```

::: details ❌ Failures

`typography.base.body` missing `fontStyle`:

```json
{
  "typography": {
    "base": {
      "body": {
        "$type": "typography",
        "$value": {
          "fontSize": "14px",
          "fontFamily": ["Helvetica"],
          "fontWeight": 400
        }
      }
    }
  }
}
```

:::

::: details ✅ OK

`typography.base.body` has all required properties:

```json
{
  "typography": {
    "base": {
      "body": {
        "$type": "typography",
        "$value": {
          "fontSize": "14px",
          "fontFamily": ["Helvetica"],
          "fontWeight": 400,
          "fontStyle": "normal"
        }
      }
    }
  }
}
```

:::

## a11y Rules

The [a11y plugin](/integrations/a11y) can handle color contrast checks, including the common WCAG 2 contrast check as well as advanced APCA color contrast checks.

| Rule                                              | Default | Description                                                                                                                                        |
| :------------------------------------------------ | :-----: | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| [a11y/contrast](/integrations/a11y#a11y-contrast) | `"off"` | Run WCAG2 and APCA contrast checks on all of your tokens (you have to manually specify the pairs, but it will work on any tokens in `tokens.json`) |

```sh
npm i -D @cobalt-ui/lint-a11y
```

::: code-group

```js [tokens.config.mjs]
import a11y from "@cobalt-ui/lint-a11y";

/** @type {import("@cobalt-ui/core").Config} */
export default {
  plugins: [a11y()],
  lint: {
    rules: {
      "a11y/contrast": [
        "error", // or "warn"
        {
          checks: [
            {
              tokens: {
                foreground: "color.semantic.text",
                background: "color.semantic.bg",
                typography: "typography.body",
                modes: ["light", "dark"],
              },
              wcag2: "AAA",
              apca: true,
            },
          ],
        },
      ],
    },
  },
};
```

[View docs](/integrations/a11y)

## Custom linters

You can also build your own linter by [creating your own plugin and giving it a lint step](/advanced/plugin-api#lint). It’s easier than you might think!

Have you built a plugin you’d like to add here? [Suggest it!](https://github.com/drwpow/cobalt-ui/blob/main/CONTRIBUTING.md)
