---
"@terrazzo/plugin-css": patch
"@terrazzo/parser": patch
"@terrazzo/cli": patch
"@terrazzo/plugin-css-in-js": patch
"@terrazzo/plugin-js": patch
"@terrazzo/plugin-sass": patch
"@terrazzo/plugin-tailwind": patch
"@terrazzo/plugin-token-listing": patch
"@terrazzo/plugin-vanilla-extract": patch
"@terrazzo/token-tools": patch
---

Improve token aliases where the primitive or primary has token, but aliases do not. This leads to dropped tokens in all plugins.
