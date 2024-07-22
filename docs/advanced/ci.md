---
title: Using Cobalt in CI
---

# Using Cobalt in CI

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
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4
          with:
            node-version: 20
        - run: npm i
        - run: npm run build
```

This will run `co build` on every code change, which validates your `tokens.json` and runs all plugins to make sure they’re all working as expected.

## Linting tokens (beta)

Cobalt can lint your tokens and fail if your tokens don’t meet minimum color contrast guidelines, and more. See any linting plugin to learn more:

- [a11y plugin](/integrations/a11y)

## Publishing to npm

You could then take the additional step of using a package versioning tool like [Changesets](https://github.com/changesets/changesets) to release npm packages from CI ([Cobalt does this!](https://github.com/terrazzoapp/terrazzo/blob/1lx/.github/workflows/release.yml)).
