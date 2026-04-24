---
"@terrazzo/plugin-tailwind": minor
---

Add `variableName` option to control the final CSS variable name. This lets users preserve underscores (e.g. `--color-bg-primary_hover`) and double-dashes (e.g. `--text-xs--line-height`) that `makeCSSVar()` would otherwise normalize, enabling compatibility with design systems that use underscores as variant separators and Tailwind v4's paired property convention.
