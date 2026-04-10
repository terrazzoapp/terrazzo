---
"@terrazzo/plugin-js": patch
---

Fixed an issue where TokenNormalizedSet was missing from the generated type imports.

Previously, the build logic only included individual token types in the .d.ts imports. This change ensures that TokenNormalizedSet, a structural type required for permutations, is always included in the generated imports.