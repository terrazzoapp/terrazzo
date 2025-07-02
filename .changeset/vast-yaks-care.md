---
"@terrazzo/token-tools": minor
"@terrazzo/cli": minor
"@terrazzo/parser": minor
"@terrazzo/plugin-css": minor
"@terrazzo/plugin-js": minor
"@terrazzo/plugin-sass": minor
"@terrazzo/plugin-tailwind": minor
"@terrazzo/plugin-vanilla-extract": minor
---

⚠️ Breaking change: align color token ranges to CSS Color Module 4. This results in breaking changes to HSL and HWB, which normalize to `0 - 100`, rather than `0 - 1`:

```diff
  {
    "colorSpace": "hsl",
-   "components": [270, 0.5, 0.4]
+   "components": [270, 50, 40]
  }
```

All other color spaces should be unaffected, as they were already matching CSS Color Module 4.
