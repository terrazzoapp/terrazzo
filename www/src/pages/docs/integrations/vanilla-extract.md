---
title: Vanilla Extract
layout: ../../../layouts/docs.astro
---

# Vanilla Extract

Generate [Vanilla Extract](https://vanilla-extract.style) themes from DTCG tokens.

## Setup

Requires [Node.js](https://nodejs.org). With that installed, run:

:::npm

```sh
npm i -D @terrazzo/cli @terrazzo/plugin-css @terrazzo/plugin-vanilla-extract
```

:::

Add a `terrazzo.config.ts` to the root of your project with:

:::code-group

```ts [terrazzo.config.ts]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import vanillaExtract from "@terrazzo/plugin-vanilla-extract";

export default defineConfig({
  plugins: [
    css({
      // Optional: control the final CSS variable names
      variableName: (token) => token.id.replace(/\./g, "-"),
      // Optional: pass `skipBuild: true` to not generate a .css file if only using Vanilla Extract.
      skipBuild: false,
    }),

    vanillaExtract({
      filename: "themes.css.ts",
      // Use global CSS vars (recommended). Your Vanilla Extract CSS is still scoped.
      globalThemeContract: true,

      // Option 1: scoped themes
      themes: {
        light: { mode: [".", "light"] },
        dark: { mode: [".", "dark"] },
      },

      // Option 2: global themes (in case you have code outside Vanilla Extract)
      globalThemes: {
        globalLight: { selector: "[data-color-mode=light]", mode: [".", "light"] },
        globalDark: { selector: "[data-color-mode=dark]", mode: [".", "dark"] },
      ],
    }),
  ],
});
```

## Resolvers (new)

To use resolvers in this plugin, you MUST specify your `permutations` in plugin-css, and use `input` instead, like so:

:::code-group

```ts [terrazzo.config.ts]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import vanillaExtract from "@terrazzo/plugin-vanilla-extract";

const light = { theme: 'light' }
const dark = { theme: 'dark' }

export default defineConfig({
  plugins: [
    css({
      permutations: [
        { ...light, prepare: (css) => `:root {\n  color-scheme: light dark;\n  ${css}\n}` },
        { ...dark, prepare: (css) => `@media (prefers-color-scheme: dark) {\n  :root {\n    color-scheme: dark;\n    ${css}\n  }\n}` },
      ],
    }),

    vanillaExtract({
      globalThemeContract: true,
      globalThemes: {
        globalLight: { selector: "[data-color-mode=light]", input: light },
        globalDark: { selector: "[data-color-mode=dark]", input: dark },
      ],
    }),
  ],
});
```

:::

Specifying permutations is required because in the world of resolvers, there are too many possible combinations that may not match up, so plugin-css won’t generate those variables unless you ask for them.

## Options

| Name                | Type                                                                 | Default                 | Description                                                                                                                                                                         |
| :------------------ | :------------------------------------------------------------------- | :---------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| filename            | `string`                                                             | `theme.css.ts`          | The filename to generate.                                                                                                                                                           |
| globalThemeContract | `boolean`                                                            | `true`                  | If `false`, it will generate a scoped [createThemeContract()](https://vanilla-extract.style/documentation/api/create-theme-contract/) instead.                                      |
| themes              | `{ [name: string]: { mode: string \| string[] }`                     |                         | Generate one [createTheme()](https://vanilla-extract.style/documentation/api/create-theme/) per object key. The key is the variable name that will be exported.                     |
| globalThemes        | `{ [name: string]: { mode: string \| string[], selector: string } }` |                         | Generate one [createGlobalTheme()](https://vanilla-extract.style/documentation/global-api/create-global-theme/) per object key. The key is the variable name that will be exported. |
| themeVarNaming      | `(name: string) => [class, vars]`                                    | `[{name}Class, {name}]` | Change the naming strategy for the [createTheme()](https://vanilla-extract.style/documentation/api/create-theme/) API’s `[class, vars]` tuple.                                      |

## Interop with plugin-css

This plugin is a thin wrapper around [plugin-css](/docs/integrations/css/), which ensures the output is valid CSS. But since Vanilla Extract is an extension, only some settings matter:

| Option          | Applies to Vanilla Extract                                                                        |
| :-------------- | :------------------------------------------------------------------------------------------------ |
| `permutations`  | **Yes** If using resolvers, these are required!                                                   |
| `variableName`  | **Yes** (if `globalThemeContract: true`)                                                          |
| `exclude`       | **Yes**                                                                                           |
| `skipBuild`     | **Yes**                                                                                           |
| `legacyHex`     | **Yes**                                                                                           |
| `transform`     | **Yes** (if used)                                                                                 |
| `modeSelectors` | **No**                                                                                            |
| `utility`       | **No** (use [Sprinkles](https://vanilla-extract.style/documentation/packages/sprinkles/) instead) |
| `baseSelector`  | **No** (overridden by Vanilla Extract themes)                                                     |

:::warning

Though in most scenarios plugin-css agrees with Vanilla Extract (because Terrazzo manages both), some usages of `modeSelectors` could potentially conflict. If that happens, you may want to set `globalThemeContract: false` in Vanilla Extract.

:::
