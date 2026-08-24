---
"@terrazzo/cli": minor
---

Add alias-safe Figma variable overrides for duration, cubic Bézier, font, and number tokens; preserve resolver order during updates; and normalize Figma typography line heights and grid style values. The new `--number-float-names` option provides resolved-type-safe number matching while deprecated `--number-names` retains finite primitive coercion without emitting invalid numeric values. Incompatible overlapping matchers now preserve Figma types for the entire alias chain.
