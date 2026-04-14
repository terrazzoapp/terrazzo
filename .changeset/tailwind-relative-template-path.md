---
"@terrazzo/plugin-tailwind": patch
---

plugin-tailwind: write the template path in the generated file header relative to cwd so builds stay deterministic across machines (previously an absolute path like `/Users/alice/...` could leak into committed output)
