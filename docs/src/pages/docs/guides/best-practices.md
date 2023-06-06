---
title: Best Practices
layout: ../../../layouts/docs.astro
---

# Best practices

Best practices are only community conventions meant to fill in opinions when you have none. Disregard any information in here if it doesn’t work with your organization, or if there is a conflict between this information and your configuration.

## Aliasing

Use [aliases](/docs/tokens#aliasing)! They’re free and can help make your design system easier-to-use. Here are just a few ways you can use aliases:

- Common spelling differences, e.g. `color.gray` → `color.grey` (fun fact: CSS supports both spellings!)
- Useful shortcuts, e.g. `color.white` → `color.gray.100`
- Semantic colors e.g. `color.ui.action` → `color.blue`, `color.ui.error` → `color.red`, etc.

## Casing

Prefer **camelCased** properties when possible:

```diff
  {
    "typography": {
-     "base-heading": {
+     "baseHeading": {
        "$type": "fontFamily",
        "$value": "sans-serif"
      }
    }
  }
```

This will result in more predictable naming, and in many languages is simpler to reference (for example, in JavaScript):

```diff
- tokens.typography['base-heading'].$value;
+ tokens.typography.baseHeading.$value;
```

## Logical color numbering

Many design systems use [color ramps](https://ferdychristant.com/color-for-the-color-challenged-884c7aa04a56) which typically use numbers for greater flexiblity than relative terms like _dark_, _darker_, etc. But if possible, make your numbering follow some **logical** reasoning.

For example, since Cobalt supports [OKLCH](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl), you could use **perceived lightness** as the number where `color.blue.60` is 60% light, `color.blue.70` is 70% light, and so on:

```json
{
  "color": {
    "blue": {
      "10": {"$value": "oklch(10% 0.069574 264)"},
      "15": {"$value": "oklch(15% 0.102086 265)"},
      "20": {"$value": "oklch(20% 0.000304 265)"},
      "25": {"$value": "oklch(25% 0.172216 265)"},
      "30": {"$value": "oklch(30% 0.203543 266)"},
      "40": {"$value": "oklch(40% 0.216254 267)"},
      "50": {"$value": "oklch(50% 0.216583 268)"},
      "60": {"$value": "oklch(60% 0.216564 269)"},
      "70": {"$value": "oklch(70% 0.156718 268)"},
      "80": {"$value": "oklch(80% 0.100540 267)"},
      "85": {"$value": "oklch(85% 0.073053 266)"},
      "90": {"$value": "oklch(90% 0.048514 265)"},
      "95": {"$value": "oklch(95% 0.023788 264)"}
    }
  }
}
```
