# 💎 Cobalt UI

Schemas and tools for managing design tokens.

## Getting started

Run:

```
npm i -D @cobalt-ui/cli
```

Add the following scripts to `package.json`:

```json
"scripts": {
  "cobalt:build": "cobalt build",
  "cobalt:dev": "cobalt build --watch",
  "cobalt:validate": "cobalt validate"
}
```

To build your tokens, run:

```
npm run cobalt:build
```

## Unofficial Examples

_Note: none of the following design token systems use Cobalt nor endorse Cobalt. These are merely examples of how one might translate them into Cobalt. All tokens and design systems © their respective owners._

- [Adobe Spectrum](./examples/adobe)
- [GitHub Primer](./examples/github)
- [IBM Carbon](./examples/ibm)

## Config

Create a `cobalt.config.mjs` file at the root of your project. Here you can add plugins to generate more outputs:

```js
export default {
  /** Set location of tokens YAML */
  tokens: './tokens.yaml',
  /** Set output directory */
  outDir: './tokens/',
  /** Add plugins */
  plugins: [
    // TS, Sass, JSON, etc.
  ],
};
```

In this example, running `npm run cobalt:build` will output your tokens in JSON, Sass, and TypeScript format.

## Plugins

- [CSS](./packages/plugin-css)
- [JSON](./packages/plugin-json)
- [Sass](./packages/plugin-sass)
- [TypeScript](./packages/plugin-ts)

## FAQ

#### Why YAML?

YAML is easy-to-read, and is a universal data format that almost every programming language can understand. Many design token systems are stored in JavaScript, which can be incredibly-limiting and can have impacts on tooling.

By relying on YAML instead of JavaScript, Cobalt’s internals are replaceable. Although this library uses Node.js at the moment, it doesn’t have to stick to Node.js forever. Using YAML means Cobalt can be completely rewritten and improved without affecting
users’ token systems.

Understandably, though, YAML isn’t easy to edit for everyone! That’s why the [Cobalt Editor](https://cobalt.pages.dev/editor) exists to help peole get started.

#### What does the name “Cobalt” mean?

The name ”cobalt” has several meanings. Historically, the blue pigment cobalt (along with ultramarine) has been one of the most elusive and rare colors in painting. But with the commodification of pigments and advancements in paint storage, cobalt is now
widely available to all, and in the process, revolutionized art. Blue pigment was the last “missing piece“ in paint colors. In a similar sense, having an easy-to-use system to manage tokens aims to be the “missing piece” to design management for
applications.

Secondly, cobalt is an element on the periodic table. It’s reflective of how design tokens are in a sense the “elements“ of a design system.
