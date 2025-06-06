---
title: Vanilla Extract
layout: ../../../../layouts/docs.astro
---

# Vanilla Extract

Generate [Vanilla Extract](https://vanilla-extract.style) CSS themes from DTCG tokens.

## Setup

Requires [Node.js 20 or later](https://nodejs.org). With that installed, run:

```sh
npm i -D @terrazzo/cli @terrazzo/plugin-css @terrazzo/plugin-vanilla-extract
```

Add a `terrazzo.config.js` to the root of your project with:

```js
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import vanillaExtract from "@terrazzo/plugin-vanilla-extract";

export default defineConfig({
  plugins: [
    css({
      // Optional: control the final CSS variable names
      variableName: (id) => id.replace(/\./g, "-"),
      // Optional: pass `skipBuild: true` to not generate a .css file if only using Vanilla Extract.
      skipBuild: false,
    }),

    vanillaExtract({
      filename: "themes.css.ts",

      // generate createTheme()
      themes: {
        light: { mode: [".", "light"] },
        dark: { mode: [".", "dark"] },
      },

      // generate createGlobalTheme()
      globalThemes: {
        globalLight: { selector: "[data-color-mode=light]", mode: [".", "light"] },
        globalDark: { selector: "[data-color-mode=dark]", mode: [".", "dark"] },
      ],

      // Decide the naming for the tuple for createTheme(). Must be an array.
      // const [className, vars] = createTheme()
      themeNaming: (name) => [`${name}Class`, ${name}],
    }),
  ],
});
```

This plugin extends [plugin-css](../plugin-css) and generates a [createGlobalThemeContract()](https://vanilla-extract.style/documentation/global-api/create-global-theme-contract/) to match your generated CSS global variable names 1:1. But from there, you can use either locally-scoped ([createThem()](https://vanilla-extract.style/documentation/api/create-theme/)) or globally-scoped ([createGlobalTheme()](https://vanilla-extract.style/documentation/global-api/create-global-theme/)) themes.

## Options

| Name                | Type                                                                 | Default                    | Description                                                                                                                                                                         |
| :------------------ | :------------------------------------------------------------------- | :------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| filename            | `string`                                                             | `theme.css.ts`             | The filename to generate.                                                                                                                                                           |
| globalThemeContract | `boolean`                                                            | `true`                     | If `false`, it will generate a scoped [createThemeContract()](https://vanilla-extract.style/documentation/api/create-theme-contract/) instead.                                      |
| themes              | `{ [name: string]: { mode: string \| string[] } }`                   |                            | Generate one [createTheme()](https://vanilla-extract.style/documentation/api/create-theme/) per object key. The key is the variable name that will be exported.                     |
| globalThemes        | `{ [name: string]: { selector: string, mode: string \| string[] } }` |                            | Generate one [createGlobalTheme()](https://vanilla-extract.style/documentation/global-api/create-global-theme/) per object key. The key is the variable name that will be exported. |
| themeVarNaming      | `(name: string) => [class, vars]`                                    | `[\`${name}Class\`, name]` | Change the naming strategy for the [createTheme()](https://vanilla-extract.style/documentation/api/create-theme/) API’s `[class, vars]` tuple.                                      |

_\* Note: even if `globalThemeContract` is `false`, plugin-css must still be loaded either way, because that still does the actual work of value generation; the vanilla-extract plugin merely generates the wrapper code around it._

:::tip

For many token setups in Vanilla Extract, you’ll usually have better results loading both the default token mode (`"."`) and the target mode, e.g. `mode: [".", "light"]`. This just helps completeness and reduces type errors, and is fairly safe. Globs are NOT supported for modes—you must be explicit.

:::

## Interop with plugin-css

### Clashing

The only thing plugin-vanilla-extract takes from [plugin-css](/docs/cli/integrations/css/) are the CSS variable names themselves. Other settings such as [modeSelectors](/docs/cli/integrations/css/#dynamic-mode-handling) are ignored. However, there’s one scenario where plugin-css output could potentially clash with plugin-vanilla-extract:

- You are generating a `.css` file with plugin-css (you don’t have `skipBuild: true` set)
- You are loading both plugin-css’ `.css` and Vanilla Extract’s generated CSS into the same app
- You are using plugin-css’ [modeSelectors](/docs/cli/integrations/css/#dynamic-mode-handling)

In this scenario, you will have CSS in the same scope, fighting over the final value of those variables. It’s generally recommended to not
