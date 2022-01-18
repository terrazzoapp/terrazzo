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
npm install --save-dev @cobalt-ui/cli @cobalt-ui/plugin-css @cobalt-ui/plugin-ts @cobalt-ui/plugin-json
```

And lastly, create a `tokens.config.mjs` file in the root of your project, initializing these plugins:

```js
import pluginTS from '@cobalt-ui/plugin-ts';
import pluginCSS from '@cobalt-ui/plugin-css';
import pluginJSON from '@cobalt-ui/plugin-json';

export default {
  plugins: [pluginTS(), pluginCSS(), pluginJSON()],
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

Learn more about the existing plugins and [view documentation][plugins]:

- **CSS**: [@cobalt-ui/plugin-css][plugin-css]
- **JSON**: [@cobalt-ui/plugin-json][plugin-json]
- **Sass**: [@cobalt-ui/plugin-sass][plugin-sass]
- **TypeScript**: [@cobalt-ui/plugin-ts][plugin-ts]

[tokens.json]: /docs/getting/started
[plugins]: /docs/plugins
[plugin-css]: /docs/plugins/css
[plugin-json]: /docs/plugins/json
[plugin-sass]: /docs/plugins/sass
[plugin-ts]: /docs/plugins/ts
