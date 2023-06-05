# Cobalt UI

Schemas and tools for managing design tokens.

## Usage

Install:

```
npm i -D @cobalt-ui/cli
```

And place a `tokens.config.mjs` file in the root of your project. Here are all the options, along with defaults:

```js
// tokens.config.mjs

/** @type import('@cobalt-ui/core').Config */
export default {
  /** path to tokens.json */
  tokens: './tokens.json',
  /** output directory for generated code*/
  outDir: './tokens/',
  /** plugins to generate different outputs */
  plugins: [],
};
```

## Commands

| Command            | Description                                               |
| :----------------- | :-------------------------------------------------------- |
| `co build`         | Generate code from `tokens.json`                          |
| `co build --watch` | Watch `tokens.json` for changes and rebuild on every save |
| `co sync`          | Sync `tokens.json` with Figma                             |
| `co init`          | Create a stub `tokens.json` file                          |
| `co check`         | Check `tokens.json` for errors                            |

## Plugins

Plugins are the entire purpose of using Cobalt! See the [plugin documentation](https://cobalt-ui.pages.dev/docs/plugins/) for instructions on getting started.

## Figma

For instructions on setting up figma, see the [Figma documentation](https://cobalt-ui.pages.dev/docs/guides/figma/)

## Documentation

**[See Documentation](https://cobalt-ui.pages.dev)**
