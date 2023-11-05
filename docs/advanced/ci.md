---
title: CI
---

# CI

Using your preferred CI stack, here’s an example of how you could add Cobalt to your CI. First, we’ll take a `package.json` that had an existing `npm run build` command, and add `co build` script to it:

::: code-group

```json [package.json]
{
  "scripts": {
    "build": "npm run build:app", // [!code --]
    "build": "npm run build:tokens && npm run build:app", // [!code ++]
    "build:app": "vite build",
    "build:tokens": "co build" // [!code ++]
  }
}
```

:::

This is just a generic example. The important part is that `co build` is run somehow during the build.

## GitHub Actions

```yaml
name: CI

on:
  push:
    branches:
      - main
  pull_request:

concurrency:
  group: ci-\${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: 20
        - run: npm i
        - run: npm run build
```

This will run `co build` on every code change, which validates your `tokens.json` and runs all plugins to make sure they’re all working as expected.

## Publishing to npm

You could then take the additional step of using a package versioning tool like [Changesets](https://github.com/changesets/changesets) to release npm packages from CI ([Cobalt does this!](https://github.com/drwpow/cobalt-ui/blob/main/.github/workflows/release.yml)).
