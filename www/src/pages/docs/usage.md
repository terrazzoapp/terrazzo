---
title: Usage
layout: ../../layouts/docs.astro
---

# Usage

Since Cobalt is a generator for _your_ design system and no one else’s, it does take some configuration. Once [tokens.yaml] has been created and saved in the project, you’re ready to start using Cobalt.

## Setup

Setup requires the following:

- [Node.js installed](https://nodejs.org) (Ideally v16 or later)

## Installing

To install Cobalt, open your favorite terminal app and navigate to your project where `tokens.yaml` lives:

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
  ├──── tokens.yaml
  └──── package.json
```

Of course, JSON is just the default output. Cobalt can do so much more with [plugins][plugins].

[tokens.yaml]: /docs/schema
[plugins]: /docs/plugins
