---
title: Tailwind
layout: ../../../layouts/docs.astro
---

# Tailwind

The Tailwind Terrazzo plugin can generate a [Tailwind v4 Theme](https://tailwindcss.com/docs/theme#theme) from your design tokens. This lets you use the power of Tailwind with DTCG tokens!

## Setup

Requires [Node.js 20 or later](https://nodejs.org) and [the CLI installed](/docs). With both installed, run:

:::npm

```sh
npm i -D @terrazzo/cli @terrazzo/plugin-tailwind
```

:::

And add it to `terrazzo.config.js` under `plugins`:

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import tailwind from "@terrazzo/plugin-tailwind";

export default defineConfig({
  outDir: "./tokens/",
  plugins: [
    css(),
    tailwind({
      filename: "tailwind.js",

      theme: {
        /** @see https://tailwindcss.com/docs/configuration#theme */
        colors: ["color.*"],
        font: {
          sans: "typography.family.base",
        },
        spacing: ["spacing.*"],
        radius: ["borderRadius.*"],
      },
    }),
  ],
});
```

:::

Lastly, run:

```sh
npx tz build
```

And you’ll see a `tokens/tailwind-theme.css` file generated in your project.

## Options

| Name           | Type                                  | Description                                             |
| :------------- | :------------------------------------ | :------------------------------------------------------ |
| `filename`     | `string`                              | Filename to generate (default: `"tailwind-theme.css"`). |
| `theme`        | `Record<string, any>`                 | Tailwind theme ([docs](#theme))                         |
| `modeVariants` | `{ variant: string, mode: string }[]` | See [Dark mode & variants](#dark-mode-&-variants).      |

## Theme

Tailwind has [theme docs](https://tailwindcss.com/docs/theme) that map CSS variables to Tailwind classes. This plugin generates that CSS for you, but you still have to provide the desired mapping here.

### Token mapping

Let’s take a look at a common case: **color**. In Tailwind, those are handled via `--color-*` tokens. Let’s say we have tokens `--color-blue-0` … `color-blue-9` and we want to add those to Tailwind. We could do any of the above:

We can declare

```js
tailwind({
  theme: {
    color: {
      blue: {
        0: "color.blue.0",
        1: "color.blue.1",
        // …
        9: "color.blue.9",
      },
    },
  },
});
```

That will generate:

```css
@theme {
  --color-blue-0: #ddf4ff;
  --color-blue-1: #b6e3ff;
  /* … */
  --color-blue-9: #002155;
}
```

#### Arrays

Being explicit is fine! And it’s needed when you need to rename or remap complex things. But whenever you’re declaring tokens 1:1, you can save some typing:

```js
tailwind({
  theme: {
    color: {
      blue: ["color.blue.*"],
    },
  },
});
```

Or even more tersely:

```js
tailwind({
  theme: {
    color: ["color.*"],
  },
});
```

Which will generate the same CSS. Terrazzo simply expanded the keys & values into an object for you.

Globs are powered by [picomatch](https://www.npmjs.com/package/picomatch), so you could do advanced filters like `['color.{red,blue}.*']`. [See the picomatch docs](https://www.npmjs.com/package/picomatch) for supported syntax.

#### Gotchas

Note that things will be named starting from the `*`, so if you had, say,

```js
tailwind({
  theme: {
    color: { blue: ["color.*"] },
  },
});
```

Then that would unpack to `--color-blue-blue-0`, `--color-blue-blue-1`, etc. Further, if you tried to unpack conflicting token names, e.g.:

```js
tailwind({
  theme: {
    color: ["color.blue.*", "color.blue.red.*"],
  },
});
```

You’d wind up with `--color-0`, `--color-1`, etc. which would point to `color.red.*` since it came last in the array.

All that said, keep in mind that **theme mapping is up to you!** So the theme will be built exactly as you’ve declared.

### Dark mode & variants

Tailwind considers dark mode as a [variant](https://tailwindcss.com/docs/functions-and-directives#variant-directive) underneath, which means you’re not restricted to simply dark mode when using modes in tokens.

By declaring a `variants` array with both `selector` (Tailwind) and `mode` (DTCG mode), you can generate the following CSS:

```js
tailwind({
  theme: {
    color: ["color.*"],
  },
  modeVariants: [
      { variant: "dark", mode: "dark" },
      { variant: "hc", mode: "high-contrast" },
    ],
});
```

Produces:

```css
@theme {
  /* base tokens */
}

@variant dark {
  /* mode: dark tokens */
}

@variant hc {
  /* mode: hc tokens */
}
```
