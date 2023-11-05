# @cobalt-ui/plugin-sass

Generate `.scss` and `.sass` from your Design Tokens Format Module (DTFM) tokens.

**Features**

- ✅ Supports all features of the [CSS plugin](https://cobalt-ui.pages.dev/integrations/css)
- ✅ Strong typechecking with Sass to never have broken styles

## Setup

Install the plugin (and its dependency) from npm:

```bash
npm i -D @cobalt-ui/plugin-sass @cobalt-ui/plugin-css
```

Then add to your `tokens.config.mjs` file:

```js
// tokens.config.mjs
import pluginSass from '@cobalt-ui/plugin-sass';

/** @type import('@cobalt-ui/core').Config */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [pluginSass()],
};
```

And run:

```sh
npx co build
```

You’ll then generate a `./tokens/index.scss` file that exports a `token()` function you can use to grab tokens:

```scss
@use '../tokens' as *; // update '../tokens' to match your location of tokens/index.scss

.heading {
  color: token('color.blue');
  font-size: token('typography.size.xxl');
}
```

## Docs

[View the full documentation](https://cobalt-ui.pages.dev/integrations/sass)
