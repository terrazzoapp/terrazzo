# Cobalt UI

CLI for managing [W3C Design Token format](https://www.w3.org/community/design-tokens/) design systems.

## Usage

Install:

```bash
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

All CLI commands require a [config](/docs/reference/config/) to work properly, with the exception of `co check` and `co convert`.

`npx co [command]`

| Command                       | Notes                                                                                                                                                                                                                                           |
| :---------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build`                       | Turn design tokens into output files using [plugins]((https://cobalt-ui.pages.dev/docs//integrations). You can watch for changes in dev mode with `build --watch`.                                                                              |
| `bundle --out [path]`         | Bundle multiple `tokens.json` files into one, e.g. `co bundle --out path/to/output.json`. Can output `.json` or `.yaml`. Requires [multiple schemas set in config](https://cobalt-ui.pages.dev/docs/reference/config/#loading-multiple-schemas) |
| `check [path]`                | Validate a `tokens.json` file and check for errors. This won’t output any files.                                                                                                                                                                |
| `init`                        | Create a starter `tokens.json` file.                                                                                                                                                                                                            |
| `convert [path] --out [path]` | Convert a [Style Dictionary](https://amzn.github.io/style-dictionary) JSON file to the W3C format ([docs](https://cobalt-ui.pages.dev/docs/integrations/style-dictionary))                                                                      |

## Plugins

Plugins are the entire purpose of using Cobalt! See the [plugin documentation](https://cobalt-ui.pages.dev/docs/integrations/) for instructions on getting started.

## Documentation

**[See Documentation](https://cobalt-ui.pages.dev)**
