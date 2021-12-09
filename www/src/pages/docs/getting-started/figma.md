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
       'https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/MyFile?node-id=2%3A2': {
         'Blue':      {group: 'color', fill: ['default', 'light']},
       },
     },
   };
   ```

1. Run `npx cobalt sync` to update `tokens.yaml` with the new values

## Mapping

Give Cobalt a list of every Figma file you want to sync, along with components
and their properties, and Cobalt will do the rest! After the initial setup,
you’ll only have to edit mappings when adding or removing components.


### Colors

![](/images/figma-colors.png)

Say we have the following Components: Black, Dark Gray, Blue, Red, Green, Purple, and we even have a brand gradient called “Red Gradient.”

Here’s how we’d map that inside `cobalt.config.mjs`:

```js
export default {
  figma: {
    // “Share” > Copy link
    'https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/MyFile?node-id=2%3A2': {
      'Black':        {group: 'color', fill: ['default', 'light']},
      'Dark Gray':    {group: 'color', fill: ['default', 'light']},
      'Blue':         {group: 'color', fill: ['default', 'light']},
      'Red':          {group: 'color', fill: ['default', 'light']},
      'Green':        {group: 'color', fill: ['default', 'light']},
      'Purple':       {group: 'color', fill: ['default', 'light']},
      'Red Gradient': {group: 'color', fill: ['default', 'light']},
    },
  },
};
```

Take note of the following:

- Underneath our share URL, we’ve kept the name of each component exactly (even with capitalization).
- Each token has a group of `color`. So when these are saved, they’ll be saved as `color.Black`, `color.Dark_Gray`, `color.Blue`, etc.
- For each component, we wanted to save the [`fill` property](figma-api).
- Also for each component, we wanted to save that fill color to the `default` and `light` [modes]

### Typography

![](/images/figma-typography.png)

```js
export default {
  figma: {
    // “Share” > Copy link
    'https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/MyFile?node-id=2%3A2': {
      'Brand Sans':             {group: 'type',      name: 'family', fontFamily: ['default']},
      'Font / Body':            {group: 'type.size', name: 'body',   fontSize: ['default', 'm']},
      'Font / Body (Larger)':   {group: 'type.size', name: 'body',   fontSize: ['l']},
      'Font / Body (Largest)':  {group: 'type.size', name: 'body',   fontSize: ['xl']},
      'Font / Heading 1':       {group: 'type.size', name: 'h1',     fontSize: ['default']},
      'Font / Heading 2':       {group: 'type.size', name: 'h2',     fontSize: ['default']},
      'Font / Heading 3':       {group: 'type.size', name: 'h3',     fontSize: ['default']},
    },
  },
};
```

Here we’re doing a little more complex mapping for our typography, just as an example.

You can see that we have a `Brand Sans` component that signifies the font
family. And we have `Font / Size / *` components that help mapping.

Even though these are the names in the Figma file, say we want to shorten these
a little for code. We can do that! Probably the clearest explanation is looking
at what the final `tokens.yaml` will be:

```yaml
tokens:
  type:
    type: group
    tokens:
      family:
        default: Neue Montreal
      size:
        type: group
        modes:
          - xs
          - s
          - m
          - l
          - xl
        tokens:
          body:
            default: 16
            m: 16
            l: 18
            xl: 20
          heading1:
            default: 24
          heading2:
            default: 28
          heading3:
            default: 36
```

That cleaned up nicely!

### Icons

![](/images/figma-icons.png)

By adding a `file` key to each component, you can save the contents to a local
file. This is great for icons or graphics.

```js
export default {
  figma: {
    // “Share” > Copy link
    'https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/MyFile?node-id=2%3A2': {
      'download': {group: 'icon', file: './icons/download.svg'},
      'error':    {group: 'icon', file: './icons/error.svg'},
      'refresh':  {group: 'icon', file: './icons/refresh.svg'},
      'share':    {group: 'icon', file: './icons/share.svg'},
      'warning':  {group: 'icon', file: './icons/warning.svg'},
    },
  },
};
```

Note that the more icons you sync, the longer it may take to update your tokens.
But even if this takes a few minutes, it still beats having to download them all
manually.

### Other components

In `tokens.yaml` there’s no such thing as a “color token” or a “typography
token” or even an “icon token”—all that is for you to define! These are just
practical examples to teach you how common types map from Figma to
`tokens.yaml`. But because you can grab so many properties from components in
Figma, you can create your own token types and organize your system in a way
that best works for you.

If you’d like to see something supported within Figma that isn’t currently,
[please open a suggestion][issues].

## Troubleshooting

If you’re having trouble syncing from Figma, here are some quick tips:

- Every component must be located within the share link specified (if using shared components, **use the file they are defined in**, not a file that uses them).
- Every component should have a unique name within its own Figma doc (using the same name in different docs is OK)
- Make sure `cobalt.config.mjs` _perfectly_ matches your component name in Figma (watch for typos!)


[dotenv]: https://github.com/motdotla/dotenv
[env-system]: https://gist.github.com/iest/58692bf1001b0424c257
[issues]: https://github.com/drwpow/cobalt-ui/issues
[modes]: /concepts/modes
[figma-api]: /reference/config#figma
[figma-api-key]: https://www.figma.com/developers/api#access-tokens
