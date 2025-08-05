# ⛋ @terrazzo/plugin-token-listing

Produce a listing of design tokens built by other plugins in a Terrazzo pipeline, following the [Token Listing Format](http://404-todo.com).

## Setup

Requires [Node.js 20 or later](https://nodejs.org) and [the CLI installed](https://terrazzo.app/docs/cli). With both installed, run:

> TODO: review setup instructions once it's all up and running.


```sh
npm i -D @terrazzo/plugin-token-listing
```

Add a `terrazzo.config.js` to the root of your project:

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
