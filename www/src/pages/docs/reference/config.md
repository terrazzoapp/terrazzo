---
title: Config
layout: ../../../layouts/docs.astro
---

# Config

Customizing Cobalt and managing plugins requires you to add a `cobalt.config.mjs` file in the root of your project. Here’s an example configuration with all settings and defaults:

```js
import json from '@cobalt-ui/plugin-json';

export default {
  tokens: './tokens.yaml',
  outDir: './tokens/',
  figma: {
    // figma settings
  },
  plugins: [json()],
};
```

## Figma

`figma` is an object that takes Figma document URLs as keys, and inside each, a mapping of Figma components to tokens within `tokens.yaml`. For a walkthrough of how to connect this to Figma, [read the Figma guide](/getting-started/figma).

For all the settings, see below:

### Share URLs

The key within the `figma` object are Share URLs (found by clicking **Share** > **Copy Link** from any Figma document). You can specify as many as you’d like to sync:


```js
export default {
  figma: {
    'https://figma.com/file/[hash]/File1?node-id=1%3A1': {
      // tokens from File 1
    },
    'https://figma.com/file/[hash]/File1?node-id=1%3A1': {
      // tokens from File 2
    },
    'https://figma.com/file/[hash]/File3?node-id=1%3A1': {
      // tokens from File 3
    },
    // …
  },
}
```

Inside each, you’ll pass another object that map components to tokens in `tokens.yaml`.

### Components

Here are all the properties you can collect from Figma components:

```js
export default {
  figma: {
    'https://figma.com/file/[hash]/File1?node-id=1%3A1': {
      // component name — must match Figma
      'Component Name': {
        // metadata
        group: 'group.subgroup',   // group this token goes in (required)
        name: 'my_component',      // (optional) rename component (omit to keep name as-is)

        // color
        fill: ['mode1', 'mode2'],  // (optional) save Fill to modes "mode1" and "mode2"
        stroke: ['default'],       // (optional) save Stroke to the "default" mode

        // typography
        fontFamily: ['default'],   // (optional) save font family
        fontSize:   ['default'],   // (optional) save font size
        fontStyle:  ['default'],   // (optional) save font style
        fontWeight: ['default'],   // (optional) save font weight

        // files
        file: './my-file.svg',     // (optional) save this component as a local file
      },
    },
  }
};
```

## Plugins

Each plugin comes with its own rules and setup. Follow the corresponding plugin guide to enable code generation:

👉 **[View plugins](/docs/plugins)**
