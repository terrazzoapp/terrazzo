---
"@terrazzo/parser": patch
---

`core/duplicate-values` no longer reports aliases as duplicates of the token they point at, and it now detects duplicate `duration` values.

The alias check tested `isAlias(token.aliasOf)`, but `aliasOf` holds a resolved token ID such as `color.blue.100` while `isAlias()` looks for the `{color.blue.100}` reference form — so it never matched and every alias was compared against its own target. The check also only guarded the primitive comparison, while colors, dimensions, shadows and the other object-valued types went down a separate path that had no alias check at all. It is now one check covering both.

`duration` was grouped with the primitives and compared with `Set.has()`, but a normalized duration value is the object `{ value, unit }`, so that comparison tested object identity and never matched. It now goes through the same structural comparison as `dimension`, which was already excluded for the same reason.
