---
title: Sass
layout: ../../../../layouts/docs.astro
---

# Sass

Convert DTCG tokens into Sass for use in any web application or native app with webview. Uses [the CSS plugin](/docs/integrations/css) under the hood that lets you use all of CSS’ features with the typesafety of Sass.

## Setup

Requires [Node.js 20 or later](https://nodejs.org) and [the CLI installed](/docs). With both installed, run:

:::npm

```sh
npm i -D @terrazzo/plugin-css @terrazzo/plugin-sass
```

:::

And add both to your `terrazzo.config.ts` under `plugins` (order doesn’t matter):

:::code-group

```ts [terrazzo.config.ts]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import sass from "@terrazzo/plugin-sass";

export default defineConfig({
  plugins: [
    css({
      filename: "tokens.css",
      modeSelectors: [
        { mode: "light", selectors: ["@media (prefers-color-scheme: light)"] },
        { mode: "dark", selectors: ["@media (prefers-color-scheme: dark)"] },
      ],
    }),
    sass({
      filename: "index.scss",
    }),
  ],
});
```

:::

Then when running `tz build`, you’ll see the following files generated in your `tokens/` output dir (or however you named them):

- `index.scss`
- `tokens.css`

Be sure to **load both files in your project!** Otherwise you’ll have missing values.

## Config

:::code-group

```ts [terrazzo.config.ts]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import sass from "@terrazzo/plugin-sass";

export default defineConfg({
  plugins: [
    css(),
    sass({
      filename: "index.scss",
      exclude: [],
    }),
  ],
});
```

:::

| Name       | Type       | Description                                            |
| :--------- | :--------- | :----------------------------------------------------- |
| `filename` | `string`   | Rename the output `.scss` file (default: `index.scss`) |
| `exclude`  | `string[]` | (optional) Glob pattern(s) of token IDs to exclude.    |

## Migrating from Cobalt 1.x

The original Cobalt 1.x Sass plugin allowed you to use it in “hardcoded mode” or “CSS variable mode.” The hardcoded mode was limiting because it lacked all the dynamism that CSS allows with variables and media queries. And as the default behavior, it seemed to encourage an increasingly less-ideal output.

The CSS variable mode was much better by comparison, but the limiting 1.x plugin API resulted in some hacky workarounds that were ultimately unwieldy and buggy, especially with modes.

In the latest version, the CSS plugin has been improved and enhanced even further (it’s arguably the most mature out of all plugins), and takes advantage of the rapid development of CSS over the past few years. Since Sass ultimately _must_ compile to CSS anyway, it just made sense to encourage users to take advantage of the CSS plugin’s power, and make the Sass plugin a thin typechecking layer on top of that. This should result in more features and flexibility, and smoother interop between the two.

The less-popular `.sass` output mode was also removed just to reduce maintenance, but it can be added back for the one person that still uses that syntax 😉.

All that said, you’ll find (intentionally) fewer options in this Sass plugin, for an improved experience.
