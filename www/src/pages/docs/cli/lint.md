---
title: Lint
layout: ../../../layouts/docs.astro
---

# Lint

The idea of token linting is similar to any kind of code linting—you can run checks on your tokens to raise errors and warnings based on a number of criteria:

| Rule                                                                       | Description                                                                |
| :------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| [core/colorspace](#corecolorspace)                                         | Enforce that all colors are declared in a specific colorspace (e.g. sRGB). |
| [core/consistent-naming](#coreconsistent-naming)                           | Enforce a consistent naming style (e.g. camelCase).                        |
| [core/duplicate-value](#coreduplicate-value)                               | Enforce tokens can’t redeclare the same value (excludes aliases).          |
| [core/descriptions](#coredescriptions)                                     | Enforce tokens have descriptions.                                          |
| [core/max-gamut](#coremax-gamut)                                           | Enforce colors are within the specified gamut (e.g. display-p3).           |
| [core/required-children](#corerequired-children)                           | Enforce token groups have specific children, whether tokens and/or groups. |
| [core/required-modes](#corerequired-modes)                                 | Enforce certain tokens have specific modes.                                |
| [core/required-typography-properties](#corerequired-typography-properties) | Enforce typography tokens have required properties (e.g. `lineHeight`).    |
| [a11y/min-contrast](#a11ymin-contrast)                                     | Ensure minimum WCAG 2.2 contrast given token pairs.                        |
| [a11y/min-font-size](#a11ymin-font-size)                                   | Ensure minimum font size.                                                  |

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

### core/colorspace

Enforce that all colors are declared in a specific colorspace (e.g. sRGB).

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
