---
"@terrazzo/token-tools": minor
"@terrazzo/parser": minor
"@terrazzo/cli": minor
---

Minor breaking change: build() and buildEnd() plugin hooks are now executed in parallel. The other hooks are still executed sequentially.
