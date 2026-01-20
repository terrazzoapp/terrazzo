---
title: 2.0 Migration
layout: ../../../../layouts/docs.astro
---

# Migrating to 2.x

Terrazzo was in version 0.x until the [stable release of DTCG](https://www.designtokens.org/). This guide facilitates the migration from 0.x → 2.x (1.x is Cobalt, so the version numbering continues).

## Config

Updating your config to 2.x:

1. Rename `terrazzo.config.js` → `terrazzo.config.ts` because 2.0 supports TypeScript configs!
2. Update your `lint` config to the [new rules](/linting/), as many rules have changed.

## Plugin API

For plugin authors, a few more changes are necessary. Plugins written in 0.x for the most part are forwards-compatible with the 2.x CLI, but won’t work for consumers using [resolvers](/guides/resolvers).

To add resolver functionality:

### Replace Modes with Contexts + Modifiers

In most plugins, modes are accessed via `getTransforms()` and `setTransform()`. You’ll need to replace `mode` with `context`, and add a `modifier`:

```diff
  transform({ setTransform, resolver }) {
+   const lightModifier = resolver.source.resolutionOrder.filter((m) => m.type === "modifier" && "light" in m.contexts)?.name || "tzMode";
    setTransform(id, {
      // …
-     mode: "light",
+     context: "light",
+     modifier: lightModifier,
    });
  }
```

In most examples, `mode` and `context` are equivalent. But the significant difference here is resolvers allow multiple “namespaces” of contexts via modifiers, so here, we have to do a little more work identifying which is the proper modifier namespace we want to set this in.

Other legacy plugins using modes will be upconverted to a special, internal `tzMode` modifier so that `mode` and `context` operate the same way. However, `tzMode` will never appear in any resolver context, so extra work may be needed if your plugin is trying to handle both 0.x and 2.x formats simultaneously (as in the example, you may want to have it be a fallback).

:::tip

`resolver.source.resolutionOrder` should always be used over `resolver.source.modifiers` for 2 reasons:

1. `resolver.source.modifiers` is optional—the modifier you want may not be present (it may be inlined in `resolutionOrder`).
2. `resolver.source.resolutionOrder` only contains **used** modifiers, so even if you did find a match in `resolver.source.modifiers`, it may actually be “dead code” that doesn’t affect the final token sets.

Further, everything is normalized, so you don’t have to bother resolving `$ref`s as the work is already done for you.

:::

#### getTransforms

`getTransforms()` has a minor breaking change: in 0.x, all modes would be returned automatically. But in 2.x, **modifiers and contexts must be explicitly asked for.**:

```diff
  build({ getTransforms, resolver }) {
+   const modifiers = [
+     ...resolver.source.resolutionOrder.filter((m) => m.type === "modifier"),
+     { "type": "modifier", "name": "tzMode" }, // query for legacy modes, if any
+   ];
-   getTransforms({
-     // …
-     mode: "light",
-   });
+   for (mod of modifiers) {
+     getTransforms({
+       // …
+       context: "light", // note: if context doesn’t exist, this will return empty array
+       modifier: mod.name,
+     });
+   }
  });
```

Neither modifier nor context accept glob patterns, and must be an exact match. This means more iteration will be required whenever you require more combinations.

The reason is complexity: in 0.x, legacy modes acted as a single modifier, so the amount of work was usually trivial to calculate everything. But in a resolver where there is no limit to the amount of modifiers, the amount of total work is exponentially increased, to the point calculating everything may be impractical. In some resolvers, this could result in 100× slowdown (or more!), and consumers likely will have many, many permutations they never want calculated.

This is not because resolvers aren’t efficient! On the contrary, they simply allow for more complexity in the system. So it’s a paradigm shift: plugins should only calculate the minimum necessary, and only calculate what has been explicitly asked for.

Also, to help backwards compatibility, **invalid contexts will silently return 0 tokens rather than throw an error.** So it’s safe in `getTransforms()` to ask modifiers for contexts they don’t have; they’ll just return 0 tokens (empty array) without throwing.

## Migrating from Cobalt 1.0

Cobalt 2.0 [has been renamed Terrazzo.](/docs/reference/about) Same project, same maintainers, but an all-around improvement. In a nutshell:

- For **users**, upgrading should be easy. Some plugin output may differ slightly, but you won’t find huge sweeping changes (ideally you’ll get a lot of invisible fixes and improvements without even noticing!).
- For **plugin authors,** there are quite a few breaking changes and new features you’ll want to take advantage of to reduce code. Refer to [the new plugin API docs](/docs/reference/plugin-api) to learn how to upgrade your plugin.

Also, no—the next major release won’t be renamed again :)

