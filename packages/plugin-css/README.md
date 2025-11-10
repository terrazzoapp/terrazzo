# ⛋ @terrazzo/plugin-css

Convert DTCG tokens into CSS variables for use in any web application or native app with webview. Convert your modes into CSS media queries for complete flexibility.

## Setup

Requires [Node.js 20 or later](https://nodejs.org) and [the CLI installed](https://terrazzo.app/docs). With both installed, run:

```sh
npm i -D @terrazzo/plugin-css
```

Add a `terrazzo.config.ts` to the root of your project:

```ts
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";

export default defineConfig({
  outDir: "./tokens/",
  plugins: [
    css({
      filename: "tokens.css",
      variableName: (id) => id.replace(/\./g, "-"),
      baseSelector: ":root",
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
