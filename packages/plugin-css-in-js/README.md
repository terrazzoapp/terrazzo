# ⛋ @terrazzo/plugin-css-in-js

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

And you’ll see a `./tokens/tokens.js` file generated in your project.

[Full Documentation](https://terrazzo.app/docs/integrations/css-in-js)
