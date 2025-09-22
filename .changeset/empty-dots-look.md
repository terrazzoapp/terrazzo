---
"@terrazzo/token-tools": minor
"@terrazzo/parser": minor
"@terrazzo/cli": minor
---

⚠️ Minor breaking change: the transform() API now returns the Momoa node as the 1st parameter. The 2nd parameter is now an object with more context. Lastly, it requires returning a momoa node, rather than raw JSON.

```diff
+ import * as momoa from "@humanwhocodes/momoa";

  transform: {
-   color(json, path, node) {
+   color(node, { path, filename }) {
+     const json = momoa.evaluate(node);
-     return json;
+     return momoa.parse(json);
    }
```

This should result in a little less work overall. For example, instead of writing `if (typeof json === 'object' && !Array.isArray(json))` that could be shortened to `if (node.type === 'Object')`, among many other such advantages. You can call `evaluate()` manually if you’re more used to working with the raw JSON instead. Similarly, you can call `parse()` if you’re working with
