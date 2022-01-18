---
title: Figma
layout: ../../../layouts/docs.astro
---

# Figma

## Setup

1. Start a new project with `npx co init`
2. Generate a [new Figma API Key][figma-api-key].
3. Save this key as `FIGMA_API_KEY` in a [`.env` file][dotenv].

   ```
   FIGMA_API_KEY=285541-dd09c1b4-c1d3-41a2-802b-f3866f0dadc1
   ```

   …or as an [environment variable in your system][env-system]

4. In your Figma Doc, click **Share**, then **Copy link**.
5. In `tokens.config.mjs`, under `figma`, paste your share link, and specify component names and properties within each link ([instructions](#mapping)):

```js
export default {
  figma: {
    /** docs to sync */
    docs: [
      {
        url: 'https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/MyFile?node-id=2%3A2', // “Share” > Copy link
        tokens: [
          { style: 'Blue', token: 'color.blue', type: 'color' },
          { component: 'Icon.Alert', token: 'icon.alert', type: 'file' },
        ],
      },
    ],
  },
};
```

6. Run `npx co sync` to update `tokens.json` with the new values

## Mapping

Give Cobalt a list of every Figma file you want to sync, along with components
and styles, and Cobalt will do the rest! After the initial setup, you’ll only
have to edit mappings when adding or removing components.

| Property               | Description                                                                    |
| :--------------------- | :----------------------------------------------------------------------------- |
| `style` \| `component` | Specify the name of a Figma style or component (must be one or the other)      |
| `type`                 | The [type][types] of token. Only a few types are supported (documented below). |
| `token`                | Where you’d like the token to live in `tokens.json`.                           |

### Colors / Gradient

![](/images/figma-colors.png)

| Type       | Effect                                                    |
| :--------- | :-------------------------------------------------------- |
| `color`    | Extract any **solid fills** from a style or component.    |
| `gradient` | Extract any **gradient fills** from a style or component. |

Use `type: "color"` or `type: "gradient"` to extract fills from a Figma style or component.

<!-- prettier-ignore -->
```js
export default {
  figma: {
    docs: [
      {
        url: "https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/MyFile?node-id=2%3A2", // “Share” > Copy link
        tokens: [
          { style: "Black",        token: "color.black",     type: "color" },
          { style: "Dark Gray",    token: "color.dark-gray", type: "color" },
          { style: "Blue",         token: "color.blue",      type: "color" },
          { style: "Red",          token: "color.red",       type: "color" },
          { style: "Green",        token: "color.green",     type: "color" },
          { style: "Purple",       token: "color.purple",    type: "color" },
          { style: "Red Gradient", token: "gradient.red",    type: "gradient" },
        ],
      },
    ],
  },
};
```

### File

![](/images/figma-icons.png)

By using `type: "file"` along with a `filename` path you can save a component locally or to a Git repo. This is great for icons.

<!-- prettier-ignore -->
```js
export default {
  figma: {
    docs: [
      {
        url: "https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/MyFile?node-id=2%3A2", // “Share” > Copy link
        tokens: [
          { component: "alert",    token: "icon.alert",    type: "file", filename: "./icons/alert.svg" },
          { component: "download", token: "icon.download", type: "file", filename: "./icons/download.svg" },
          { component: "refresh",  token: "icon.refresh",  type: "file", filename: "./icons/refresh.svg" },
        ],
      },
    ],
  },
};
```

Note that the more icons you sync, the longer it may take to update your tokens. But even if this takes a few minutes, it still beats having to download them all manually.

#### Optimization

Sometimes you’ll find Figma exports needing a little cleanup. By adding the `figma.optimize` option, you can run optimizers over the downloaded files:

```js
export default {
  figma: {
    docs: [
      {
        url: 'https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/MyFile?node-id=2%3A2',
        tokens: [{ component: 'alert', token: 'icon.alert', type: 'file', filename: './icons/alert.svg' }],
      },
    ],
    optimize: {
      svgo: {
        // SVGO options (to use defaults, leave object empty or set svgo: true)
        removeTitle: false,
      },
    },
  },
};
```

To disable optimizers, either omit them from the config, or set them to `false`.

##### Supported optimizers

- [SVGO](https://github.com/svg/svgo)
- Images coming soon?

##### Token overrides

If the default optimization settings are messing up a few tokens, you can override them by adding the same `optimize` settings on an individual token itself. This will override any defaults. Or, you may disable optimization by setting `optimize: false` or `optimize.svgo: false` on an individual token to skip optimization just for that token.

### Shadow

To pull a **Drop Shadow** from Figma, use the `shadow` type.

<!-- prettier-ignore -->
```js
export default {
  figma: {
    docs: [
      {
        url: "https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/MyFile?node-id=2%3A2", // “Share” > Copy link
        tokens: [
          { style: 'Distance / Medium', token: 'shadow.distance-medium', type: 'shadow' },
          { style: 'Distance / Far',    token: 'shadow.distance-far',    type: 'shadow' },
        ],
      },
    ],
  },
};
```

### Typography

![](/images/figma-typography.png)

To extract a **Text Style** from Figma, use the `font` or `typography` type.

| Type         | Effect                                                       |
| :----------- | :----------------------------------------------------------- |
| `font`       | Extract only the font family name from a style or component. |
| `typography` | Extract all text styles from a style or component.           |

<!-- prettier-ignore -->
```js
export default {
  figma: {
    docs: [
      {
        url: "https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/MyFile?node-id=2%3A2", // “Share” > Copy link
        tokens: [
          { style: "Brand Sans",                  token: "typography.family.brand-sans", type: "font" },
          { style: "Typography / Body",           token: "typography.body",              type: "typography" },
          { style: "Typography / Heading 1",      token: "typography.heading-1",         type: "typography" },
          { style: "Typography / Heading 2",      token: "typography.heading-2",         type: "typography" },
        ],
      },
    ],
  },
};
```

## Troubleshooting

If you’re having trouble syncing from Figma, here are some quick tips:

- Make sure you are trying to extract a **style** or **component**. Normal layers aren’t supported for extraction.
- Every style/component must be located within the share link specified (if using shared components, **use the file they are defined in**, not _a_ file that uses them).
- Every style/component should have a unique name within its own Figma doc (using the same name in different docs is OK)
- Make sure `tokens.config.mjs` _perfectly_ matches your component name in Figma (watch for typos!)

[alias]: /reference/schema#aliasing
[dotenv]: https://github.com/motdotla/dotenv
[env-system]: https://gist.github.com/iest/58692bf1001b0424c257
[issues]: https://github.com/drwpow/cobalt-ui/issues
[modes]: /concepts/modes
[figma-api]: /reference/config#figma
[figma-api-key]: https://www.figma.com/developers/api#access-tokens
[types]: /reference/schema#types
