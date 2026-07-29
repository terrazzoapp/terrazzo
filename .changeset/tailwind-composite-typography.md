---
"@terrazzo/plugin-tailwind": minor
---

Support composite typography tokens (`$type: typography`). Mapping a typography token in the Tailwind theme now generates Tailwind’s composite utility convention (e.g. `--text-tiny` from the font-size, plus `--text-tiny--line-height`, `--text-tiny--letter-spacing`, `--text-tiny--font-weight`, etc.) instead of broken output.
