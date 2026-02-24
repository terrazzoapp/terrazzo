---
title: CLI
layout: ../../../../layouts/docs.astro
---

## Init

Initialize config and `tokens.json` starting with an Open Source design system.

```sh
npx tz init
```

Supported design systems:

- Adobe Spectrum
- Apple Human Interface Guidelines
- GitHub Primer
- IBM Carbon
- Figma Simple Design System
- Salesforce Lightning
- Shopify Polaris
- Radix

_Have another one to add? [Suggest it!](https://github.com/terrazzoapp/terrazzo/issues/new)_

## Build

Generate code from `tokens.json` based on [plugins](/docs/integrations). Requires a [config file](/docs/reference/config).

```sh
npx tz build
```

### Build Flags

| Name              | Description                                      |
| :---------------- | :----------------------------------------------- |
| `--watch` \| `-w` | Rebuild whenever any token changes are detected. |
| `--no-lint`       | Ignore any [lint errors](#check) while building. |

## Check

Validate all DTCG tokens for syntax errors, and run any [linters](/docs/linting) you’ve enabled. Can optionally specify a `[path]` tokens are located at (by default, will look for the tokens defined in your config file).

```sh
npx tz check [filename]
```

## Format

Format tokens into the current DTCG standard. Note that a separate output is required. If you wish to overwrite your files dangerously, just specify the same file after `-o`.

```sh
tz format <input.json> -o normalized.json
```

| Name            | Description            |
| :-------------- | :--------------------- |
| `--out` \| `-o` | Tokens file to output. |

## Import

Export Figma Variables and Styles to a resolver JSON. Requires a Figma account and auth token.

```sh
tz import https://figma.com/[file] -o my-ds.resolver.json
```

[See full guide](/docs/2.0/guides/import-from-figma)

## Global Flags

Flags available for any command

| Name               | Description                                     |
| :----------------- | :---------------------------------------------- |
| `--config` \| `-c` | Path to config (default: `terrazzo.config.ts`). |
| `--silent`         | Suppress warnings.                              |
| `--help`           | Show help message and exit.                     |
| `--version`        | Show version and exit.                          |
