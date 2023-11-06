---
title: Config
---

# Config

Customizing Cobalt and managing plugins requires you to add a `tokens.config.mjs` file in the root of your project. Here’s an example configuration with all settings and defaults:

::: code-group

```js [tokens.config.mjs]
import pluginJS from '@cobalt-ui/plugin-js';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [pluginJS()],

  // token type options
};
```

:::

## `tokens`

The `tokens` property is where you tell Cobalt your `tokens.json` file lives ([or files](#multiple-schemas)). By default this is set to `./tokens.json`, so this option can be omitted if your tokens manifest lives there.

### YAML

Cobalt supports `tokens.json` as YAML as well:

::: code-group

```js [tokens.config.mjs]
/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.yaml',
};
```

:::

::: info
The file extension must be `.yml` or `.yaml` to be parsed as YAML
:::

### Remote schemas

Cobalt can load tokens from any **publicly-available** URL:

::: code-group

```js [tokens.config.mjs]
/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: 'https://my-bucket.s3.amazonaws.com/tokens.json',
};
```

:::

### npm

To load tokens from an npm package, update `config.tokens` to point to the **full JSON path** (not merely the root package):

::: code-group

```js [tokens.config.mjs]
/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: '@my-scope/my-tokens', // [!code --]
  tokens: '@my-scope/my-tokens/tokens.json', // [!code ++]
};
```

:::

### Multiple schemas

Cobalt supports loading multiple tokens schemas by passing an array:

::: code-group

```js [tokens.config.mjs]
/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: ['./base.json', './theme.json', './overrides.json'],
};
```

:::

Cobalt will flatten these schemas in order, with the latter entries overriding the former if there are any conflicts. The final result of all the combined schemas **must** result in a valid tokens.json.

::: info
All aliases must refer to the same document. For example, instead of `{./theme.json#/color.action.50}`, omit the filepath and use `{color.action.50}` as if it were in the same file.
:::

## `outdir`

`outdir` is the **output directory** where all plugins will generate files to. This can only be set to a directory, not a file, since you’ll almost always use multiple plugins and generate multiple output files. By default this is `./tokens/`, but you can move this anywhere. Note that each plugin decides where to generate its file(s), but you can usually configure additional options per-plugin.

## `plugins`

The following official plugins are available. Refer to each’s documentation to learn all it can do as well as all the options available:

- [@cobalt-ui/plugin-css](/integrations/css): Generate CSS variables, and optionally utility CSS
- [@cobalt-ui/plugin-js](/integrations/js): Generate JavaScript + TypeScript
- [@cobalt-ui/plugin-js](/integrations/json): Generate JSON for universal usage
- [@cobalt-ui/plugin-sass](/integrations/sass): Generate Sass (compatible with the CSS plugin)
- [@cobalt-ui/plugin-tailwind](/integrations/tailwind): Generate a Tailwind CSS theme (compatible with the CSS plugin)
- @cobalt-ui/plugin-img: TODO
- @cobalt-ui/plugin-php: TODO
- @cobalt-ui/plugin-python: TODO
- @cobalt-ui/plugin-ruby: TODO
- @cobalt-ui/plugin-elixir: TODO

_If you’ve created a Cobalt plugin of your own, please [suggest yours](https://github.com/drwpow/cobalt-ui)!_

### Custom Plugins

Creating custom plugins is designed to be easy. Please [view the plugin guide](/advanced/plugin-api) to learn how to create your own.

## Token Type Options

Some token types allow for extra configuration.

## Color

::: code-group

```js [tokens.config.mjs]
/** @type import('@cobalt-ui/core').Config */
export default {
  color: {
    convertToHex: false, // Convert all colors to sRGB hexadecimal (default: false). By default, colors are kept in their formats
  },
};
```

:::

| Name                 |   Type    | Description                                                                                                      |
| :------------------- | :-------: | :--------------------------------------------------------------------------------------------------------------- |
| `color.convertToHex` | `boolean` | Convert this color to sRGB hexadecimal. By default, colors are kept in the original formats they’re authored in. |
