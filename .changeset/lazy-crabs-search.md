---
"@terrazzo/parser": patch
---

Remove the unused `fast-deep-equal` dependency. Nothing in the package imported it, so it was installed by every consumer of `@terrazzo/parser` (and by extension `@terrazzo/cli`) without ever being loaded.
