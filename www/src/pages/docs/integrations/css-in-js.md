---
title: CSS-in-JS
layout: ../../../layouts/docs.astro
---

# CSS-in-JS

Reference CSS variables from [plugin-css](https://github.com/terrazzoapp/terrazzo/blob/main/packcages) in JS. Compatible with Linaria, StyleX, Vanilla Extract, Styled Components, and most CSS-in-JS libraries.

## Setup

Requires [Node.js](https://nodejs.org). With that installed, run:

```sh
npm i -D @terrazzo/cli @terrazzo/plugin-css @terrazzo/plugin-css-in-js
```

Add a `terrazzo.config.ts` to the root of your project with:

```ts
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import cssInJs from "@terrazzo/plugin-css-in-js";

export default defineConfig({
  outDir: "./tokens/",
  plugins: [
    css(),
    cssInJs({
      filename: "vars.js", // Note: `.d.ts` is generated too
    }),
  ],
});
```

Lastly, run:

```sh
npx tz build
```

And you’ll see a `./tokens/vars.js` file generated in your project.

## Usage

Your tokens will be exported with each root-level group being its own export. It will export a type-safe, nested object that matches your token names. The CSS vars will correctly mirror all outputs from [plugin-css](/docs/integrations/css).

:::code-group

```tsx
import stylex from "@stylexjs/stylex";
import { color } from "./tokens/vars.js";

const styles = stylex.create({
  button: {
    background: color.bg.brand, // var(--color-bg-brand)
    color: color.text.onBrand, // var(--color-text-on-brand)
  },
});
```

:::

Alternately, you can import all vars using a glob import:

```ts
import * as myDS from "./tokens/vars.js";
```

Note that for numeric or invalid properties, you’ll have to use bracket syntax, like so:

```ts
const styles = stylex.create({
  button: {
    padding: space["100"], // var(--space-100)
  },
});
```

## Comparison to plugin-vanilla-extract

Terrazzo also ships [plugin-vanilla-extract](/docs/integrations/vanilla-extract) for a slightly-deeper integration with its [theme API](https://vanilla-extract.style/documentation/theming/). plugin-css-in-js by comparison is a generic approach that has no awareness of any specific library API, but this will work with Vanilla Extract just as well if you don’t need the deeper features.
