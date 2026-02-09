---
title: Tailwind
layout: ../../../../layouts/docs.astro
---

# Tailwind

The Tailwind Terrazzo plugin can generate a [Tailwind v4 Theme](https://tailwindcss.com/docs/theme#theme) from your design tokens. This lets you use the power of Tailwind with DTCG tokens!

## Setup

Requires [Node.js](https://nodejs.org) and [the CLI installed](/docs). With both installed, run:

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

const prepare = (css: string) => string;

export default defineConfig({
  outDir: "./tokens/",
  plugins: [
    css({
      skipBuild: true, // Optional, don’t generate another .css file if tailwind is all that’s needed
      permutations: [
        { theme: "light", prepare },
        { theme: "dark", prepare },
        { theme: "light-high-contrast", prepare },
        { theme: "dark-high-contrast", prepare },
      ],
    }),
    tailwind({
      filename: "tailwind-theme.css",
      theme: {
        /** @see https://tailwindcss.com/docs/configuration#theme */
        color: ["color.*"],
        font: {
          sans: "typography.family.base",
        },
        spacing: ["spacing.*"],
        radius: ["borderRadius.*"],
      },
      defaultPermutation: { theme: "light" },
      variants: [
        light: { theme: "light" },
        dark: { theme: "dark" },
        "light-hc": { theme: "light-hc" },
        "dark-hc": { theme: "dark-hc" },
      ],
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

| Name                 | Type                                              | Description                                             |
| :------------------- | :------------------------------------------------ | :------------------------------------------------------ |
| `filename`           | `string`                                          | Filename to generate (default: `"tailwind-theme.css"`). |
| `theme`              | `Record<string, any>`                             | Tailwind theme ([docs](#theme))                         |
| `defaultPermutation` | `Record<string, string>`                          | Set the default permutation input.                      |
| `variants`           | `Record<string, string>, Record<string, string>>` | See [Dark mode & variants](#permutations).              |

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

Globs are powered by [picomatch](https://www.npmjs.com/package/picomatch), so you could do advanced filters like `['color.{red,blue}.**']`. [See the picomatch docs](https://www.npmjs.com/package/picomatch) for supported syntax.

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

### Permutations

You’ll map permutations from your resolver 1:1 with [Tailwind Variants](https://tailwindcss.com/docs/functions-and-directives#variant-directive).

The CSS plugin is responsible for generating the initial values that the Tailwind plugin reads. The Tailwind plugin then just maps it to variants. So you can only access permutations if they’re built in the CSS plugin:

```diff
  const prepare = (css: string) => css;

  export default defineConfig({
    plugins: [
      css({
        skipBuild: true,
        permutations: [
          { input: { theme: "light" }, prepare },
          { input: { theme: "dark" }, prepare },
          { input: { theme: "light-high-contrast" }, prepare },
          { input: { theme: "dark-high-contrast" }, prepare },
        ],
      }),
      tailwind({
        theme: {
          color: ["color.*"],
        },
+       defaultPermutation: { theme: "light" },
+       variants: {
+         dark: { theme: "dark" },
+         "light-hc": { theme: "light-high-contrast" },
+         "dark-hc": { theme: "dark-high-contrast" },
+       },
      });
    ],
```

- In the CSS plugin settings, the `prepare` function normally formats the CSS template, but if `skipBuild: true` is set, it doesn’t matter.
- In the Tailwind plugin settings, `variants` are a key–value map from `@variant` to a resolver input. This will be empty if it’s missing from the CSS options!

In this example, all the following yields:

```css
@theme {
  /* … */
}

@variant dark {
  /* … */
}

@variant light-hc {
  /* … */
}

@variant dark-hc {
  /* … */
}
```

:::tip

If you see an empty block generated in your Tailwind theme, check the CSS plugin options! You may be missing that `permutation` you’re trying to access.

:::

#### Accessing legacy $extensions.mode

You don’t have to have your tokens in a resolver format to use permutations! You can access the values from $extensions.mode via the virtual `tzMode` modifier:

```ts
exportdefineConfig({
  plugins: [
    tailwind({
      defaultPermutation: { tzMode: "light" },
      permutations: [{ variant: "dark", input: { tzMode: "dark" } }],
    }),
  ],
});
```

:::warning

For the Tailwind plugin, don’t mix-and-match `tzMode` with newer resolvers—you’ll get stranded tokens lost between permutations and you won’t get correct output. For this plugin, either use **ONLY** `tzMode` by itself, or convert all your tokens to the new [resolver format](https://www.designtokens.org/TR/2025.10/resolver/).

:::
