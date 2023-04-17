---
title: Modes
layout: ../../../layouts/docs.astro
---

# Modes

Modes are **alternate forms of a token.** They allow your design system to account for different states or contexts that allow some values to change while others remain the same.

To explain this concept, we’ll explore 2 common usages: <b>color</b> and <b>typography</b>.

## Example: color modes

<figure>
  <img src="/images/mode-github.png" width="2034" height="1162">
  <figcaption>GitHub’s settings allow not only light and dark modes, but alternate color themes for color blindness.</figcaption>
</figure>

In this screenshot of GitHub’s dashboard you’ll find 5 color themes: _Light default_, _Light high contrast_, _Dark default_, _Dark high contrast_, and _Dark dimmed_ (shown above). How might that be represented in tokens?

_Note: since this guide was written, GitHub has since added additional color modes. But since that doesn’t change the concept, we’ll stick with the older (simpler) example for the purposes of illustration._

Consider the `red` and `white` colors in the system. Whereas `red` has a different value for each mode, `white` is an absolute value that doesn’t change. One way to represent that may be:

```json
{
  "color": {
    "$type": "color",
    "red": {"$value": "#fa4549"},
    "red-light": {"$value": "#fa4549"},
    "red-lightHighContrast": {"$value": "#d5232c"},
    "red-dark": {"$value": "#f85149"},
    "red-darkHighContrast": {"$value": "#ff6a69"},
    "red-darkDimmed": {"$value": "#f47067"},
    "white": {"$value": "#ffffff"}
  }
}
```

But off the bat we have some problems:

- Color themes are scattered between our original colors
- Token names now carry implicit context
- There’s not a clear abstraction of color themes
- It’s unclear when `[color]-[mode]` exists, and when it doesn’t
- Strict naming guidelines must be enforced for this to work long-term
- Updating/managing color modes can become a precarious game of find-and-replace
- What if “`red-darker`” was added in the future—do we now have `red-darker`, `red-darker-dark`, and `red-darker-light`?

<b>Modes</b> exist to solve these problems by decoupling token names from context and state. This is how it can be represented with modes (using the “$extensions” property from the token syntax):

```json
{
  "color": {
    "$type": "color",
    "red": {
      "$value": "#fa4549",
      "$extensions": {
        "mode": {
          "light": "#fa4549",
          "lightColorblind": "#d08002",
          "lightHighContrast": "#d5232c",
          "dark": "#f85149",
          "darkColorblind": "#c38000",
          "darkHighContrast": "#ff6a69"
        }
      }
    },
    "white": {"$value": "#ffffff"}
  }
}
```

Our tokens are vastly improved by having clear colors, and clear color modes. And color modes can be easily modified without affecting any names. Colors can optionally have mode variations, or not. And best of all, application-specific context isn’t affecting your token names.

This simplifies your application code, too, as, you can simply refer to `red` or `white` and the mode can be inferred based on the global context (see the [Examples in code](#examples-in-code) section below to see the “how”).

## Example: typographic modes

<figure>
  <img src="/images/mode-apple.png" width="1562" height="898">
  <figcaption>Apple’s dynamic text sizes use modes to control multiple type scales</figcaption>
</figure>

Another common example is **text size**. If users need to make the text bigger or smaller, they can adjust to their taste. But trying to have this context exist in the token names can result in pretty long values:

```json
{
  "typography": {
    "size": {
      "title1-xSmall": {"$value": "25px"},
      "title1-Small": {"$value": "26px"},
      "title1-Medium": {"$value": "27px"},
      "title1-Large": {"$value": "28px"},
      "title1-xLarge": {"$value": "30px"},
      "title1-xxLarge": {"$value": "32px"},
      "title1-xxxLarge": {"$value": "32px"}
    }
  }
}
```

Referring to a font size as `typography.size.title1-Medium` or `typography.size.title2-Medium` is a bad idea, because then every level of your application must be aware of the user’s current preference settings. And if values ever change, now your entire application must be updated everywhere.

Instead, by declaring font sizes as modes, the value becomes much more portable: `typography.size.title1`.

```json
{
  "typography": {
    "size": {
      "title1": {
        "$name": "Title 1",
        "$type": "dimension",
        "$value": "28px",
        "$extensions": {
          "mode": {
            "xSmall": "25px",
            "Small": "26px",
            "Medium": "27px",
            "Large": "28px",
            "xLarge": "30px",
            "xxLarge": "32px",
            "xxxLarge": "32px"
          }
        }
      }
    }
  }
}
```

Now the user preferences only have to be dealt with in the global context, and the rest of your code will adapt.

## Best practices

A mode is best used for **2 variations that are never used together.**

Back to the color example, if a user has requested colorblind-friendly colors, we’d never want to show them the colorblind-friendly green in some areas, and the colorblind-unfriendly green in the same view. We’d always want to respect their preferences. And thus, color modes are a great use of this.

So following that, here are some common scenarios for when modes should—or shouldn’t—be used.

### ✅ Good usecases for modes

Modes work best when a user can’t be in 2 contexts at once:

- User preferences (e.g. text size, reduced motion, colorblind mode)
- Device (e.g. mobile or desktop)
- Region/language
- Product/application area (e.g. different typographic settings in a dashboard UI vs longform content in marketing pages and documentation)

### ❌ Bad usecases for modes

However, when 2 or more things are frequently used side-by-side, modes should be avoided:

- Semantic color (e.g _success_ or _error_)
- Localized state (e.g. _disabled_ or _active_)
- Color shades/hues
- Components (e.g. _card_ or _button_)

## Examples in code

The examples above were generic concepts that applied to all languages. To see how to use modes in specific languages, see the following plugin docs:

- [@cobalt-ui/plugin-css](/docs/plugins/css#mode-selectors)
- [@cobalt-ui/plugin-js](/docs/plugins/js#usage)
- [@cobalt-ui/plugin-sass](/docs/plugins/sass#modes)

## Advanced

### Validation

To enforce all modes exist for a group. You can assert type checking with `metadata.requiredModes`:

```json
{
  "color": {
    "$extensions": {
      "requiredModes": ["light", "lightColorblind", "lightHighContrast", "dark", "darkColorblind", "darkHighContrast"]
    },
    "red-4": {
      "$type": "color",
      "$value": "#fa4549",
      "$extensions": {
        "mode": {
          "light": "#fa4549",
          "lightColorblind": "#d08002",
          "lightHighContrast": "#d5232c",
          "dark": "#f85149",
          "darkColorblind": "#c38000"
        }
      }
    }
  }
}
```

In the above example, we’d have an error on our `red-4` color because the `dark-high-contrast` mode is missing.

`requiredModes` can be enforced at any level. And it will require any and all siblings and children to have every mode present.
