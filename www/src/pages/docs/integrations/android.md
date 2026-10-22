---
title: Android
layout: ../../../layouts/docs.astro
---

# Android

Generate Jetpack Compose code from DTCG tokens.

:::warning

This plugin is still **experimental**. If you have suggestions, or would like to contribute, please open an issue or say “hi” in Discord!

:::

## Setup

Requires [Node.js](https://nodejs.org). With that installed, and a `package.json`, run:

```sh
npm i -D @terrazzo/cli @terrazzo/plugin-android
```

Add a `terrazzo.config.ts` to the root of your project with:

```ts
import { defineConfig } from "@terrazzo/cli";
import android from "@terrazzo/plugin-android";

export default defineConfig({
  outDir: "./app/src/main/java/com/example/tokens/",
  plugins: [
    android({
      packageName: "com.example.tokens",
      objectName: "Tokens",
    }),
  ],
});
```

Lastly, run:

```sh
npx tz build
```

And you’ll see a `Tokens.kt` file generated in your project, with an interface of Jetpack Compose `Color` values and a `TokensLight` object that implements it. If your [resolver](/docs/guides/resolvers) has a `theme` modifier with a `dark` context, a `TokensDark` object is generated too, so you can pick one at runtime:

```kotlin
val tokens: Tokens = if (isSystemInDarkTheme()) TokensDark else TokensLight

Box(Modifier.background(tokens.colorPrimitiveBlue9))
```

Colors are written in Display P3, so wide-gamut tokens keep their full range. Token IDs become camelCase properties (`color.primitive.blue.9` → `colorPrimitiveBlue9`). Only `color` tokens are supported for now.

## Light and dark

By default, `TokensLight` is built from the resolver input `{ theme: "light" }` and `TokensDark` from `{ theme: "dark" }`, the same light and dark that Compose’s `isSystemInDarkTheme()` switches between. If your modifier or its contexts are named differently, or your resolver has other modifiers as well, pass the inputs yourself:

```ts
android({
  light: { mode: "light", brand: "acme" },
  dark: { mode: "dark", brand: "acme" },
});
```

Without a resolver, or without a matching modifier, the plugin falls back to `$extensions.mode`: `TokensLight` from each token’s `$value`, and `TokensDark` from its `dark` mode. Modes are deprecated in favor of resolvers, so prefer a resolver for new projects.

## Options

| Name          | Type            | Description                                                                                                         |
| :------------ | :-------------- | :------------------------------------------------------------------------------------------------------------------ |
| `packageName` | `string`        | Kotlin package for the generated file. Left out of the file if not set.                                             |
| `objectName`  | `string`        | Name of the interface, the prefix of its light and dark objects, and the filename. Default: `"Tokens"`.             |
| `light`       | `ResolverInput` | Resolver input for the light object. Default: `{ theme: "light" }`.                                                 |
| `dark`        | `ResolverInput` | Resolver input for the dark object. Without a valid one, no dark object is generated. Default: `{ theme: "dark" }`. |
