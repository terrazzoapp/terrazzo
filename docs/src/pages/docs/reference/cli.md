---
title: About Cobalt
layout: ../../../layouts/docs.astro
---

# CLI

The Cobalt CLI is available for installing via npm:

```bash
npm i -D @cobalt-ui/cli
```

## API

All CLI commands require a [config](/docs/reference/config/) to work properly, with the exception of `co check` and `co convert`.

`npx co [command]`

| Command                       | Notes                                                                                                                                                                                                                                           |
| :---------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build`                       | Turn design tokens into output files using [plugins](/docs/plugins). You can watch for changes in dev mode with `build --watch`.                                                                                                                |
| `bundle --out [path]`         | Bundle multiple `tokens.json` files into one, e.g. `co bundle --out path/to/output.json`. Can output `.json` or `.yaml`. Requires [multiple schemas set in config](https://cobalt-ui.pages.dev/docs/reference/config/#loading-multiple-schemas) |
| `check [path]`                | Validate a `tokens.json` file and check for errors. This won’t output any files.                                                                                                                                                                |
| `init`                        | Create a starter `tokens.json` file.                                                                                                                                                                                                            |
| `convert [path] --out [path]` | Convert a [Style Dictionary](https://amzn.github.io/style-dictionary) JSON file to the W3C format ([docs](/docs/guides/style-dictionary))                                                                                                       |
