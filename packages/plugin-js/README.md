# ⛋ @terrazzo/plugin-js

Use DTCG resolvers in Node.js for server-rendered applications.

> [!NOTE]
>
> Since adding support for [resolvers](https://terrazzo.app/docs/), plugin-js has added more weight and metadata than is practical for most clientside uses. You may want to consider using [plugin-css-in-js](https://github.com/terrazzoapp/terrazzo/blob/main/packages/plugin-css-in-js) instead.

## Setup

Requires [Node.js](https://nodejs.org). With that installed, run:

```sh
npm i -D @terrazzo/cli @terrazzo/plugin-js
```

Add a `terrazzo.config.ts` to the root of your project with:

```ts
import { defineConfig } from "@terrazzo/cli";
import js from "@terrazzo/plugin-js";

export default defineConfig({
  outDir: "./tokens/",
  plugins: [
    js({
      filename: "tokens.js", // Note: `.d.ts` is generated too
    }),
  ],
});
```

Lastly, run:

```sh
npx tz build
```

And you’ll see a `./tokens/tokens.js` file generated in your project.

[Full Documentation](https://terrazzo.app/docs/integrations/js)
