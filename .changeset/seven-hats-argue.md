---
"@terrazzo/plugin-sass": minor
"@terrazzo/token-tools": minor
"@terrazzo/plugin-css": minor
"@terrazzo/plugin-js": minor
"@terrazzo/parser": minor
"@terrazzo/tokens": minor
"@terrazzo/cli": minor
---

fix: ⚠️ Breaking change: CSS aliases will revert to original 1.0 behavior and be “shallow,” meaning they’ll be preserved as-written. Terrazzo 2.0 (beta) attempted to simplify aliases to only be single-depth, but that results in unintentional behavior.
