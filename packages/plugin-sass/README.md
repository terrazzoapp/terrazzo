# ⛋ @terrazzo/plugin-sass

Convert DTCG tokens into Sass for use in any web application or native app with webview. Uses [the CSS plugin](/docs/integrations/css) under the hood that lets you use all of CSS’ features with the typesafety of Sass.

## Setup

Requires [Node.js 20 or later](https://nodejs.org) and [the CLI installed](https://terrazzo.app/docs/cli). With both installed, run:

```sh
npm i -D @terrazzo/plugin-css @terrazzo/plugin-sass
```

Add a `terrazzo.config.js` to the root of your project:

```ts
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import sass from "@terrazzo/plugin-sass";

export default defineConfig({
  outDir: "./tokens/",
  plugins: [
    css({
      filename: "tokens.css",
    }),
    sass({
      filename: "index.sass",
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
