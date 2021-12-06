---
title: Figma
layout: ../../../layouts/docs.astro
---

# Figma

## Setup

1. Generate a [new Figma API Key][figma-api-key]
1. Save this key as `FIGMA_API_KEY` in a [`.env` file][dotenv] …

   ```
   FIGMA_API_KEY=285541-dd09c1b4-c1d3-41a2-802b-f3866f0dadc1
   ```

   …or as an [environment variable in your system][env-system]

1. Add mappings in `cobalt.config.mjs` ([instructions](#mappings)):

   ```js
   export default {
     figma: {
       // “Share” > Copy link
       'https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/Cobalt-Test?node-id=2%3A2': {
         // Component name
         Blue: {
           // property: Cobalt ID
           fill: 'color.blue.default',
         },
         Green: {
           // property: Cobalt ID
           fill: 'color.green.default',
         },
         BodyFont: {
           // property: Cobalt ID
           text: 'type.family.body.default',
         },
       },
     },
   };
   ```

1. Run `npx cobalt sync` to update `tokens.yaml` with the new values

## Mappings

Cobalt gives you complete control over how you organize your Figma files. You can also pull from as many Figma files as needed. Here’s how to organize them.

### Properties

#### Fill

**Single Fill**

Say you have a component named `Purple`. Here’s how you’d get the fill:

<img src="/images/figma-fill.png" width="240">

```js
// cobalt.config.mjs
export default {
  figma: {
    'https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/Cobalt-Test?node-id=2%3A2': {
      Purple: { fill: 'color.purple.default' },
    },
  },
};
```

```diff
# tokens.yaml
  tokens:
+   group:
+     type: group
+     tokens:
+       purple:
+         type: token
+         value:
+           default: '#6A35D9'
```

**Multiple Fills**

Say you had a `BrandGradient` component that had multiple fills (e.g. layered gradients). Here’s how to extract that into tokens:

```js
// cobalt.config.mjs
export default {
  figma: {
    'https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/Cobalt-Test?node-id=2%3A2': {
      BrandGradient: { fills: ['color.brand_gradient_layer_1', 'color.brand_gradient_layer_2', 'color.brand_gradient_layer_3'] },
    },
  },
};
```

```diff
# tokens.yaml
  tokens:
+   group:
+     type: group
+     tokens:
+       brand_gradient_layer_1:
+         type: token
+         value:
+           default:
+       brand_gradient_layer_2:
+         type: token
+         value:
+           default:
+       brand_gradient_layer_3:
+         type: token
+         value:
+           default:
```

[dotenv]: https://github.com/motdotla/dotenv
[env-system]: https://gist.github.com/iest/58692bf1001b0424c257
[figma-api-key]: https://www.figma.com/developers/api#access-tokens
