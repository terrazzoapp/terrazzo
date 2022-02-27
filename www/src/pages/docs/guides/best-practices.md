---
title: Best Practices
layout: ../../../layouts/docs.astro
---

# Best practices

Best practices are simply community conventions, meant to fill in opinions when you have none. Disregard any information in here if it doesn’t work with your organization, or if there is a conflict between this information and your configuration.

## Casing

Prefer **camelCased** properties when possible:

```diff
  {
    "typography": {
-     "base-heading": {
+     "baseHeading": {
        "$type": "font",
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
