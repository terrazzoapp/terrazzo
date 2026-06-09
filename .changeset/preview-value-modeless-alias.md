---
"@terrazzo/plugin-token-listing": patch
---

Guard `computePreviewValue` against a mode-less alias token, so a typography token that aliases another typography token no longer crashes the listing build.
