---
"@terrazzo/token-tools": patch
"@terrazzo/parser": patch
"@terrazzo/cli": patch
---

fix: Improved handling of modes partially overriding object tokens (e.g. typography modes modifying a single value). In plugin-css, for instance, you may notice more output, but it’s done for safer style generation.
