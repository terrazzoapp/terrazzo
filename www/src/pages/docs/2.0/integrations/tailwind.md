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
        { motion: "reduced", prepare },
      ],
    }),
    tailwind({
      /** Input */
      template: "tailwind.template.css",
      /** Output */
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

| Name       | Type                  | Description                                             |
| :--------- | :-------------------- | :------------------------------------------------------ |
| `template` | `string`              | The [template](#template) to use.                       |
| `filename` | `string`              | Filename to generate (default: `"tailwind-theme.css"`). |
| `theme`    | `Record<string, any>` | Tailwind theme ([docs](#theme))                         |

## Theme

The `theme` option of the config is where you control the mapping of your DTCG token names to Tailwind classes. This affects your API! The level of granular control here is important to generate the utility classes you want.

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
      blue: ["color.blue.**"],
    },
  },
});
```

Or even more tersely:

```js
tailwind({
  theme: {
    color: ["color.**"],
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

## Template

Tailwind adds features all the time, and it‘s important that Terrazzo doesn’t block you from any functionality. Since Tailwind v4 relies on [CSS config](https://tailwindcss.com/docs/functions-and-directives), Terrazzo gives you full control over your Tailwind setup, and only fills in token values.

Here’s an example of a token system with the following modifiers:

- `{ theme: "light" }`
- `{ theme: "dark" }`
- `{ theme: "light-high-contrast" }`
- `{ theme: "dark-high-contrast" }`
- `{ motion: "reduced" }`

```css
@import "tailwindcss";

/* Default theme */
@theme {
  @tz (theme: "light");
}

/* Uncomment to change conditions for dark mode */
/* @custom-variant dark ([data-theme="dark"] &); */

/* Dark mode (@see https://tailwindcss.com/docs/dark-mode) */
@variant dark {
  @tz (theme: "dark");
}

/* Custom variant: light-high-contrast (shortened to "light-hc" in Tailwind) */
@custom-variant light-hc ([data-theme="light-hc"] &);

@variant light-hc {
  @tz (theme: "light-high-contrast");
}

/* Custom variant: dark-high-contrast (shortened to "dark-hc" in Tailwind) */
@custom-variant dark-hc ([data-theme="dark-hc"] &);

@variant dark-hc {
  @tz (theme: "dark-high-contrast");
}

/* Custom variant for reduced motion */
@custom-variant reduced-motion (@media (prefers-reduced-motion: reduce));

@variant reduced-motion {
  @tz (motion: "reduced");
}

/* Custom CSS is allowed */
.my-custom-util {
  color: red;
}
```

You’ll notice the `@tz` function is used to pull tokens from a specific resolver [input](/docs/2.0/guides/resolvers/#modifiers). This will inject CSS variables generated from [plugin-css](/docs/2.0/integrations/css/).

:::tip

Tailwind v4 requires registering new variants with [@custom-variant](https://tailwindcss.com/docs/hover-focus-and-other-states#custom-variants) before using it. `@variant dark` is a special variant that Tailwind acknowledges automatically, but you can still [customize its conditions if desired](https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually).

:::

Note that for every permutation, you’ll have to make sure you also specify that permutation in `plugin-css`’ [permutations](/docs/2.0/integrations/css/) setting. plugin-tailwind will throw an error if nothing generated. The reason for this is resolvers can be too slow generating impossible combinations of tokens for contexts you’ll never use! And while, yes, managing config between plugin-css and plugin-tailwind is cumbersome, it is done so that a project that is using both never gets out-of-sync or generates incompatible styles.

### @tz

This is a special at-rule that will inject a resolver output at that point in the CSS. The syntax is a function that accepts comma-separated inputs for each modifier:

```css
@tz (modifier1: "value", modifier2: "value", …);
```

Note that if all your modifiers have defaults, you can also simply write:

```css
@tz;
```

:::warning

The modifier values MUST be surrounded with quotes! In other words, `@tz(modifier1: value)` is invalid ❌.

:::

#### Accessing legacy $extensions.mode

You don’t have to have your tokens in a resolver format to use permutations! You can access the values from $extensions.mode via the virtual `tzMode` modifier:

```css
@theme {
  @tz (tzMode: "."); /* . is necessary for default! */
}

@variant dark {
  @tz (tzMode: "dark");
}
```

:::warning

For the Tailwind plugin, don’t mix-and-match `tzMode` with resolver modifiers—you’ll get stranded tokens lost between permutations and you won’t get correct output. For this plugin, either use **ONLY** `tzMode` by itself, or convert all your tokens to the new [resolver format](https://www.designtokens.org/TR/2025.10/resolver/).

:::

## Migrating from 0.x

The major change to this plugin is relying fully on [a template](https://tailwindcss.com/docs/functions-and-directives), and discarding your manual `modeVariants` setting:

```diff
  export default defineConfig({
    plugins: [
      tailwind({
-       modeVariants: [
-         { variant: "dark", mode: "dark" },
-       ],
+       template: "tailwind.template.css",
      }),
    ],
  });
```

You’ll then use the [@tz at-rule](#tz) to inject tokens in the places you’d like them. But otherwise you’re in full control!
