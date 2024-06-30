# ⛋ @terrazzo/plugin-tailwind

Generate a Tailwind theme from DTCG tokens.

## Setup

Requires [Node.js 18 or later](https://nodejs.org). With that installed, run:

```sh
npm i -D @terrazzo/cli @terrazzo/plugin-css @terrazzo/plugin-tailwind
```

Add a `terrazzo.config.js` to the root of your project with:

```ts
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import tailwind from "@terrazzo/plugin-tailwind";

export default defineConfig({
  outDir: "./tokens/",
  plugins: [
    css({
      fileName: "tokens.css",
    }),
    tailwind({
      fileName: "tailwind.js",

      theme: {
        /** @see https://tailwindcss.com/docs/configuration#theme */
        colors: {
          blue: {
            100: "color.blue.100",
            200: "color.blue.200",
            // …
          },
        },
        fontFamily: {
          sans: "typography.family.base",
          // …
        },
        extend: {
          spacing: {
            1: "token.size.s.space",
            2: "token.size.m.space",
            // …
          },
          borderRadius: {
            m: "token.size.m.borderRadius",
            // …
          },
        },
      },
    }),
  ],
});
```

Lastly, run:

```sh
npx tz build
```

And you’ll see a `./tokens/tailwind.js` file generated in your project.

[Full Documentation](https://terrazzo.app/docs/integrations/taiwlind)
