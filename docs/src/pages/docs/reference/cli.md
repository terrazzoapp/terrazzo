---
title: About Cobalt
layout: ../../../layouts/docs.astro
---

# CLI

The Cobalt CLI is available via npm:

```bash
npm i -D @cobalt-ui/cli
```

## API

`npx co [command]`

| Command        | Notes                                                                                                                            |
| :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `build`        | Turn design tokens into output files using [plugins](/docs/plugins). You can watch for changes in dev mode with `build --watch`. |
| `check [path]` | Validate a `tokens.json` file and check for errors. This won’t output any files.                                                 |
| `init`         | Create a starter `tokens.json` file.                                                                                             |
