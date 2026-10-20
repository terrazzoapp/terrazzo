---
"@terrazzo/parser": patch
"@terrazzo/plugin-css": patch
"@terrazzo/plugin-css-in-js": patch
"@terrazzo/plugin-js": patch
---

Uses new Intl.Collator.compare() instead of localeCompare() for a 50% build performance boost.
