---
title: Cobalt CLI
---

# CLI

The Cobalt CLI is the primary way to turn your Design Token Format Module (DTFM) design tokens into code. To install it to your project, run:

```sh
npm i -D @cobalt-ui/cli
```

## Build

Most of the time you’ll be running the **build** command:

```sh
npx co build
```

This first **validates** your schema (and will error on any schema errors), then it generates code using your installed [plugins](/guides/getting-started#next-steps).

::: info
If you end up with stale assets in `outDir` from old tokens or plugins no longer used, there’s not an option to clear out this directory on build (Cobalt doesn’t assume it owns this folder). However, there are easy-to-use tools such as [del-cli](https://www.npmjs.com/package/del-cli) you can run before each build.
:::

### Watch mode

To build your tokens as you work, add the `--watch` flag:

```sh
npx co build --watch
```

This watches for any changes in your `tokens.json` file, and automatically runs a build on any change. Useful for developing locally!

## Validate

To only validate your `tokens.json` schema without loading plugins, run the **check** command:

```sh
npx co check [path]
```

This will show any errors and warnings in your schema. `[path]` can be ommitted if you only want to validate the file(s) set to [`token`](/advanced/config#token) in your [config file](/advanced/config).

## Bundle

To combine multiple `tokens.json` files into one, use the `bundle` command:

```sh
npx co bundle --out [path]
```

Be sure to specify a `[path]`!

## Convert

The **convert** comand is useful for converting a foreign format to DTFM. Currently only converting from the [Style Dictionary token format](https://amzn.github.io/style-dictionary) format is supported.

### Style Dictionary Format

To convert from the [Style Dictionary token format](https://amzn.github.io/style-dictionary) to DTFM, run:

```sh
npx co convert [input] --out [output]
```

[See full guide](/integrations/style-dictionary)

## Init

You can initialize a placeholder `tokens.json` file with the **init** command:

```sh
npx co init
```

There’s not much here, but it can at least save a little typing.
