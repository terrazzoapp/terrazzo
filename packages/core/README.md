# co-tokens

Generate code from your design tokens, and sync your design tokens with Figma. 🦀 Powered by Rust.

## Install

```
npm install co-build
```

## CLI

### Build

Generate code from your `cobalt.config.mjs` file ([docs](https://cobalt-ui.pages.dev/reference/config))

```
co build
```

### Sync

Sync `tokens.yaml` with Figma ([docs](https://cobalt-ui/pages.dev/guides/figma))

## Node.js

```js
import cobalt from "co-build";
import sass from "@cobalt-ui/sass";

await cobalt.build({
  outDir: "./tokens",
  plugins: [sass()],
});
```
