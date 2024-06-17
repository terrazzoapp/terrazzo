---
title: Migrating from Cobalt
layout: ../../../layouts/docs.astro
---

# Migrating from Cobalt

Cobalt 2.0 has been renamed to the Terrazzo CLI ([_why?_](/docs/about)). Same project, same folks, same code, but an all-around improvement.

For **users**, upgrading should be easy. Some plugin output may differ slightly, but you won’t find huge sweeping changes (ideally you’ll get a lot of invisible fixes and improvements without even noticing!).

For **plugin authors,** there are quite a few breaking changes and new features you’ll want to take advantage of to reduce code. Refer to [the new plugin API docs](/docs/cli/api/plugin-development) to learn how to upgrade your plugin.

## Upgrades

These aren’t breaking changes; just new features that warranted the breaking changes.

- **Improved wide gamut support**: While Cobalt supported all [Color Module 4](https://www.w3.org/TR/css-color-4/) colorspaces like Display P3, it came with drawbacks and gotchas. Terrazzo’s improved color support lets you pick your tokens in any color, and it handles hardware requirements automatically based on the plugin.
- **Plugin transform sharing**: Plugins can now share token transformations (e.g. the Sass plugin can now read the output from the CSS plugin).
- **Code frame errors**: now when you have an error in your `tokens.json` file, Terrazzo points to the exact spot that erred so the fix is easier. Linting plugins can also return code snippets in error messages as well.
- **Better parsing**: Terrazzo’s parser was overhauled to catch more mistakes while keeping performance fast.

## 1. Change packages

The first step of migrating is replacing the `@cobalt-ui/` scope with `@terrazzo` in your `package.json` and reinstall:

:::code-group

```diff [package.json]
    "devDependencies": {
-     "@cobalt-ui/cli": "^1.x",
-     "@cobalt-ui/plugin-css": "^1.x",
-     "@cobalt-ui/plugin-js": "^1.x",
-     "@cobalt-ui/plugin-sass": "^1.x",
+     "@terrazzo/cli": "^2.x"
+     "@terrazzo/plugin-css": "^2.x"
+     "@terrazzo/plugin-js": "^2.x"
+     "@terrazzo/plugin-sass": "^2.x"
    }
```

:::

### Internal packages

If you were using `@cobalt-ui/core` or `@cobalt-ui/utils` those packages were deprecated. The new packages are `@terrazzo/parser` and `@terrazzo/token-tools` but are completely different. `@terrazzo/parser` is now the [JS API](/docs/cli/api/js/) and can run in any JS environment, even a browser, and `@terrazzo/cli` is just a thin wrapper around it (compared to Cobalt, where about half of the important work was done in `@cobalt-ui/cli` and comparatively less done in `@cobalt-ui/core`).

`@terrazzo/token-tools` will have more common utilities to make token operations easier, but doesn’t have any backwards-compatible tools from `@cobalt-ui/utils`. You can continue to use `@cobalt-ui/utils` for your own purposes if it has useful utilities, but it won’t be maintained going forward.

## 2. Change CLI commands

The next step is replacing the `cobalt` / `co` commands with `terrazzo` or `tz` commands:

:::code-group

```diff [package.json]
    "scripts": {
-     "build": "co build",
-     "dev": "co build --watch"
+     "build": "tz build",
+     "dev": "tz build --watch"
    }
```

:::

For the most part the CLI works exactly the same as it did before, but see [the new CLI docs](/docs/cli/) for more info.

## 3. Update tokens.config.js

First, rename `tokens.config.js` to `terrazzo.config.js`.

Next, you can use the wrapper to fully type the config and provide helpful validation:

:::code-block

```diff [terrazzo.config.js]
+ import { defineConfig } from "@terrazzo/cli";

- export default {
+ export default defineConfig({
    // plugins, settings
- };
+ });
```

:::

See [the Config docs](/docs/cli/config/) for more info.

## 4. Update Plugin API (if managing your own custom plugin)

Plugins will need to update to [the new Plugin API](/docs/cli/api/plugin-development/) in order to run. The same basic format is kept, but the plugin hooks have changed and have more features to make working with tokens even easier (hopefully it empowers even better workflows while reducing code!). In a nutshell:

- The [build() hook](/docs/cli/api/plugin-development/#build) still builds files, but you should move most of your work into [the new transform()` hook](/docs/cli/api/plugin-development#api)
- The [new `transform()` hook](/docs/cli/api/plugin-development#api) is where you can calculate token values and expose them to other plugins (so long as they query the right `format`)
- There are other minor changes such as:
  - Plugins used to get `tokens` as an array; now it’s an object keyed by token ID (use [Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries) to iterate over it)
  - The Linting API has been changed to be simpler and allow for throwing code errors on specific lines/columns.

See [the Plugin API docs](/docs/cli/api/plugin-development) for more detailed info.
