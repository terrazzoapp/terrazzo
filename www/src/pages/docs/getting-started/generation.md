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

Next, install the Cobalt CLI:

```
npm install --save-dev @cobalt-ui/cli
```

## Running

To generate your tokens, run:

```
npx cobalt build
```

That will generate a new `/tokens/` folder along with `tokens.json` inside it.

```diff
+ ├──── tokens/
+ │     └──── tokens.json
  ├──── tokens.json
  └──── package.json
```

## Next steps

JSON is just the default output, and you will likely require more than that. Fortunately, Cobalt can generate anything your project needs with [plugins][plugins]:

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
