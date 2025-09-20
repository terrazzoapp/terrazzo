---
title: Lint
layout: ../../../layouts/docs.astro
---

# Lint

The idea of token linting is similar to any kind of code linting—you can run checks on your tokens to raise errors and warnings based on a number of criteria:

| Rule                                                                       | Description                                                                               |
| :------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| [core/valid-color](#corevalid-color)                                       | Require [color tokens](/docs/reference/tokens/#color) to follow the format.               |
| [core/valid-dimension](#corevalid-dimension)                               | Require [dimension tokens](/docs/reference/tokens/#dimension) to follow the format.       |
| [core/valid-font-family](#corevalid-font-family)                           | Require [fontFamily tokens](/docs/reference/tokens/#font-family) to follow the format.    |
| [core/valid-font-weight](#corevalid-font-weight)                           | Require [fontWeight tokens](/docs/reference/tokens/#font-weight) to follow the format.    |
| [core/valid-duration](#corevalid-duration)                                 | Require [duration tokens](/docs/reference/tokens/#duration) to follow the format.         |
| [core/valid-cubic-bezier](#corevalid-cubic-bezier)                         | Require [cubicBezier tokens](/docs/reference/tokens/#cubic-bezier) to follow the format.  |
| [core/valid-number](#corevalid-number)                                     | Require [number tokens](/docs/reference/tokens/#number) to follow the Terrazzo extension. |
| [core/valid-link](#corevalid-link)                                         | Require [link tokens](/docs/reference/tokens/#link) to follow the Terrazzo extension.     |
| [core/valid-boolean](#corevalid-boolean)                                   | Require [boolean tokens](/docs/reference/tokens/#boolean) to follow Terrazzo extension.   |
| [core/valid-string](#corevalid-string)                                     | Require [string tokens](/docs/reference/tokens/#string) to follow the Terrazzo extension. |
| [core/valid-stroke-style](#corevalid-stroke-style)                         | Require [stroke-style tokens](/docs/reference/tokens/#stroke-style) to follow the format. |
| [core/valid-border](#corevalid-border)                                     | Require [border tokens](/docs/reference/tokens/#border) to follow the format.             |
| [core/valid-transition](#corevalid-transition)                             | Require [transition tokens](/docs/reference/tokens/#transition) to follow the format.     |
| [core/valid-shadow](#corevalid-shadow)                                     | Require [shadow tokens](/docs/reference/tokens/#shadow) to follow the format.             |
| [core/valid-gradient](#corevalid-gradient)                                 | Require [gradient tokens](/docs/reference/tokens/#gradient) to follow the format.         |
| [core/valid-typography](#corevalid-typography)                             | Require [typography tokens](/docs/reference/tokens/#typography) to follow the format.     |
| [core/colorspace](#corecolorspace)                                         | Enforce that all colors are declared in a specific colorspace (e.g. sRGB).                |
| [core/consistent-naming](#coreconsistent-naming)                           | Enforce a consistent naming style (e.g. camelCase).                                       |
| [core/duplicate-value](#coreduplicate-value)                               | Enforce tokens can’t redeclare the same value (excludes aliases).                         |
| [core/descriptions](#coredescriptions)                                     | Enforce tokens have descriptions.                                                         |
| [core/max-gamut](#coremax-gamut)                                           | Enforce colors are within the specified gamut (e.g. display-p3).                          |
| [core/required-children](#corerequired-children)                           | Enforce token groups have specific children, whether tokens and/or groups.                |
| [core/required-modes](#corerequired-modes)                                 | Enforce certain tokens have specific modes.                                               |
| [core/required-typography-properties](#corerequired-typography-properties) | Enforce typography tokens have required properties (e.g. `lineHeight`).                   |
| [a11y/min-contrast](#a11ymin-contrast)                                     | Ensure minimum WCAG 2.2 contrast given token pairs.                                       |
| [a11y/min-font-size](#a11ymin-font-size)                                   | Ensure minimum font size.                                                                 |

## Config

To opt into a lint rule, add a `lint.rules` object in your config. The key is the lint rule name, and the value is a string indicating the severity:

| Severity  | Description                                                   |
| :-------- | :------------------------------------------------------------ |
| `"error"` | Stop token parsing immediately and throw an error.            |
| `"warn"`  | Don’t block token parsing, but print an error to the console. |
| `"off"`   | Disable this rule.                                            |

Lastly, many rules accept additional options. If passing options, use the `[severity, options]` tuple format:

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/colorspace": "warn",
      "core/consistent-naming": ["error", { format: "kebab-case" }],
      "core/duplicate-values": "off",
    },
  },
});
```

:::

## Rules

### core/valid-color

Require all color tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-color": [
        "error",
        { legacyFormat: false, ignoreRanges: false },
      ],
    },
  },
});
```

:::

| Option           | Description                                                                 |
| :--------------- | :-------------------------------------------------------------------------- |
| **legacyFormat** | Allow declaration of legacy sRGB hex codes for `$value` (default: `false`). |
| **ignoreRanges** | Allow colors to exceed CSS Color Module 4 ranges (default: `false`).        |

### core/valid-dimension

Require all dimension tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-dimension": [
        "error",
        { legacyFormat: false, unknownUnits: false },
      ],
    },
  },
});
```

:::

| Option           | Description                                               |
| :--------------- | :-------------------------------------------------------- |
| **legacyFormat** | Allow legacy string values (`"12px"`) (default: `false`). |
| **unknownUnits** | Allow usage of any `unit` values (default: `false`).      |

### core/valid-font-family

Require all fontFamily tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-font-family": "error",
    },
  },
});
```

:::

### core/valid-font-weight

Require all fontWeight tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-font-weight": "error",
    },
  },
});
```

| Option    | Description                                                 |
| :-------- | :---------------------------------------------------------- |
| **style** | Enforce all weights are `"numbers"` or `"names"` (strings). |

:::

### core/valid-duration

Require all duration tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-duration": "error",
    },
  },
});
```

:::

### core/valid-cubic-bezier

Require all cubicBezier tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-cubic-bezier": "error",
    },
  },
});
```

:::

### core/valid-number

Require all number tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-number": "error",
    },
  },
});
```

:::

### core/valid-link

Require all link tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-link": "error",
    },
  },
});
```

:::

### core/valid-boolean

Require all boolean tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-boolean": "error",
    },
  },
});
```

:::

### core/valid-string

Require all string tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-string": "error",
    },
  },
});
```

:::

### core/valid-stroke-style

Require all strokeStyle tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-stroke-style": "error",
    },
  },
});
```

:::

### core/valid-border

Require all border tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-border": "error",
    },
  },
});
```

:::

### core/valid-transition

Require all transition tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-transition": "error",
    },
  },
});
```

