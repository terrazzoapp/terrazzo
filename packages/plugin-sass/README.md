# ⛋ @terrazzo/plugin-sass

Generate Sass code from DTCG tokens.

## Setup

Requires [Node.js 18 or later](https://nodejs.org). With that installed, run:

```sh
npm i -D @terrazzo/cli @terrazzo/plugin-css @terrazzo/plugin-sass
```

Add a `terrazzo.config.js` to the root of your project with:

```ts
import { defineConfig } from "@terrazzo/cli";
import sass from "@terrazzo/plugin-sass";

export default defineConfig({
  outDir: "./tokens/",
  plugins: [
    css({
      fileName: "tokens.css",
    }),
    sass({
      fileName: "index.sass",
    }),
  ],
});
```

Lastly, run:

```sh
npx tz build
```

And you’ll see a `./tokens/index.scss` file generated in your project.

[Full Documentation](https://terrazzo.app/docs/integrations/sass)
