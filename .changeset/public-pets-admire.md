---
"@terrazzo/token-tools": patch
"@terrazzo/plugin-css": patch
"@terrazzo/cli": patch
"@terrazzo/parser": patch
"@terrazzo/plugin-js": patch
"@terrazzo/plugin-sass": patch
"@terrazzo/plugin-tailwind": patch
"@terrazzo/plugin-vanilla-extract": patch
"@terrazzo/use-color": patch
---

Reduce decimal places in color output.

- [plugin-css] ⚠️ Minor breaking change: decimals have been simplified in output. To restore original behavior, pass in `colorDepth: 'unlimited'`
