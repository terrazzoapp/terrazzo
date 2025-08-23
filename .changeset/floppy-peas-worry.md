---
"@terrazzo/cli": minor
"@terrazzo/parser": minor
"@terrazzo/plugin-css": minor
"@terrazzo/plugin-js": minor
"@terrazzo/plugin-sass": minor
"@terrazzo/plugin-tailwind": minor
"@terrazzo/plugin-vanilla-extract": minor
"@terrazzo/token-tools": minor
---

⚠️ Breaking change: lint on plugins no longer runs on individual files, rather, the full set once merged.

If your lint plugin is not using the `src` context value, no changes are needed. If it is, you’ll need to instead read from the `sources` array, and look up sources with a token’s `source.loc` filename manually. This change was because lint rules now run on all files in one pass, essentially.
