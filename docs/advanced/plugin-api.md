---
title: Cobalt Plugin API
---

# Plugin API

Creating your own Cobalt plugins is easy if you’re comfortable with JavaScript. This guide is for creating a custom plugin yourself; if you’re looking for instructions on how to use existing plugins, [see the Getting Started guide](/guides/getting-started#next-steps).

## Plugin Format

A Cobalt plugin is designed similarly to a [Rollup](https://rollupjs.org/plugin-development/) or [Vite plugin](https://vitejs.dev/guide/api-plugin), if you’re familiar with those (no worries if you’re not). A plugin is essentially **any function that returns an object with the following keys**:

| Key      |    Type    | Description                                                  |
| :------- | :--------: | :----------------------------------------------------------- |
| `name`   |  `string`  | **Required.** The name of your plugin (shown on errors)      |
| `config` | `function` | (Optional) Read the user’s config, and optionally modify it. |
| `build`  | `function` | **Required.** The build output of your plugin.               |

_Note: the following examples will be using TypeScript, but JavaScript will work just as well if you prefer!_

```ts
import type { Plugin } from '@cobalt-ui/core';

export default function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    config(config) {
      // read final user config
    },
    async build({ tokens, metadata, rawSchema }) {
      // (your plugin code here)

      return [
        {
          filename: 'my-filename.json',
          contents: tokens,
        },
      ];
    },
  };
}
```

### Accepting Options

Your plugin can accept options as the parameters of your main function. The structure is up to you and what makes sense of your plugin. Here’s an example of letting a user configure the `filename`:

```ts
import type { Plugin } from '@cobalt-ui/core';

export interface MyPluginOptions {
  /** (Optional) Set the output filename */
  filename?: string;
  // add more options here!
}

export default function myPlugin(options: MyPluginOptions = {}): Plugin {
  const filename = options.filename || 'default-filename.json'; // be sure to always set a default!
  return {
    name: 'my-plugin',
    async build({ tokens, rawSchema }) {
      // (your plugin code here)

      return [
        {
          filename,
          contents: tokens,
        },
      ];
    },
  };
}
```

You’d then pass any options into `tokens.config.mjs`:

```js
import myPlugin from './my-plugin.js';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  plugins: [
    myPlugin({
      filename: 'custom.json',
    }),
  ],
};
```

You can then expand `options` to be whatever shape you need it to be.

### `name`

Naming your plugin helps identify it in case something goes wrong during the build. You can name your plugin anything.

### Token structure

Cobalt gives you more context when dealing with tokens. Inspecting each individual token will yield the following:

```js
{
  id: 'color.brand.green', // the full ID of the token
  $type: 'color', // the original $type
  $value: '#40c362', // the normalized $value
  $extensions: {
    mode: {…} // normalized modes
  },
  _group: {…} // metadata about the token’s parent group
  _original: {…} // the original node untouched from tokens.json (including unresolved aliases, etc.)
}
```

### Tips

- For `build()`, return a **relative filename**. That way it respects the user’s `outDir` setting.
- Returning only one file is normal! Most plugins only output one file.
- Use JSDoc comments as much as possible! They go a long way in good DX of your plugin.
- For the full ID of the token, a dot (`.`) always represents a group. So for `color.brand.green`, you’re looking at the `green` token, inside the `brand` group, inside the `color` group. Groups aren’t allowed to have dots in their names.
- Cobalt will always resolve `$value` to the final value, even for aliased tokens. To see the original alias name, see `_original.$value`.

## Lifecycle

Cobalt executes in the following order:

1. **Plugin instantiation.** All plugins are loaded, in array order, in the user’s config.
2. **Config.** `config()` is called on every plugin (if present), also in array order. Note that if any plugin modifies the config, the changes will only be picked up by plugins that appear later in the array.
3. **Build.** `build()` is called on every plugin, in parallel.
4. **Write.** Cobalt writes each plugin’s file(s) to disk after it’s done. This also happens in parallel, and happens as soon as each plugin finishes.

::: info

In an upcoming release (TBD), Cobalt will add some build hooks soon from the [Rollup Plugin API](https://rollupjs.org/plugin-development/#build-hooks), including, but not limited to, [load](https://rollupjs.org/plugin-development/#load), [buildStart](https://rollupjs.org/plugin-development/#buildstart), and [buildEnd](https://rollupjs.org/plugin-development/#buildend).

:::

### `config()`

The `config()` function is an optional callback that can read the final user config or modify it. Use it if you need to read a user’s setting. Though you _can_ mutate the config, don’t do so unless absolutely necessary!

```ts
import type { Plugin } from '@cobalt-ui/core';

export default function myPlugin(): Plugin {
  let outDir: URL | undefined;
  return {
    name: 'my-plugin',
    config(config) {
      outDir = config.outDir; // read the user’s outDir from the config, and save it
      // return nothing to leave config unaltered
    },
    async build({ tokens, rawSchema }) {
      console.log(outDir); // now config info is accessible within the build() function

      // (your plugin code here)

      return [{ filename: 'my-filename.json', contents: tokens }];
    },
  };
}
```

`config()` will be fired _after_ the user’s config has been fully loaded and all plugins are instantiated, and _before_ any build happens.

### `build()`

The `build()` function is the equivalent of Rollup’s [transform](https://rollupjs.org/plugin-development/#transform) hook. It takes one parameter object with 3 keys:

| Name        |         Type          | Description                                                 |
| :---------- | :-------------------: | :---------------------------------------------------------- |
| `tokens`    |       `Token[]`       | An array of tokens with metadata ([docs](#token-structure)) |
| `rawSchema` |      `DTCG JSON`      | The original `tokens.json` file, unedited.                  |
| `metadata`  | `Record<string, any>` | (currently unused)                                          |

After running, and formatting your output, the `build()` function should return an array of objects with the following properties:

| Name       |         Type         | Description                                                         |
| :--------- | :------------------: | :------------------------------------------------------------------ |
| `filename` |       `string`       | Filename (relative to user’s `outDir` setting, default `./tokens/`) |
| `contents` | `string` \| `Buffer` | File contents to be written to disk.                                |

```ts
export default function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    async build({ tokens, rawSchema }) {
      // (your plugin code here)

      return [
        { filename: './output-1.json', contents: jsonContents },
        { filename: './output-2.svg', contents: svgContents },
      ];
    },
  };
}
```

## Testing

To test your plugin working on your design tokens, add it to your `tokens.config.mjs`:

```js
import myPlugin from './my-plugin.js';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  plugins: [myPlugin()],
};
```

Now when you run `co build`, your plugin will run and you can see its output.

## Working with Token Types

See the **Tips & recommendations** section of token pages to learn more about working with each time:

- [Color](/tokens/color#tips-recommendations)
- [Dimension](/tokens/dimension#tips-recommendations)
- [Font Family](/tokens/font-family#tips-recommendations)
- [Duration](/tokens/duration#tips-recommendations)
- [Cubic Bézier](/tokens/cubic-bezier#tips-recommendations)
- [Gradient](/tokens/gradient#tips-recommendations)
- [Shadow](/tokens/shadow#tips-recommendations)

## Examples

Examples of plugins may be found [in the original source repo](https://github.com/drwpow/cobalt-ui/tree/main/packages).
