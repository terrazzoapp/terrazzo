---
title: Config
layout: ../../layouts/docs.astro
---

# Config

Configuring Cobalt requires you to place a `cobalt.config.mjs` file in the root of your project. Here’s an example configuration with all settings and defaults:

```js
import json from '@cobalt-ui/plugin-json';

export default {
  tokens: './tokens.yaml',
  outDir: './tokens/',
  plugins: [json()],
};
```

## Plugins

On its own, Cobalt is only a YAML file you can’t do anything directly with. Plugins are powerful tools that let you generate code from `tokens.yaml`. [Learn more about plugins](/docs/plugins)
