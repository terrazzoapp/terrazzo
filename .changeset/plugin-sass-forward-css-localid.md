---
"@terrazzo/plugin-sass": patch
---

Forward the CSS plugin's `localID` when registering the sass transform, so any `variableName` customization (prefixes, casing) configured on plugin-css is honored by the generated `$__token-values` Sass map.

Previously, plugin-sass's `transform` hook set `localID: token.id` (the dotted DTCG id), which `build.ts` then read via `getTransforms({ format: FORMAT_ID })` and turned into a CSS variable name from scratch — bypassing the CSS plugin's `variableName` and producing `var(--color-blue)` instead of `var(--ds-color-blue)` (for a `variableName` configured with a `ds` prefix, as in the test fixtures) in the main token-values map. The typography mixins map was unaffected because that loop queries `format: 'css'` directly.

Regression introduced in 2.2.0 (PR #589) when the main loop in `build.ts` switched from `format: 'css'` to `format: FORMAT_ID`.
