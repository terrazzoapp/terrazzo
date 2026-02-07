---
title:: Import from Figma
layout: ../../../../layouts/docs.astro
---

# Import from Figma

Figma Variables and Styles translate well to DTCG tokens! This guide will show you how to import Variables and Styles from a Figma file, and save to a `.tokens.json` output.

## Quickstart

To import from Figma, you’ll need:

1. A [personal access token](https://developers.figma.com/docs/rest-api/authentication/#access-tokens) with access to the file(s) you want to load Variables & Styles from
   - For **Styles**, it needs [`file_content:read`, `team_library_content:read`, and `library_content:read` scopes](https://developers.figma.com/docs/rest-api/scopes/).
   - For **Variables**, it needs the [`file_variables:read` scope](https://developers.figma.com/docs/rest-api/scopes/).
2. An Enterprise plan to export Variables (with free accounts, only Styles are importable)

### Personal Access Token

Create your [personal access token](https://developers.figma.com/docs/rest-api/authentication/#access-tokens) from Settings inside Figma, and expose it as a `FIGMA_ACCESS_TOKEN` environment variable. You can do this in multiple ways:

- Locally: run `echo 'export FIGMA_ACCESS_TOKEN="(your token value)"' >> ~/.zshrc` (this is great for testing!)
- [GitHub Actions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets): add to secrets
- [GitLab CI](https://docs.gitlab.com/ci/secrets/): add to secrets

:::warning

**Never** add secrets to code or in `package.json` files!

:::

### Importing

Terrazzo won’t load the tokens direct from the Figma file every time, instead, it will save 1 Figma file to 1 `.tokens.json` file. Import one file at a time with:

```sh
npx tz import https://www.figma.com/design/xxxxxxxxxxxxxxxxxvxxx/Design-System-Variables --output my-tokens.tokens.json
```

To load other files, simply run the command again.

:::note

It’s intentional that `tz import` always happens separately from `tz build`. Saving Figma output to a `.tokens.json`, checked into Git, makes things easier to version, easier for adjustments/overrides to be made, and guards against data loss. Terrazzo intentionally doesn’t allow Figma URLs in `tokens` for a smoother experience.

:::

### Mapping Types

Since Figma Styles & Variables don’t map 1:1 with DTCG token types, these are the following conversions:

| Figma Type         | DTCG Type                                                                                                                                                            |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Style `FILL`       | [color](/docs/reference/tokens/#color) if a solid fill, or [gradient](/docs/reference/tokens/#gradient) if a gradient fill (complex fills may not translate cleanly) |
| Style `TEXT`       | [typography](/docs/reference/tokens/#typography)                                                                                                                     |
| Style `EFFECT`     | [shadow](/docs/reference/tokens/#shadow)                                                                                                                             |
| Style `GRID`       | Object of [dimension](/docs/reference/tokens/#dimension) / [number](/docs/reference/tokens/#number) tokens                                                           |
| Variable `COLOR`   | [color](/docs/reference/tokens/#color)                                                                                                                               |
| Variable `FLOAT`   | [dimension](/docs/reference/tokens/#dimension) (px)                                                                                                                  |
| Variable `STRING`  | `string` (⚠️ non-standard type)                                                                                                                                      |
| Variable `BOOLEAN` | `boolean` (⚠️ non-standard type)                                                                                                                                     |

#### String and Boolean types

DTCG does not allow string types, but these are a dominant typeof Figma Variable, especially in typography. In order to override certain Variables by name, pass in `--[type]-names` flags:

```sh
npx tz import [file] --font-family-names ".*/(family|fontName}$" --font-weight-names ".*/weight$" --number-names ".*/lineHeight$"
```

The flags are RegEx patterns, so passing in a string will return any match. You can also use slashes to get more specific with token targets.

### Libraries

If the Figma file has a [Published Library](https://help.figma.com/hc/en-us/articles/360025508373-Publish-a-library) associated with it, Terrazzo will **pull the Published version.** This means that local, unpublished changes will be ignored. To pull unpublished changes, run:

```sh
npx tz import [file] --unpublished
```

If the file has nothing published, it will grab Styles and Variables in the file regardless of the `--unpublished` flag.

### CLI Flags

You can add all the following flags to `tz import`:

| Name                           | Description                                                                                                             |
| :----------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| `--output [file]`, `-o [file]` | File to export. If this is omitted, it will output to stdout.                                                           |
| `--unpublished`                | Pulls unpublished Variables and Styles (by default the most recent Published Library will be used).                     |
| `--skip-styles`                | Don’t import Styles from this file.                                                                                     |
| `--skip-variables`             | Don’t import Variables from this file (required if not on the Enterprise Plan).                                         |
| `--font-family-names [regex]`  | Import these names as [fontFamily](/docs/reference/tokens/#fontfamily) tokens. Accepts RegEx. (default: `/fontFamily$`) |
| `--font-weight-names [regex]`  | Import these names as [fontWeight](/docs/reference/tokens/#fontweight) tokens. Accepts RegEx. (default: `/fontWeight$`) |
| `--number-names [regex]`       | Import these names as [number](/docs/reference/tokens/#number) tokens. Accepts RegEx. (default: undefined)              |
