---
"@terrazzo/plugin-css": patch
---

Escape `*/` inside a token's `$description` so it can no longer close the generated CSS comment early.

Previously, a description containing `*/` ended its `/* */` comment ahead of time and everything after it was parsed as CSS. A token described as `Brand blue */ } body { display: none;` closed the `:root` block right there, which moved every remaining custom property into a `body` rule and left a stray `*/` behind that made the whole file fail to parse. The sequence is now emitted as `*\/`, which is inert inside a comment and keeps the description intact.
