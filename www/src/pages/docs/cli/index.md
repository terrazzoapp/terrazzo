---
title: Getting Started
layout: ../../../layouts/docs.astro
---

# CLI

The Terrazzo CLI takes DTCG tokens and generates code using plugins (e.g. [CSS](/docs/cli/integrations/ss), [Sass](/docs/cli/integrations/sass), [JS/TS](/docs/cli/integrations/js), and more). You can either run the Terrazzo CLI manually, or as part of your <abbr title="Continuous Integration">CI</abbr> process.

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

```sh [bun]
bun i -D @terrazzo/cli
```

:::

And you can create a configuration and install plugins with the `init` command:

```sh
npx tz init
```

![tz init screenshot](/assets/cli-init.png)

This will create a `terrazzo.config.js` starter config file, and even start your token system from a popular open source design system.

## Comparison

Whether you view your design tokens as **standard or nonstandard** will affect whether you use Terrazzo, some other tool like [Style Dictionary](https://amzn.github.io/style-dictionary/), or build your own. Terrazzo takes the same opinion as the DTCG format: **design tokens should be standardized.** This means that colors, typography, spacing, and more should be expressed in predictable ways.

The advantage of using a standard format is you can get up-and-running faster because the tooling already exists. There’s more shared collaboration and tooling around the same problem, and knowledge sharing is easier. But the downside is it may not work well for nonstandard design systems, especially if your team approaches color, theming, or design systems in general in a unique way.

### VS. Style Dictionary

Style Dictionary is the path of nonstandard (custom) tokens. It allows your team to approach design systems in your own unique way… but at the cost of building your own tooling from scratch, and having to frontload investment before you get any value.

:::warning

While it’s tempting to lean toward _“flexibility,”_ that term is often indecision (or procrastination) in disguise! Make sure you’re prioritizing your **real needs today** rather than your potential needs tomorrow.

:::

## API

| Command                 | Description                                                                                      |
| :---------------------- | :----------------------------------------------------------------------------------------------- |
| `init`                  | Scaffold out a new project from an existing design system.                                       |
| `build`                 | Build tokens [with your plugins](/docs/cli/integrations) and also run [linting](/docs/cli/lint). |
| `lint`                  | Only run [token linting](/docs/cli/lint) (not build).                                            |
| `check [file]`          | Validate a given tokens JSON meets the DTCG specification.                                       |
| `--help`                | Display help message.                                                                            |
| `--silent` \| `--quiet` | Suppress warnings and logs.                                                                      |

### Debugging

With any command, set the `DEBUG` env var to a glob scope (accepts [wildcard-match](https://www.npmjs.com/package/wildcard-match) globs):

- `DEBUG=* tz build`: debug all scopes
- `DEBUG=parser:* tz build`: debug @terrazzo/parser (core)
- `DEBUG=plugin:* tz build`: debug plugins

## Next Steps

- See all [config options](/docs/cli/config)
- Browse plugins:
  - [CSS](/docs/cli/integrations/css)
  - [JS/TS/JSON](/docs/cli/integrations/js)
  - [Sass](/docs/cli/integrations/sass)
  - [Tailwind](/docs/cli/integrations/tailwind)
