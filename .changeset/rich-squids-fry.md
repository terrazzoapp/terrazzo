---
"@terrazzo/plugin-sass": minor
"@terrazzo/token-tools": minor
"@terrazzo/plugin-css": minor
"@terrazzo/plugin-js": minor
"@terrazzo/parser": minor
"@terrazzo/cli": minor
---

fix: Improvements to mode aliasing and mode overrides. `typography` tokens only have to partially-declare overrides for modes, while keeping their core set. While this has been supported, behavior was buggy and sometimes was inconsistent.

⚠️ Breaking change: `token.mode` has a simplified shape with only a few properties. This led to conflicting information for complex aliasing, where it was unclear whether `aliasOf` on a mode referred to the mode itself, or the default token.
