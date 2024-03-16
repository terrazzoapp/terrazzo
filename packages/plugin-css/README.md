# @cobalt-ui/plugin-css

Generate CSS from your design tokens using [Cobalt](https://cobalt-ui.pages.dev).

**Features**

- ✅ 🌈 Automatic [P3 color](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/color-gamut) enhancement
- ✅ Automatic mode inheritance (e.g. light/dark mode)

## Basic Setup

Install the plugin from npm:

```sh
npm i -D @cobalt-ui/plugin-css
```

Then add to your `tokens.config.mjs` file:

```js
// tokens.config.mjs
import pluginCSS from "@cobalt-ui/plugin-css";

/** @type {import("@cobalt-ui/core").Config} */
export default {
  tokens: "./tokens.json",
  outDir: "./tokens/",
  plugins: [pluginCSS()],
};
```

And run:

```sh
npx co build
```

You’ll then get a ./tokens/tokens.css file with [CSS variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) for you to use anywhere in your app:

```css
/* tokens/tokens.css */

:root {
  --color-blue: #0969da;
  --color-green: #2da44e;
  --color-red: #cf222e;
  --color-black: #101010;
  --color-ui-text: var(--color-black);
}
```

## Docs

[View the full documentation](https://cobalt-ui.pages.dev/integrations/css)
