---
title: Getting Started
layout: ../../../layouts/docs.astro
---

# Getting Started

Cobalt turns your [W3C design tokens](/docs/tokens) into code using a CLI or Node.js. Cobalt is configurable and pluggable, and can generate the following via [plugins](/docs/plugins):

- [CSS](/docs/plugins/css)
- [Sass](/docs/plugins/sass)
- [JS/TS/JSON](/docs/plugins/js)
- You can also make a [custom plugin](/docs/guides/plugins) to generate more!

## Introduction

Cobalt is tooling for the [W3C Community Group Design Tokens format][dt] which is **currently under development and rapidly changing**. You may be familiar with [Style Dictionary](https://amzn.github.io/style-dictionary/) which is an alternative design token system, but differs as it predates the new standard (that Cobalt uses). The new design tokens standard is the [largest collaborative format](https://github.com/design-tokens/community-group#companies-and-open-source-projects-represented-on-the-dtcg) to-date, involving input from Figma, Adobe, Salesforce, Google, and more to push the format forward.

Figma has a great video explaining what an exciting leap forward this is:

<div class="yt-embed">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/ssOdzxZdg58" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>

## Workflow

Starting with your design tokens (which will usually be in a program like Figma, or whatever you use to manage your design system), working with Cobalt involves the following steps:

1. Creating a `tokens.json` design tokens file
2. Installing Cobalt output plugins of your choice (e.g. JS, TS, CSS, and/or Sass)
3. Running the CLI to output all your desired formats
4. (Bonus) Adding Cobalt to CI to always keep your design system up-to-date

### 1. Creating the `tokens.json` file

This is the boring part—converting your tokens to JSON. Usually this involves manually pulling values from your styleguide or your design program (like Figma) and formatting the JSON yourself. There’s not a great UI for this yet (feel free to [suggest one](https://github.com/drwpow/cobalt-ui/issues) if you have one you like), but the Cobalt team is developing one currently.

Save these all to a `tokens.json` file like so:

```json
{
  "blue": {
    "60": {
      "$type": "color",
      "$value": "oklch(60% 0.216564 269)"
    }
  }
}
```

You can use the following token types (organizing them into any [Groups](/docs/tokens/#groups) you’d like) ([docs](/docs/tokens)):

- [Color](/docs/tokens/#color)
- [Dimension](/docs/tokens/#dimension)
- [Font Family](/docs/tokens/#font)
- [Font Weight](/docs/tokens/#font-weight)
- [Duration](/docs/tokens/#duration)
- [Cubic Bézier](/docs/tokens/#cubic-bezier)
- [Number](/docs/tokens/#number)
- [Link](/docs/tokens/#link)
- [Stroke style](/docs/tokens/#stroke-style)
- [Border](/docs/tokens/#border)
- [Transition](/docs/tokens/#transition)
- [Shadow](/docs/tokens/#shadow)
- [Gradient](/docs/tokens/#gradient)
- [Typography](/docs/tokens/#typography)

### 2. Installing Cobalt Plugins of your choice

> ℹ️ For this step, you’ll need [Node.js](https://nodejs.org) installed (v20 is recommended).

For this example, we’ll install the [JS](/docs/plugins/js), [Sass](/docs/plugins/sass), and [CSS](/docs/plugins/css) plugins, but skip any you don’t need (you can always install them later).

Run the following in a terminal, in the code project you’d like to generate code to:

```bash
npm i -D @cobalt-ui/plugin-js @cobalt-ui/plugin-css @cobalt-ui/plugin-sass
```

### 3. Running the CLI to output your desired formats

First install the CLI:

```bash
npm i -D @cobalt-ui/cli
```

Next, in the root of your code project, create a `tokens.config.mjs` file, importing the plugins you installed in the previous step:

<!-- prettier-ignore -->
```js
import pluginCSS from '@cobalt-ui/plugin-css';
import pluginJS from '@cobalt-ui/plugin-js';
import pluginSass from '@cobalt-ui/plugin-sass';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [
    pluginCSS(/* options */),
    pluginJS(/* options */),
    pluginSass(/* options */),
  ],
};
```

To learn more about the config file, see [config options](/docs/reference/config). To learn about plugin options, see [plugins](/docs/plugins).

Lastly, run the following command to generate all code from your tokens:

```bash
npx co build
```

This will output JS, CSS, and Sass in the `/tokens/` folder (which you can change in your config). It will also alert you of any errors in your schema.

### Next steps

- [Learn about tokens](/docs/tokens)
- [Sync with Figma using Tokens Studio](/docs/guides/tokens-studio)
- [Learn how to configure Cobalt](/docs/reference/config)
- [Add plugins](/docs/plugins)

[dt]: https://design-tokens.github.io/community-group/format/
