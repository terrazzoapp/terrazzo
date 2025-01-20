---
"@terrazzo/plugin-sass": patch
"@terrazzo/token-tools": patch
"@terrazzo/plugin-css": patch
"@terrazzo/plugin-js": patch
"@terrazzo/parser": patch
"@terrazzo/cli": patch
---

fix: ⚠️ [plugin-css] Minor breaking change: transition tokens no longer generate variables for sub-parts. This is a change done in service to better protect “allowed” token usage. If you want consumers to be able to “break apart” tokens, then they must also exist as individual tokens that get aliased.
