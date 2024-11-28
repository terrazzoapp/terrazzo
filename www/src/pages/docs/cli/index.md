---
title: CLI
layout: ../../../layouts/docs.astro
---

# CLI

:::warning

The CLI is in beta. Breaking changes may occur before the stable release.

:::

The Terrazzo CLI takes `tokens.json` either exported from the [Token Lab](/lab) or from [Figma](/docs/tokens) and generate code such as [CSS](/docs/cli/integrations/ss), [Sass](/docs/cli/integrations/sass), [JavaScript/TypeScript](/docs/cli/integrations/js), [JSON](/docs/cli/integrations/js), and more.

:::tip

Migrating from Cobalt? Check out the [Migration Guide](/docs/cli/migrating)

:::

## Quickstart

First, install the package using your package manager of choice:

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

Third, create a `terrazzo.config.js` file in the root of your repo:

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

And finally, run:

```sh
npx tz build
```

from your project root to generate code using your plugins.

## Options

```sh
tz
  [commands]
    build           Build token artifacts from tokens.json
      --watch, -w   Watch tokens.json for changes and recompile
      --no-lint     Disable linters running on build
    check [path]    Check tokens.json for errors and run linters
    lint [path]     (alias of check)
    init            Create a starter tokens.json file

  [options]
    --help          Show this message
    --config, -c    Path to config (default: ./terrazzo.config.js)
    --quiet         Suppress warnings
`);
```

## Comparison

Whether you view your design tokens as **standard or nonstandard** will affect whether you use Terrazzo, some other tool like [Style Dictionary](https://amzn.github.io/style-dictionary/), or build your own. Terrazzo takes the same opinion as the DTCG format: **design tokens should be standardized.** This means that colors, typography, spacing, and more should be expressed in predictable ways.

The advantage of using a standard format is you can get up-and-running faster because the tooling already exists. There’s more shared collaboration and tooling around the same problem, and knowledge sharing is easier. But the downside is it may not work well for nonstandard design systems, especially if your team approaches color, theming, or design systems in general in a unique way.

### VS. Style Dictionary

Style Dictionary is the path of nonstandard (custom) tokens. It allows your team to approach design systems in your own unique way… but at the cost of building your own tooling from scratch, and having to frontload investment before you get any value.

:::warning

While it’s tempting to lean toward _“flexibility,”_ that term is often indecision (or procrastination) in disguise! Make sure you’re prioritizing your **real needs today** rather than your potential needs tomorrow.

:::

## Next Steps

- See all [config options](/docs/cli/config)
- Browse plugins:
  - [CSS](/docs/cli/integrations/css)
  - [JS/TS/JSON](/docs/cli/integrations/js)
  - [Sass](/docs/cli/integrations/sass)
  - [Tailwind](/docs/cli/integrations/tailwind)
