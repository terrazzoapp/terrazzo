---
"@terrazzo/plugin-sass": patch
"@terrazzo/token-tools": patch
"@terrazzo/plugin-css": patch
"@terrazzo/plugin-js": patch
"@terrazzo/parser": patch
"@terrazzo/cli": patch
---

feat: @terrazzo/plugin-css now returns entire token for `variableName`. This is a minor breaking change from `variableName(name: string)` → `variableName(token: Token)`, but current users can just use `token.id` to get the same value as before.

⚠️ Minor internal breaking change as a result: `transformCSSValue()` in @terrazzo/token-tools now requires entire token️ to make this possible.
