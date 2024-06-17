---
title: CLI
layout: ../../../layouts/docs.astro
---

# CLI

:::warn

The Terrazzo CLI is in **beta**, which means breaking changes may occur before the final release! This is merely a _preview_, not the final product (and as always, [feedback is welcome](https://github.com/drwpow/cobalt-ui/issues/201)

:::

The Terrazzo CLI takes `tokens.json` either exported from the [Token Lab](/lab) or from [Figma](/docs/tokens) and generate code such as [CSS](/docs/cli/integrations/ss), [Sass](/docs/cli/integrations/sass), [JavaScript/TypeScript](/docs/cli/integrations/js), [JSON](/docs/cli/integrations/js), and more.

:::tip

Migrating from Cobalt? Check out the [Migration Guide](/docs/cli/migrating)

:::

## Quickstart

First install the package using your package manager of choice:

:::code-group

```sh [npm]
npm i -D @terrazzo/cli
```

```sh [pnpm]
pnpm i -D @terrazzo/cli
```

:::

Next, install any plugins you’d like to use:

:::code-group

```sh [npm]
npm i -D @terrazzo/plugin-css @terrazzo/plugin-js
```

```sh [pnpm]
pnpm i -D @terrazzo/plugin-css @terrazzo/plugin-js
```

:::

Create a `terrazzo.config.js` file in the root of your repo:

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import js from "@terrazzo/plugin-js";

export default defineConfig({
  tokens: "./tokens.json",
  outDir: "./tokens/",
  plugins: [css(), js()],
});
```

:::

And to finish it up, run

```sh
npx tz build
```

from your project root to generate code using your plugins.

## Next Steps

- See all [config options](/docs/cli/config)
- Browse plugins:
  - [CSS](/docs/cli/integrations/css)
  - [JS/TS/JSON](/docs/cli/integrations/js)
  - [Sass](/docs/cli/integrations/sass)
  - [Tailwind](/docs/cli/integrations/tailwind)
