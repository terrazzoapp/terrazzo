# ⛋ @terrazzo/cli

The Terrazzo CLI takes DTCG design tokens and generates code using plugins (e.g. [CSS](../plugin-css/), [Sass](../plugin-sass/), [JS/TS](../plugin-js/), and more). You can either run the Terrazzo CLI manually, or as part of your <abbr title="Continuous Integration">CI</abbr> process.

> [!TIP]
> Migrating from Cobalt? Check out the [Migration Guide](/docs/cli/migrating)

## Quickstart

First, install the package using your package manager of choice:

```sh
npm i -D @terrazzo/cli
```

And you can create a configuration and install plugins with the `init` command:

```sh
npx tz init
```

This will create a `terrazzo.config.js` starter config file, and even start your token system from a popular open source design system.

[Full documentation](https://terrazzo.app/docs/cli)
