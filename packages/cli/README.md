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

export default {
  /** path to tokens.json */
  tokens: './tokens.json',
  /** output directory for generated code*/
  outDir: './tokens/',
  /** plugins to generate different outputs */
  plugins: [],
  /** map Figma styles & components to tokens.json  */
  figma: {
    docs: [
      // add Figma docs
    ],
    /** optional: specify optimization settings */
    optimization: {
      svgo: false,
    },
  },
};
```

## Commands

| Command                | Description                                               |
| :--------------------- | :-------------------------------------------------------- |
| `cobalt build`         | Generate code from `tokens.json`                          |
| `cobalt build --watch` | Watch `tokens.json` for changes and rebuild on every save |
| `cobalt sync`          | Sync `tokens.json` with Figma                             |
| `cobalt init`          | Create a stub `tokens.json` file                          |
| `cobalt validate`      | Check `tokens.json` for errors                            |

## Plugins

Plugins are the entire purpose of using Cobalt! See the [plugin documentation](https://cobalt-ui.pages.dev/docs/plugins/) for instructions on getting started.

## Figma

For instructions on setting up figma, see the [Figma documentation](https://cobalt-ui.pages.dev/docs/getting-started/figma/)

## Documentation

**[See Documentation](https://cobalt-ui.pages.dev)**