:::

### core/valid-shadow

Require all shadow tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-shadow": "error",
    },
  },
});
```

:::

### core/valid-gradient

Require all gradient tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-gradient": "error",
    },
  },
});
```

:::

### core/valid-typography

Require all typography tokens to follow the format.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/valid-typography": "error",
    },
  },
});
```

:::

### core/colorspace

Enforce that all colors are declared in a specific color space (e.g. sRGB).

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/colorspace": ["error", { colorSpace: "oklab" }],
    },
  },
});
```

:::

| Option         | Description                                                                                                                                    |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| **colorSpace** | Any valid [CSS Color Module 4](https://www.w3.org/TR/css-color-4/#predefined) predefined color space, e.g. `srgb`, `display-p3`, `oklab`, etc. |
| **ignore**     | Array of token globs to ignore, e.g. (`'["legacy.*"]`)                                                                                         |

### core/consistent-naming

Enforce a consistent naming style (e.g. camelCase).

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/consistent-naming": ["error", { format: "kebab-case" }],
    },
  },
});
```

:::

| Option     | Description                                                                                                    |
| :--------- | :------------------------------------------------------------------------------------------------------------- |
| **format** | `kebab-case`, `camelCase`, `PascalCase`, `snake_case`, `SCREAMING_SNAKE_CASE`, or a custom validator function. |
| **ignore** | Array of token globs to ignore, e.g. (`'["legacy.*"]`)                                                         |

### core/duplicate-value

Enforce tokens can’t redeclare the same value (excludes aliases).

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/duplicate-value": "error",
    },
  },
});
```

:::

| Option     | Description                                            |
| :--------- | :----------------------------------------------------- |
| **ignore** | Array of token globs to ignore, e.g. (`'["legacy.*"]`) |

### core/descriptions

Enforce tokens have descriptions. Having a description on a group doesn’t count.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/descriptions": "error",
    },
  },
});
```

:::

| Option     | Description                                          |
| :--------- | :--------------------------------------------------- |
| **ignore** | Array of token globs to ignore, e.g. `'["legacy.*"]` |

### core/max-gamut

Enforce colors are within the specified gamut.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/max-gamut": ["error", { format: "srgb" }],
    },
  },
});
```

:::

| Option     | Description                                          |
| :--------- | :--------------------------------------------------- |
| **gamut**  | `srgb`, `p3`, or `rec2020`.                          |
| **ignore** | Array of token globs to ignore, e.g. `'["legacy.*"]` |

