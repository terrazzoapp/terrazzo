---
"@terrazzo/cli": patch
---

Import Figma composed color variables with numeric or aliased opacity instead of emitting undefined color components. Resolve composed values for the corresponding named mode (or the referenced collection default), include nested alias dependencies, and detect cyclic references.
