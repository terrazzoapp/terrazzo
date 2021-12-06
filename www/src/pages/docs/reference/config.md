---
title: Config
layout: ../../../layouts/docs.astro
---

# Config

Customizing Cobalt and managing plugins requires you to add a `cobalt.config.mjs` file in the root of your project. Here’s an example configuration with all settings and defaults:

```js
import json from '@cobalt-ui/plugin-json';

export default {
  tokens: './tokens.yaml',
  outDir: './tokens/',
  plugins: [json()],
};
```

## Plugins

Each plugin comes with its own rules and setup. Follow the corresponding plugin guide to enable code generation:

👉 **[View plugins](/docs/plugins)**
