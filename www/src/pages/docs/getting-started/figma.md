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

1. In your Figma Doc, click **Share**, then **Copy link**
1. In `cobalt.config.mjs`, under `figma`, paste your share link, and specify component names and properties within each link ([instructions](#mapping)):

   ```js
   export default {
     figma: {
       // “Share” > Copy link
       "https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/MyFile?node-id=2%3A2": [
         { style: "Blue",           token: "color.blue", type: "color" },
         { component: "Icon.Alert", token: "icon.alert", type: "file" },
       ],
     },
   };
   ```

1. Run `npx cobalt sync` to update `tokens.yaml` with the new values

## Mapping

Give Cobalt a list of every Figma file you want to sync, along with components
and styles, and Cobalt will do the rest! After the initial setup, you’ll only
have to edit mappings when adding or removing components.

| Property               | Description                                                               |
| :--------------------- | :------------------------------------------------------------------------ |
| `style` \| `component` | Specify the name of a Figma style or component (must be one or the other) |
| `type`                 | The [type][types] of token such as `color` or `font` ([full list][types]) |
| `token`                | Where you’d like the token to live in `tokens.yaml`.                      |

The `type` is the most important part to understand; it’s what pulls the values
out of Figma. For example, `type: "color"` and `type: "linear-gradient"` extract
**Fill**. `type: "font"` will extract **Text Properties.**

### Colors

![](/images/figma-colors.png)

Say you have colors saved as styles: a few colors such as Black and Dark Gray,
and a brand gradient called “Red Gradient.” Here’s how we’d map that inside
`cobalt.config.mjs`:

<!-- prettier-ignore -->
```js
export default {
  figma: {
    // “Share” > Copy link
    "https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/MyFile?node-id=2%3A2": [
      { style: "Black",        token: "color.black",     type: "color" },
      { style: "Dark Gray",    token: "color.dark_gray", type: "color" },
      { style: "Blue",         token: "color.blue",      type: "color" },
      { style: "Red",          token: "color.red",       type: "color" },
      { style: "Green",        token: "color.green",     type: "color" },
      { style: "Purple",       token: "color.purple",    type: "color" },
      { style: "Red Gradient", token: "gradient.red",    type: "linear-gradient" },
    ],
  },
};
```

### Typography

![](/images/figma-typography.png)

You can also extract multiple values from the same style or component. Simply specify it again with a different `"type"`:

<!-- prettier-ignore -->
```js
export default {
  figma: {
    // “Share” > Copy link
    "https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/MyFile?node-id=2%3A2": [
      { style: "Brand Sans",            token: "font.family.brand_sans", type: "font" },
      { style: "Brand Sans",            token: "font.size.body",         type: "dimension" },
      { style: "Font / Body (Larger)",  token: "font.size.body_larger",  type: "dimension" },
      { style: "Font / Body (Largest)", token: "font.size.body_largest", type: "dimension" },
      { style: "Font / Heading 1",      token: "font.size.h1",           type: "dimension" },
      { style: "Font / Heading 2",      token: "font.size.h2",           type: "dimension" },
      { style: "Font / Heading 3",      token: "font.size.h3",           type: "dimension" },
    ]
  },
};
```

Here we’re doing a little more complex mapping for our typography, just as an example.

You can see that we have a `Brand Sans` component that signifies the font family. And we have `Font / Size / *` components that help mapping.

Even though these are the names in the Figma file, say we want to shorten these a little for code. We can do that! Probably the clearest explanation is looking at what the final `tokens.yaml` will be:

```yaml
tokens:
  font:
    family:
      type: font
      default: Neue Montreal
    size:
      body:
        type: dimension
        value: 16px
      body_larger:
        type: dimension
        value: 18px
      body_largest:
        type: dimension
        value: 20px
      heading1:
        type: dimension
        value: 24px
      heading2:
        type: dimension
        value: 28px
      heading3:
        type: dimension
        value: 36px
```

That cleaned up nicely!

### Icons

![](/images/figma-icons.png)

By adding a `file` key to each component, you can save the contents to a local file. This is great for icons or graphics.

<!-- prettier-ignore -->
```js
export default {
  figma: {
    // “Share” > Copy link
    "https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/MyFile?node-id=2%3A2": [
      { component: "download", token: "icon.download", type: "file", file: "./icons/download.svg" },
      { component: "error",    token: "icon.error",    type: "file", file: "./icons/error.svg" },
      { component: "refresh",  token: "icon.refresh",  type: "file", file: "./icons/refresh.svg" },
      { component: "share",    token: "icon.share",    type: "file", file: "./icons/share.svg" },
      { component: "warning",  token: "icon.warning",  type: "file", file: "./icons/warning.svg" },
    ],
  },
};
```

Note that the more icons you sync, the longer it may take to update your tokens. But even if this takes a few minutes, it still beats having to download them all manually.

## Aliases

At some point you’ll want to reuse values, or give values aliases. Note that the Figma mapping is always 1:1 with values in `tokens.yaml` and you can’t reuse components or styles for other values. You can either create another component or style in Figma
and map that, or you can use an [alias] like so ([see full documentation][alias]):

```yaml
tokens:
  color:
    red:
      type: color
      value: "#cf222e"
    yellow:
      type: color
      value: "#eac54f"
    error:
      type: color
      value: $color.red
    yellow:
      type: color
      value: $color.yellow
```

## Troubleshooting

If you’re having trouble syncing from Figma, here are some quick tips:

- Every component must be located within the share link specified (if using shared components, **use the file they are defined in**, not a file that uses them).
- Every component should have a unique name within its own Figma doc (using the same name in different docs is OK)
- Make sure `cobalt.config.mjs` _perfectly_ matches your component name in Figma (watch for typos!)

[alias]: /reference/schema#aliasing
[dotenv]: https://github.com/motdotla/dotenv
[env-system]: https://gist.github.com/iest/58692bf1001b0424c257
[issues]: https://github.com/drwpow/cobalt-ui/issues
[modes]: /concepts/modes
[figma-api]: /reference/config#figma
[figma-api-key]: https://www.figma.com/developers/api#access-tokens
[types]: /reference/schema#types
