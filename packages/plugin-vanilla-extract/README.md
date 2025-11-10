# ⛋ @terrazzo/plugin-vanilla-extract

Generate [Vanilla Extract](https://vanilla-extract.style) CSS themes from DTCG tokens.

## Setup

Requires [Node.js 20 or later](https://nodejs.org). With that installed, run:

```sh
npm i -D @terrazzo/cli @terrazzo/plugin-css @terrazzo/plugin-vanilla-extract
```

Add a `terrazzo.config.ts` to the root of your project with:

```ts
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
      themes: [
        { name: "light", mode: "light" },
        { name: "dark", mode: "dark" },
      ],

      // generate createGlobalTheme()
      globalThemes: [
        { selector: "@media (prefers-color-scheme: light)", mode: "light" },
        { selector: "@media (prefers-color-scheme: dark)", mode: "dark" },
      ],
    }),
  ],
});
```

This plugin extends [plugin-css](../plugin-css) and always generates [createGlobalThemeContract()](https://vanilla-extract.style/documentation/global-api/create-global-theme-contract/) to match your generated CSS global variable names 1:1. But from there, you can use either locally-scoped ([createThem()](https://vanilla-extract.style/documentation/api/create-theme/)) or globally-scoped ([createGlobalTheme()](https://vanilla-extract.style/documentation/global-api/create-global-theme/)) themes.

[View documentation](https://terrazzo.app/docs/integrations/vanilla-extract)
