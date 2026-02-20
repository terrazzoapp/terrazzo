---
title: Getting Started
layout: ../../../layouts/docs.astro
---

# Getting Started

Terrazzo takes DTCG design token JSON and generates code for any platform (e.g. [CSS](/docs/integrations/css), [Sass](/docs/integrations/sass), [JS/TS](/docs/integrations/js), and more). You can either run the Terrazzo CLI manually, or as part of your <abbr title="Continuous Integration">CI</abbr> process.

:::tip

Migrating from Cobalt? Check out the [Migration Guide](/docs/guides/migrating-cobalt)

:::

## Setup

First, install the package using your package manager of choice:

:::npm

```sh
npm i -D @terrazzo/cli
```

:::

And you can create a configuration and install plugins with the `init` command:

```sh
npx tz init
```

![tz init screenshot](/assets/cli-init.png)

This will create a `terrazzo.config.ts` starter config file, and even start your token system from a popular open source design system.

## Comparison

- **vs [Style Dictionary](https://styledictionary.com/)**: Terrazzo is the only tool that supports the full DTCG format (support for resolvers and other 2025.10 features coming in 2.0!). But this will change as Style Dictionary is [now following Terrazzo’s path in adopting DTCG](https://github.com/style-dictionary/style-dictionary/issues/1590).

## API

| Command                         | Description                                                                                                                   |
| :------------------------------ | :---------------------------------------------------------------------------------------------------------------------------- |
| `init`                          | Scaffold out a new project from an existing design system.                                                                    |
| `build`                         | Build tokens [with your plugins](/docs/integrations) and also run [linting](/docs/linting).                                   |
| `lint`                          | Only run [token linting](/docs/linting) (not build).                                                                          |
| `check [file]`                  | Validate a given tokens JSON meets the DTCG specification.                                                                    |
| `bundle [file] --output [file]` | Bundle a [resolver](https://www.designtokens.org/tr/2025.10/resolver) that references multiple files into a single JSON file. |
| `--help`                        | Display help message.                                                                                                         |
| `--silent` \| `--quiet`         | Suppress warnings and logs.                                                                                                   |

### Debugging

With any command, set the `DEBUG` env var to a glob scope (accepts [wildcard-match](https://www.npmjs.com/package/wildcard-match) globs):

- `DEBUG=* tz build`: debug all scopes
- `DEBUG=parser:* tz build`: debug @terrazzo/parser (core)
- `DEBUG=plugin:* tz build`: debug plugins
