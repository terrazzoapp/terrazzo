---
"@terrazzo/plugin-css": patch
---

Fix composite sub-values that alias a sibling token emitting a variable that reads itself (`--heading-font-size: var(--heading-font-size)`) and silently dropping the sibling’s real value
