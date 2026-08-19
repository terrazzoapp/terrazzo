---
"@terrazzo/plugin-css": patch
---

Fix `propertyDefinitions` generating invalid `initial-value: var(--…)` for aliased values. Aliases are now resolved to their literal value at build time, so aliased tokens get a typed `syntax` instead of `'*'`.
