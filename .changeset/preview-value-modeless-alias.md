---
"@terrazzo/plugin-token-listing": patch
---

Fix `computePreviewValue` throwing `TypeError: Cannot use 'in' operator to search for '.' in undefined` when a typography token aliases another typography token.

The recursive alias transform (`recursiveNoAliasTransform`) is handed a mode-less stub for the alias target, then evaluates `mode in rToken.mode` on it. When `rToken.mode` is `undefined` the `in` operator throws, which aborts the whole listing build. The mode selection now also checks that `rToken.mode` exists before the `in` test, falling back to the default mode `'.'` exactly as it already does when the requested mode isn't present.
