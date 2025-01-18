---
"@terrazzo/plugin-css": patch
"@terrazzo/parser": patch
"@terrazzo/cli": patch
"@terrazzo/plugin-js": patch
"@terrazzo/plugin-sass": patch
"@terrazzo/token-tools": patch
---

fix: Improve reverse alias lookups (needed for plugin-css, where redeclared base tokens need downstream aliases to be redeclared too, so the values aren’t stale)
