---
title: Generation
layout: ../../../layouts/docs.astro
---

# Generation

With your [tokens.json] populated, you’re now ready to start generating code from your tokens.

## Prerequisites

Setup requires the following:

- [Node.js installed](https://nodejs.org) (Ideally v16 or later)

## Installing

Open your favorite terminal app and navigate to your project where `tokens.json` lives:

```
cd ~/path/to/my/tokens
```

If there’s a `package.json` file in the root of your project already, you can leave it. If not, copy and paste the following into that file and save it:

```json
{
  "dependencies": {},
  "devDependencies": {}
}
```

Next, install the Cobalt CLI and a few plugins:

```
npm install --save-dev @cobalt-ui/cli @cobalt-ui/plugin-css @cobalt-ui/plugin-js
```

And lastly, create a `tokens.config.mjs` file in the root of your project, initializing these plugins:

```js
import pluginCSS from '@cobalt-ui/plugin-css';
import pluginJS from '@cobalt-ui/plugin-js';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [pluginCSS(), pluginJS()],
};
```

## Running

To generate your tokens, run:

```
npx co build
```

That will generate a new `/tokens/` folder along with one output per plugin:

```diff
+ ├──── tokens/
+ │     ├──── tokens.css
+ │     ├──── tokens.json
+ │     └──── tokens.ts
  ├──── tokens.json
  └──── package.json
```

## Next steps

Learn more about the existing plugins and [view documentation](/docs/integrations)

- **CSS**: [@cobalt-ui/plugin-css](/docs/integrations/css)
- **JS/TS/JSON**: [@cobalt-ui/plugin-js](/docs/integrations/js)
- **Sass**: [@cobalt-ui/plugin-sass](/docs/integrations/sass)
