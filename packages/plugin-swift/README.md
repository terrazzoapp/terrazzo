# ⛋ @terrazzo/plugin-swift

Generate Swift code from DTCG tokens.

## Setup

Requires [Node.js 20 or later](https://nodejs.org). With that installed, and a `package.json`, run:

```sh
npm i -D @terrazzo/cli @terrazzo/plugin-swift
```

Add a `terrazzo.config.js` to the root of your project with:

```ts
import { defineConfig } from "@terrazzo/cli";
import swift from "@terrazzo/plugin-swift";

export default defineConfig({
  outDir: "./tokens/",
  plugins: [
    swift({
      catalogName: "Tokens",
    }),
  ],
});
```

Lastly, run:

```sh
npx tz build
```

And you’ll see a `./tokens/Tokens.xcassets` catalog generated in your project. [Import it](https://developer.apple.com/documentation/xcode/managing-assets-with-asset-catalogs) into your project and you’ll have access to all your tokens!

[Full Documentation](https://terrazzo.app/docs/integrations/swift)