### Upgrades

These aren’t breaking changes; just new features that warranted the breaking changes.

- **Improved wide gamut support**: While Cobalt supported all [Color Module 4](https://www.w3.org/TR/css-color-4/) color spaces like Display P3, it came with drawbacks and gotchas. Terrazzo’s improved color support lets you pick your tokens in any color, and it handles hardware requirements automatically based on the plugin.
- **Plugin transform sharing**: Plugins can now share token transformations (e.g. the Sass plugin can now read the output from the CSS plugin).
- **Code frame errors**: now when you have an error in your `tokens.json` file, Terrazzo points to the exact spot that erred so the fix is easier. Linting plugins can also return code snippets in error messages as well.
- **Better parsing**: Terrazzo’s parser was overhauled to catch more mistakes while keeping performance fast.

### 1. Change packages

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

#### Internal packages

If you were using `@cobalt-ui/core` or `@cobalt-ui/utils` those packages were deprecated. There aren’t 1:1 replacements, but here’s how to think about the new packages:

- `@terrazzo/parser` is now the [JS API](/docs/reference/js-api/) and runs in a browser, Node.js, or Bun
- `@terrazzo/cli` is a thin wrapper around the parser, and only provides quality of life improvements
- `@terrazzo/token-tools` is an improved version of `@cobalt-ui/utils`, and has most common utilities you need for building your own plugin
  - For example, take a look at the source code of the [CSS plugin](https://github.com/terrazzoapp/terrazzo/tree/main/packages/plugin-css)—more of the CSS operations are handled by `token-tools` than you may have realized!

### 2. Change CLI commands

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

### 3. Change to terrazzo.config.ts

First, rename `tokens.config.js` → `terrazzo.config.ts`.

Next, you can use the wrapper to fully type the config and provide helpful validation:

:::code-group

```diff [terrazzo.config.ts]
+ import { defineConfig } from "@terrazzo/cli";

- export default {
+ export default defineConfig({
    // plugins, settings
- };
+ });
```

:::

See [the Config docs](/docs/reference/config/) for more info.

### 4. Rename modes to tzMode context

With the release of the [Resolver spec](https://www.designtokens.org/TR/2025.10/resolver/), contexts allow more advanced expression of alternate values. In plugins, this will usually mean updating options to refer to `tzMode`. For example, here’s how to update the CSS plugin:

:::code-group

```diff [terrazzo.config.ts]
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

### 5. Update Plugin API (if managing your own custom plugin)

Plugins will need to update to [the new Plugin API](/docs/reference/plugin-api/) in order to run. The same basic format is kept, but the plugin hooks have changed and have more features to make working with tokens even easier (hopefully it empowers even better workflows while reducing code!). In a nutshell:

- There’s a new concept of calling `getTransform()` and `setTransform()` to “query” for tokens/modes. This is how plugins share more work than they could before!
- The [build() hook](/docs/reference/plugin-api/#build) still builds files, but you should move most of your work into [the new transform() hook](/docs/reference/plugin-api#api)
- The [new transform() hook](/docs/reference/plugin-api#api) is where you can calculate token values and expose them to other plugins (so long as they query the right `format`)
- The Linting API has been changed to be simpler and allow for throwing code errors on specific lines/columns.

See [the Plugin API docs](/docs/reference/plugin-api) for more detailed info.