### core/required-children

Enforce token groups have specific children, whether tokens and/or groups.

A Match consists of a `match` glob to match against, along with either `requiredTokens` and/or `requiredGroups`. Here are some examples:

:::code-group

<!-- prettier-ignore -->
```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/required-children": [
        "error",
        {
          matches: [
            // example 1: require all color.base tokens to be a ramp with 100–900 values
            {
              match: ["color.base.*"],
              requiredTokens: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
            },

            // example 2: require all text.* and bg.* tokens to have specific states
            {
              match: ["text.*", "bg.*"],
              requiredGroups: ["action", "disabled", "error", "warn", "success"],
            },
          ],
        },
      ],
    },
  },
});
```

:::

| Option                        | Description                                                                       |
| :---------------------------- | :-------------------------------------------------------------------------------- |
| **matches**                   | Array of Matches.                                                                 |
| matches[n].**match**          | Array of token globs to include, e.g. `["color.*"]`                               |
| matches[n].**requiredTokens** | Array of strings to match against sub-token IDs, e.g. `["100", "200", …]`         |
| matches[n].**requiredGroups** | Array of strings to match against sub-group IDs, e.g. `["action", "disabled", …]` |

### core/required-modes

Enforce certain tokens have specific modes.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/required-modes": [
        "error",
        {
          matches: [
            {
              match: ["color.*"],
              modes: ["light", "dark"],
            },
          ],
        },
      ],
    },
  },
});
```

:::

| Option               | Description                                                                   |
| :------------------- | :---------------------------------------------------------------------------- |
| **matches**          | Array of Matches.                                                             |
| matches[n].**match** | Array of token globs to include, e.g. `["size.*", "typography.*"]`            |
| matches[n].**modes** | Array of strings to match against mode names, e.g. `["mobile", "desktop", …]` |

### core/required-typography-properites

Enforce typography tokens have required properties.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "core/required-typography-properties": [
        "error",
        {
          properties: [
            "fontFamily",
            "fontSize",
            "fontStyle",
            "fontWeight",
            "letterSpacing",
            "lineHeight",
          ],
        },
      ],
    },
  },
});
```

:::

| Option         | Description                                                                         |
| :------------- | :---------------------------------------------------------------------------------- |
| **properties** | Array of required properties, e.g. `["fontFamily", "fontSize", "letterSpacing", …]` |
| **ignore**     | Array of token globs to ignore, e.g. `'["typography.legacy.*"]`                     |

### a11y/min-contrast

Enforce colors meet minimum contrast checks for WCAG 2. Rather than test every possible combination in your color system, which would lead to lots of false positives, instead you declare your contrast pairs.

Each pair consists of a `foreground` and `background` color to test (note that while WCAG 2 doesn’t distinguish between foreground and background, some other color algorithms do). Optionally, you can set `largeText = true` if this is for large or bold text (which lessens the contrast requirements a bit).

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "a11y/min-contrast": [
        "error",
        {
          level: "AA",
          pairs: [
            {
              foreground: "color.text-primary",
              background: "color.bg-primary",
            },
            {
              foreground: "color.error-text",
              background: "color.error-bg",
            },
            {
              foreground: "color.action-text",
              background: "color.action-bg",
            },
          ],
        },
      ],
    },
  },
});
```

:::

| Option                  | Description                                                                                                             |
| :---------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| **level**               | `AA` or `AAA`, corresponding to the [WCAG conformance levels](https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum) |
| **pairs**               | Pairs of tokens to test.                                                                                                |
| pairs[n].**foreground** | Token ID of the foreground to test (must be a color token)                                                              |
| pairs[n].**background** | Token ID of the foreground to test (must be a color token)                                                              |
| pairs[n].**largeText**  | (Optional) Is this [large text](https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum)?                              |

### a11y/min-font-size

Enforce font sizes are no smaller than the given value.

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";

export default defineConfig({
  lint: {
    rules: {
      "a11y/min-font-size": ["error", { minSizeRem: 1 }],
    },
  },
});
```

:::

| Option         | Description                                         |
| :------------- | :-------------------------------------------------- |
| **minSizePx**  | Min screen pixel size a font may be.                |
| **minSizeRem** | Min rem size a font may be.                         |
| **ignore**     | Array of token globs to ignore, e.g. `["legacy.*"]` |

## Writing your own plugin

Writing your own linter is easy! Terrazzo’s lint API is heavily-inspired by ESLint, but even simpler. See [the plugin section on linting](/docs/cli/api/plugin-development#lint) to get started.

_Written a linter yourself? [Add it!](https://github.com/terrazzoapp/terrazzo/pulls)_
