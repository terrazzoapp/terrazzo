---
"@terrazzo/plugin-js": patch
"@terrazzo/parser": patch
"@terrazzo/token-tools": patch
"@terrazzo/token-types": patch
---

Add a dependency-free `@terrazzo/token-types` package and use it for generated JS plugin declarations so published token packages do not require consumers to install `@terrazzo/parser`.
