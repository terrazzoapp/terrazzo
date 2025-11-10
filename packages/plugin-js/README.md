# ⛋ @terrazzo/plugin-js

Generate JavaScript, TypeScript, and JSON from DTCG tokens.

## Setup

Requires [Node.js 20 or later](https://nodejs.org). With that installed, run:

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
      js: "index.js",
      // json: "tokens.json",
    }),
  ],
});
```

Lastly, run:

```sh
npx tz build
```

And you’ll see a `./tokens/index.js` file generated in your project.

[Full Documentation](https://terrazzo.app/docs/integrations/js)
