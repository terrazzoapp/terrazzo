---
title: tokens.yaml
layout: ../../layouts/docs.astro
---

# Cobalt Schema v0

### Tips

- Good IDs should be in their shortest form, while being recognizable. For example, consider “Typography”:
  - ❌ `typography` too long
  - ✅ `type` a common shorthand for “typography”
  - ✅ `font` also good; may also be preferred over “type” which out-of-context has other meanings
  - ❌ `t` too short—what does this even mean?
- IDs can be capitalized. But try to be consistent with capitalization:
  - ❌ `Type.Family.FoundersGrotesk` and `color.tiffany_blue` are both individually fine, but together they disagree. Prefer one or the other.
- If IDs use underscores (`_`), they will work easily in any language
  - ✅ `dark_blue` works in CSS, JavaScript, and many other programming languages
  - ❌ `dark-blue` works in CSS but not JavaScript nor other programming languages (without being escaped)
  - ✅ `darkBlue` or `DarkBlue` also works without underscores; up to you on which is more readable
