---
"@terrazzo/token-tools": patch
"@terrazzo/plugin-css": patch
"@terrazzo/parser": patch
"@terrazzo/cli": patch
---

fix: CSS utilities alphabetize declarations to produce more consistent output. Reordering tokens should be a plugin-level concern; parser will preserve token authoring order.
