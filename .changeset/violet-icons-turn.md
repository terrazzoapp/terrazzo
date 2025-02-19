---
"@terrazzo/cli": patch
"@terrazzo/parser": patch
"@terrazzo/token-tools": patch
---

Bugfix: allow resolving from node_modules in @terrazzo/cli (note: @terrazzo/parser/JS API still runs in browser, so it still can’t resolve npm modules).
