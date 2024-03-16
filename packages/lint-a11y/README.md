# @cobalt-ui/lint-a11y

Lint your token schema for a11y errors. Can check your color + typography tokens for contrast, and more.

Install the plugin:

```sh
npm i -D @cobalt-ui/lint-a11y
```

Then add to your `tokens.config.js` file:

```js
// tokens.config.js
import a11y from "@cobalt-ui/lint-a11y";

/** @type {import("@cobalt-ui/core").Config} */
export default {
  tokens: "./tokens.json",
  outDir: "./tokens/",
  plugins: [a11y()],
  lint: {
    // checks
  },
};
```

Refer to [the documentation](https://cobalt-ui.pages.dev/integrations/a11y) for a list of all rules and options.
