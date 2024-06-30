# ⛋ @terrazzo/plugin-lint-a11y

Add accessibility linting checks to your DTCG tokens.

## Setup

Requires [Node.js 18 or later](https://nodejs.org). With that installed, run:

```sh
npm i -D @terrazzo/cli @terrazzo/plugin-lint-a11y
```

Add a `terrazzo.config.js` to the root of your project, along with corresponding `lint` rules:

```ts
import { defineConfig } from "@terrazzo/cli";
import a11y from "@terrazzo/plugin-lint-a11y";

export default defineConfig({
  outDir: "./tokens/",
  plugins: [a11y()],
  lint: {
    rules: {
      "a11y/contrast": [
        "error",
        {
          checks: [
            {
              tokens: {
                foreground: "color.*.text",
                background: "color.*.bg",
                typography: "typography.body",
                modes: ["light", "dark"],
              },
              wcag2: "AAA",
            },
          ],
        },
      ],
    },
  },
});
```

Note that this requires [configuration](https://terrazzo.app/docs/integrations/lint-a11y) to configure linting properly.

[Full Documentation](https://terrazzo.app/docs/integrations/lint-a11y)
