---
title: Getting Started
layout: ../../../layouts/docs.astro
---

# Getting Started

Cobalt turns your [W3C design tokens](/docs/tokens) into code. Cobalt is configurable and pluggable, and can generate the following via [plugins](/docs/plugins):

- [CSS](/docs/plugins/css)
- [Sass](/docs/plugins/sass)
- [JS/TS/JSON](/docs/plugins/js)
- You can also make a [custom plugin](/docs/guides/plugins) to generate more!

## Introduction

Cobalt is tooling for the [W3C Community Group Design Tokens format][dt] which is **currently under development and rapidly changing**. The general approach is similar to [Style Dictionary](https://amzn.github.io/style-dictionary/) or [Universal Design Tokens](https://github.com/universal-design-tokens/udt/blob/master/packages/spec/docs/README.md) to solve the problem of creating a single source of truth for design tokens that is platform-agnostic and easy to build tooling for.

The W3C Community Group’s approach differs in being the [largest collaborative format](https://github.com/design-tokens/community-group#companies-and-open-source-projects-represented-on-the-dtcg) to-date and seeks to improve on the existing prior art which were usually products of single entities. JSON is the chosen language of the token format because it’s ubiquitous, cross-platform, and is already at the heart of most APIs today.

## Requirements

- [Node.js](https://nodejs.org) v16 or higher (newer is always recommended).

## Install

Install the CLI:

```
npm i -D @cobalt-ui/cli
```

Install any plugins you’d like to use (_note: you must install at least one plugin to generate code_):

```
npm i -D @cobalt-ui/plugin-css @cobalt-ui/plugin-js @cobalt-ui/plugin-sass
```

## Building

Place your [tokens](/docs/tokens/) in a **tokens.json** file in the root of your project.

Create a **tokens.config.mjs** file also in the root of your project:

```js
import pluginCSS from '@cobalt-ui/plugin-css';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [pluginCSS()],
};
```

Run the following command (**co** being short for “Cobalt”):

```
npx co build
```

This will generate a **tokens/tokens.css** file in your project for you to use.

## Next steps

- [Learn about tokens](/docs/tokens)
- [Sync with Figma](/docs/guides/figma)
- [Learn how to configure Cobalt](/docs/reference/config)
- [Add plugins](/docs/plugins)

[dt]: https://design-tokens.github.io/community-group/format/
