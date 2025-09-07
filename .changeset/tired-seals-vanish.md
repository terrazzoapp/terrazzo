---
"@terrazzo/token-tools": minor
"@terrazzo/parser": minor
"@terrazzo/cli": minor
---

⚠️ Breaking change: the following properties now use JSON $ref syntax:

- token.aliasOf
- token.partialAliasOf
- token.aliasedBy
- token.aliasChain

The reason is two-fold:

1. JSON $ref support means tokens may be aliased from external files, which is not possible to describe using dot-separated syntax
2. Upcoming support for $extends has the same restriction: JSON $ref syntax is the only way to describe the relationship.

In most cases, this is as simple as converting:

```diff
- color.blue.500
+ #/color/blue/500
```

_Note: a leading `/` or `#/` just means same-file._

For other aliases that are more complex, they couldn’t be represented in dot-separated syntax anyway, thus the change.
