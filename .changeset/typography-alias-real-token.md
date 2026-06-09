---
"@terrazzo/token-tools": patch
---

Fix CSS transformation of a typography token that aliases another typography token. The alias now resolves to a complete sub-token instead of a mode-less `{ id }` stub, so consumers that recursively transform it (e.g. plugin-token-listing's preview values) get a real value instead of crashing.
