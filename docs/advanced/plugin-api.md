---
title: Cobalt Plugin API
---

# Plugin API

Creating your own Cobalt plugins is easy if you’re comfortable with JavaScript. This guide is for creating a custom plugin yourself; if you’re looking for instructions on how to use existing plugins, [see the Getting Started guide](/guides/getting-started#next-steps).

## Plugin Format

A Cobalt plugin is designed similarly to a [Rollup](https://rollupjs.org/plugin-development/) or [Vite plugin](https://vitejs.dev/guide/api-plugin), if you’re familiar with those (no worries if you’re not). A plugin is essentially **any function that returns an object with the following keys**:

| Key             |    Type    | Description                                                        |
| :-------------- | :--------: | :----------------------------------------------------------------- |
| `name`          |  `string`  | **Required.** The name of your plugin (shown on errors)            |
| `config`        | `function` | (Optional) Read the user’s config, and optionally modify it.       |
| `registerRules` | `string[]` | If running `lint()`, register the rules this plugin should handle. |
| `lint`          | `function` | Lint tokens and throw errors.                                      |
| `build`         | `function` | The build output of your plugin.                                   |

_Note: the following examples will be using TypeScript, but JavaScript will work just as well if you prefer!_

```ts
import type { Plugin } from "@cobalt-ui/core";

export default function myPlugin(): Plugin {
  return {
    name: "my-plugin",
    config(config) {
      // read final user config
    },
    async build({ tokens, metadata, rawSchema }) {
      // (your plugin code here)

      return [
        {
          filename: "my-filename.json",
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
import type { Plugin } from "@cobalt-ui/core";

export interface MyPluginOptions {
  /** (Optional) Set the output filename */
  filename?: string;
  // add more options here!
}

export default function myPlugin(options: MyPluginOptions = {}): Plugin {
  const filename = options.filename || "default-filename.json"; // be sure to always set a default!
  return {
    name: "my-plugin",
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
import myPlugin from "./my-plugin.js";

/** @type {import("@cobalt-ui/core").Config} */
export default {
  plugins: [
    myPlugin({
      filename: "custom.json",
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
  id: "color.brand.green", // the full ID of the token
  $type: "color", // the original $type
  $value: "#40c362", // the normalized $value
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

2. **config()**: called on every plugin (if present), also in array order. Note that if any plugin modifies the config, the changes will only be picked up by plugins that appear later in the array.
3. **registerRules()**: if a plugin is linting output, register the lint rules this plugin handles.
4. **lint()**: also if a plugin is linting output, execute the registered lint rules and report results.
5. **build()**: called on every plugin, in parallel, and the end result is written to disk.

::: info

In an [upcoming release](https://github.com/terrazzoapp/terrazzo/issues/201), Cobalt will add more stages to building so plugins can “chain” and work off one another.

:::

### `config()`

The `config()` function is an optional callback that can read the final user config or modify it. Use it if you need to read a user’s setting. Though you _can_ mutate the config, don’t do so unless absolutely necessary!

```ts
import type { Plugin } from "@cobalt-ui/core";

export default function myPlugin(): Plugin {
  let outDir: URL | undefined;
  return {
    name: "my-plugin",
    config(config) {
      outDir = config.outDir; // read the user’s outDir from the config, and save it
      // return nothing to leave config unaltered
    },
    async build({ tokens, rawSchema }) {
      console.log(outDir); // now config info is accessible within the build() function

      // (your plugin code here)

      return [{ filename: "my-filename.json", contents: tokens }];
    },
  };
}
```

`config()` will be fired _after_ the user’s config has been fully loaded and all plugins are instantiated, and _before_ any build happens.

### `registerRules()`

If this plugin wants to lint the user’s output, register the rules your plugin wants to control. It’s recommended to namespace with a slash, like so: `[my-plugin]/rule`.

```ts
const RULES = {
  ["enforce-kebab-case"]: "my-plugin/enforce-kebab-case",
  ["use-color-module-4-colors"]: "my-plugin/use-color-module-4-colors",
};

export default function myPlugin(): Plugin {
  return {
    name: "my-plugin",
    registerRules({}) {
      return [
        {
          id: RULES["enforce-kebab-case"],
          severity: "error", // default severity, unless user overrides it
        },
        {
          id: RULES["use-color-module-4-colors"],
          severity: "error",
        },
      ];
    },
  };
}
```

If a plugin hasn’t registered a rule, it won’t be notified of it in the next stage.

### `lint()`

If this plugin has registered rules, it’ll be returned in this stage:

```ts
import { type LintNotice } from "@cobalt-ui/core";

const RULES = {
  ["enforce-kebab-case"]: "my-plugin/enforce-kebab-case",
  ["use-color-module-4-colors"]: "my-plugin/use-color-module-4-colors",
};

export default function myPlugin(): Plugin {
  return {
    name: "my-plugin",
    lint({ tokens, rules }) {
      const notices: LintNotice = [];

      for (const rule of rules) {
        if (rule.severity === "off") {
          continue;
        }
        switch (rule.id) {
          case RULES["enforce-kebab-case"]: {
            const failedKebabCaseIDs = myKebabCaseFunction(tokens);
            if (failedKebabCaseIDs.length) {
              notices.push(...failedKebabCaseIDs.map((id) => ({ id: RULES["enforce-kebab-case"], message: `Token IDs must be in kebab-case; found "${id}"` })));
            }
            break;
          }
          case RULES["use-color-module-4-colors"]: {
            const failedColorModule4Colors = myColorModule4Function(tokens);
            if (failedColorModule4Colors.length) {
              notices.push(
                ...failedColorModule4Colors.map(({ id, value }) => ({
                  id: RULES["use-color-module-4-colors"],
                  message: `Colors must use the CSS Module 4 function \`color(…)\`, ${id} uses ${value}`,
                })),
              );
            }
            break;
          }
        }
      }

      return notices;
    },
  };
}
```

::: tip

Cobalt **WILL** handle severity for you, so there’s no need to check `rule.severity` for errors or warnings. When sending `notices` back, **report any and all failures**, and Cobalt will err or warn appropriately based on the user’s settings.

`rule.severity` is mostly there so you can check for `"off"`, so your plugin can skip work and the linter can run faster.

:::

::: warning

Cobalt **WON’T** handle defaults for you; it will only provide the user’s lint rules. It’s up to you to handle missing values and provide defaults for your plugin.

:::

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
    name: "my-plugin",
    async build({ tokens, rawSchema }) {
      // (your plugin code here)

      return [
        { filename: "./output-1.json", contents: jsonContents },
        { filename: "./output-2.svg", contents: svgContents },
      ];
    },
  };
}
```

## Testing

To test your plugin working on your design tokens, add it to your `tokens.config.mjs`:

```js
import myPlugin from "./my-plugin.js";

/** @type {import("@cobalt-ui/core").Config} */
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

Examples of plugins may be found [in the original source repo](https://github.com/terrazzoapp/terrazzo/tree/1.x/packages).
