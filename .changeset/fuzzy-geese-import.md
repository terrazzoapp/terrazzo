---
"@terrazzo/cli": minor
---

Add alias-safe Figma variable overrides for duration, cubic Bézier, font, and number tokens; preserve resolver order during updates; and emit DTCG-valid typography, effect, and grid style values. The new `--number-float-names` option provides resolved-type-safe number matching while deprecated `--number-names` retains its historical primitive coercion. Unmapped STRING and BOOLEAN Variables remain compatibility types outside the strict DTCG type enum.
