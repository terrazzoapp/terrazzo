---
"@terrazzo/token-tools": patch
"@terrazzo/plugin-css": patch
"@terrazzo/plugin-vanilla-extract": patch
---

Preserve units on zero-valued dimension tokens instead of serializing them as bare `0`.

This keeps generated design-token values such as `0px` and `0rem` type-compatible when consumers compose them in CSS math functions like `calc()`.
