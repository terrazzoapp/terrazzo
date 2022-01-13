---
title: Config
layout: ../../../layouts/docs.astro
---

# Config

Customizing Cobalt and managing plugins requires you to add a `tokens.config.mjs` file in the root of your project. Here’s an example configuration with all settings and defaults:

```js
import json from "@cobalt-ui/plugin-json";

export default {
  tokens: "./tokens.json",
  outDir: "./tokens/",
  figma: {
    // figma settings
  },
  plugins: [json()],
};
```

## Figma

[View Figma docs](/docs/getting-started/figma)

## Plugins

Each plugin comes with its own rules and setup. Follow the corresponding plugin guide to enable code generation:

👉 **[View plugins](/docs/plugins)**
