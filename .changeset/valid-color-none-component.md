---
"@terrazzo/parser": patch
"@terrazzo/token-tools": patch
---

Accept the DTCG `"none"` keyword in color components: `core/valid-color` no longer reports it as out of range, and CSS output keeps it as `none` instead of producing `NaN` values
