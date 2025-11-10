# ⛋ @terrazzo/plugin-token-listing

Produce a Token Listing Format file for your design token build. The Token Listing Format is used by design token tool makers to understand the relationship between your source design tokens and your style files built in Terrazzo.

## Setup

Requires [Node.js 20 or later](https://nodejs.org) and [the CLI installed](https://terrazzo.app/docs). With both installed, run:

```sh
npm i -D @terrazzo/plugin-token-listing
```

Add a `terrazzo.config.ts` to the root of your project:

```ts
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import listing from "@terrazzo/plugin-token-listing";

export default defineConfig({
  outDir: "./tokens/",
  plugins: [
    // Include at least one plugin to build tokens
    css({
      filename: "tokens.css",
    }),

    // Configure the token listing
    listing({
      filename: 'terrazzo.listing.json',
      // Pass mode information so documentation tools can generate mode selectors
      modes: [
        {
          name: 'color-scheme',
          values: ['light', 'dark'],
          description: 'Color theme matching user device preferences',
        },
      ],
      // Define platforms included in the Terrazzo build
      platforms: {
        css: {
          description: 'Tokens built as CSS variables for the developers',
          filter: '@terrazzo/plugin-css',
          name: '@terrazzo/plugin-css',
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

And you’ll see a `./tokens/tokens.listing.json` file generated in your project.

[Full Documentation](https://terrazzo.app/docs/integrations/token-listing)
