---
title: Plugins
layout: ../../../layouts/docs.astro
---

# Create your own plugins

Creating your own Cobalt plugins is easy if you’re comfortable with JavaScript. This guide is for creating a custom plugin yourself; if you’re looking for instructions on how to use existing plugins, [see the plugins directory](/docs/integrations).

## Why use Cobalt?

Cobalt was created to deal with the following difficulties of the W3C Design Tokens spec:

1. **Validation**: Cobalt errs on schema violations
2. **Normalization**: The W3C Design Tokens spec allows for much flexibility, which means many unexpected values
3. **Aliasing**: Cobalt resolves aliases (including _aliases of aliases of aliases!_) for you
4. **Traversal**: A deeply-nested object is converted into a flat array for easy iteration
5. **Modes** Cobalt extends the design tokens format with powerful [modes](/docs/tokens#modes)
6. **Figma syncing** Update your design tokens with Figma easily

## Basic structure

A Cobalt plugin is a function that returns an object. That object requires only 2 things:

1. **name**: a string that provides the name of your plugin (this will be shown if there are any errors)
2. **build**: an asynchronous function that returns an array of files to be built.

_Note: the following examples will be using TypeScript, but JavaScript will work just as well if you prefer!_

```ts
import type {Plugin} from '@cobalt-ui/core';

export default function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    async build({tokens}) {
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

`tokens` is that array of tokens that have been validated, normalized, aliased, and all the other actions outlined above.

The return signature of `build` is an array. This means you can output one, or multiple files with your plugin. Since `tokens/` is the default folder where everything gets generated ([configurable](/docs/reference/config/)), in our example we’d be generating a `tokens/my-filename.json` file when our plugin is done. `filename` is how we set the filename (and it accepts subfolders); `contents` is a string of code that will be written to disk (it can also accept a `Buffer` if needed).

For many plugins, an output of one file will suffice (i.e. an array of one). But say you were generating multiple icons from tokens. You’d need to populate the array with one filename & content entry per icon. The array is meant to handle this case, rather than requiring a plugin that generates multiple files to deal with the file system directly and make sure all the user settings were respected.

## Testing

To test your plugin working on your design tokens, add it to your `tokens.config.mjs`:

```js
import myPlugin from './my-plugin.js';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [myPlugin()],
};
```

Now when you run `co build`, your plugin will run and you can see its output.

## Options

Your plugin can accept any options desired as parameters to your main function. What your options are is entirely up to you and what makes sense of your plugin. Here’s an example of letting a user configure the `filename`:

```ts
import type {Plugin} from '@cobalt-ui/core';

export interface MyPluginOptions {
  /** set the output filename */
  filename?: string;
  // add more options here!
}

export default function myPlugin(options: MyPluginOptions = {}): Plugin {
  const filename = options.filename || 'default-filename.json'; // be sure to always set a default!
  return {
    name: 'my-plugin',
    async build({tokens}) {
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

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    myPlugin({
      filename: 'custom.json',
    }),
  ],
};
```

You can then expand `options` to be whatever shape you need it to be.

## User Config

Plugins may also provide an optional `config()` function to either read the user config, or modify it:

```ts
import type {Plugin} from '@cobalt-ui/core';

export default function myPlugin(): Plugin {
  let outDir: URL | undefined;
  return {
    name: 'my-plugin',
    config(config) {
      outDir = config.outDir; // read the user’s outDir from the config, and save it
      // return nothing to leave config unaltered
    },
    async build({tokens}) {
      console.log(outDir); // now config info is accessible within the build() function

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

`config()` will be fired after the user’s config has been fully loaded and all plugins are instantiated, but before any build happens.

## Cobalt token structure

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

## Examples

Examples of plugins may be found [in the original source repo](https://github.com/drwpow/cobalt-ui/tree/main/packages).
