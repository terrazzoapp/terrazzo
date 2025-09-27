---
"@terrazzo/token-tools": minor
"@terrazzo/parser": minor
"@terrazzo/cli": minor
"@terrazzo/plugin-css": minor
"@terrazzo/plugin-js": minor
"@terrazzo/plugin-sass": minor
"@terrazzo/plugin-swift": minor
"@terrazzo/plugin-tailwind": minor
"@terrazzo/plugin-vanilla-extract": minor
---

⚠️ [Plugin API] Minor breaking change: token.originalValue may be undefined for tokens created with $ref. This shouldn’t affect any tokens or plugins not using $refs. But going forward this value will be missing if the token was created dynamically via $ref.
