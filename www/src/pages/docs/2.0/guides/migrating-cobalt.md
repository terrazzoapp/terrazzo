---
title: Migrating from Cobalt
layout: ../../../../layouts/docs.astro
---

# Migrating from Cobalt 1.0

Cobalt 2.0 [has been renamed Terrazzo.](/docs/reference/about) Same project, same maintainers, but an all-around improvement. In a nutshell:

- For **users**, upgrading should be easy. Some plugin output may differ slightly, but you won’t find huge sweeping changes (ideally you’ll get a lot of invisible fixes and improvements without even noticing!).
- For **plugin authors,** there are quite a few breaking changes and new features you’ll want to take advantage of to reduce code. Refer to [the new plugin API docs](/docs/reference/plugin-api) to learn how to upgrade your plugin.

Also, no—the next major release won’t be renamed again :)

## Upgrades

These aren’t breaking changes; just new features that warranted the breaking changes.

- **Improved wide gamut support**: While Cobalt supported all [Color Module 4](https://www.w3.org/TR/css-color-4/) color spaces like Display P3, it came with drawbacks and gotchas. Terrazzo’s improved color support lets you pick your tokens in any color, and it handles hardware requirements automatically based on the plugin.
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

If you were using `@cobalt-ui/core` or `@cobalt-ui/utils` those packages were deprecated. There aren’t 1:1 replacements, but here’s how to think about the new packages:

- `@terrazzo/parser` is now the [JS API](/docs/reference/js-api/) and runs in a browser, Node.js, or Bun
- `@terrazzo/cli` is a thin wrapper around the parser, and only provides quality of life improvements
- `@terrazzo/token-tools` is an improved version of `@cobalt-ui/utils`, and has most common utilities you need for building your own plugin
    - For example, take a look at the source code of the [CSS plugin](https://github.com/terrazzoapp/terrazzo/tree/main/packages/plugin-css)—more of the CSS operations are handled by `token-tools` than you may have realized!

## 2. Change CLI commands

The next step is replacing the `cobalt` / `co` commands with `terrazzo` or `tz`:

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

The new CLI commands only have a few changes, but see [the CLI docs](/docs/reference/cli) for more info.

## 3. Change to terrazzo.config.js

First, rename `tokens.config.js` → `terrazzo.config.js`.

Next, you can use the wrapper to fully type the config and provide helpful validation:

:::code-group

```diff [terrazzo.config.js]
+ import { defineConfig } from "@terrazzo/cli";

- export default {
+ export default defineConfig({
    // plugins, settings
- };
+ });
```

:::

See [the Config docs](/docs/reference/config/) for more info.

## 4. Rename modes to tzMode context

With the release of the [Resolver spec](https://www.designtokens.org/TR/2025.10/resolver/), contexts allow more advanced expression of alternate values. In plugins, this will usually mean updating options to refer to `tzMode`. For example, here’s how to update the CSS plugin:

:::code-group

```diff [terrazzo.config.mjs]
  import css from "@terrazzo/plugin-css";

  export default {
    plugins: [
      css({
-       modeSelectors: [
-         { selector: ":root", mode: "light" },
-         { selector: "@media (prefers-color-scheme: dark)", mode: "dark" },
+       contextSelectors: [
+         { selector: ":root", context: { tzMode: "light" } },
+         { selector: "@media (prefers-color-scheme: dark)", context: { tzMode: "dark" } },
        ],
      }),
    ],
  };
```

:::

This lets you incrementally upgrade from legacy modes to new contexts without having to update everything at once. `tzMode` was chosen as a context that won’t likely conflict with any other modifier name.

## 5. Update Plugin API (if managing your own custom plugin)

Plugins will need to update to [the new Plugin API](/docs/reference/plugin-api/) in order to run. The same basic format is kept, but the plugin hooks have changed and have more features to make working with tokens even easier (hopefully it empowers even better workflows while reducing code!). In a nutshell:

- There’s a new concept of calling `getTransform()` and `setTransform()` to “query” for tokens/modes. This is how plugins share more work than they could before!
- The [build() hook](/docs/reference/plugin-api/#build) still builds files, but you should move most of your work into [the new transform() hook](/docs/reference/plugin-api#api)
- The [new transform() hook](/docs/reference/plugin-api#api) is where you can calculate token values and expose them to other plugins (so long as they query the right `format`)
- The Linting API has been changed to be simpler and allow for throwing code errors on specific lines/columns.

See [the Plugin API docs](/docs/reference/plugin-api) for more detailed info.
