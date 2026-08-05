---
"@terrazzo/plugin-css": patch
---

Add the `--` prefix to generated CSS custom properties when a `variableName()` function returns a name without one, so a config like the plugin README's `variableName: (token) => token.id.replace(/\./g, "-")` now emits `--color-brand: …` instead of the invalid declaration `color-brand: …`. Names that already start with `--` are left as-is, so existing `variableName()` functions built on `makeCSSVar()` are unaffected.

Previously the returned name was used verbatim, which produced declarations that are not custom properties at all and that every browser silently drops. Aliases were emitted as `var(color-brand)`, and typography/transition shorthands drifted out of sync with the properties above them — the shorthand referenced `var(--typography-body-font-size)` while the declaration was `typography-body-font-size`, because shorthand generation already normalized the name through `makeCSSVar()`.
