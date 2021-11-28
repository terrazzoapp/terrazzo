---
title: Installation
layout: ../../layouts/docs.astro
---

# Installation

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
