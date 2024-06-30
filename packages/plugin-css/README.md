# ⛋ @terrazzo/plugin-css

Generate CSS from DTCG tokens.

## Setup

Requires [Node.js 18 or later](https://nodejs.org). With that installed, run:

```sh
npm i -D @terrazzo/cli @terrazzo/plugin-css
```

Add a `terrazzo.config.js` to the root of your project with:

```ts
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";

export default defineConfig({
  outDir: "./tokens/",
  plugins: [
    css({
      fileName: "tokens.css",
    }),
  ],
});
```

Lastly, run:

```sh
npx tz build
```

And you’ll see a `./tokens/tokens.css` file generated in your project.

[Full Documentation](https://terrazzo.app/docs/integrations/css)
