---
"@terrazzo/cli": patch
"@terrazzo/parser": patch
"@terrazzo/plugin-css": patch
"@terrazzo/plugin-js": patch
"@terrazzo/plugin-sass": patch
"@terrazzo/token-tools": patch
---

fix: [plugin-css] Font Family names without spaces no longer get quotes.

fix: Font Family tokens are always normalized to an array internally for easier parsing.
