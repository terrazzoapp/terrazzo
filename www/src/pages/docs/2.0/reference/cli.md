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

## Normalize

The DTCG format has gone through many iterations over the years. Terrazzo lenient in the inputs it allows, such as allowing legacy sRGB hex colors without throwing a parsing error. To quickly update your tokens to the latest version of the format, run the following command:

```sh
tz normalize <input.json> -o normalized.json
```

This will keep your tokens 100% as-authored, but will upgrade older DTCG files to the updated format and will safely fix minor issues. But just as a safety precaution, it requires saving to a new location just so you can review the changes before committing them.

| Name            | Description            |
| :-------------- | :--------------------- |
| `--out` \| `-o` | Tokens file to output. |

## Global Flags

Flags available for any command

| Name               | Description                                     |
| :----------------- | :---------------------------------------------- |
| `--config` \| `-c` | Path to config (default: `terrazzo.config.js`). |
| `--silent`         | Suppress warnings.                              |
| `--help`           | Show help message and exit.                     |
| `--version`        | Show version and exit.                          |
