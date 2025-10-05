---
title: Token Listing
layout: ../../../../layouts/docs.astro
---

# Token Listing

Produce a Token Listing Format file for your design token build. The Token Listing Format is used by design token tool makers to understand the relationship between your source design tokens and your style files built in Terrazzo.



## Setup

Requires [Node.js 20 or later](https://nodejs.org) and [the CLI installed](https://terrazzo.app/docs/cli). With both installed, run:

:::code-group

```sh [npm]
npm i -D @terrazzo/cli @terrazzo/plugin-token-listing
```

```sh [pnpm]
pnpm i -D @terrazzo/cli @terrazzo/plugin-token-listing
```

```sh [bun]
bun i -D @terrazzo/cli @terrazzo/plugin-token-listing
```

:::

And add it to `terrazzo.config.js` under `plugins`:


:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import listing from "@terrazzo/plugin-token-listing";

export default defineConfig({
  outDir: "./tokens/",
  plugins: [
    // Include at least one plugin to build tokens
    css({
      filename: "tokens.css",
    }),

    // Configure the token listing
    listing({
      filename: 'tokens.listing.json',
      // Pass mode information so documentation tools can generate mode selectors
      modes: [
        {
          name: 'color-scheme',
          values: ['light', 'dark'],
          description: 'Color theme matching user device preferences',
        },
      ],
      // Define platforms included in the Terrazzo build
      platforms: {
        css: {
          description: 'Tokens built as CSS variables for the developers',
          filter: '@terrazzo/plugin-css',
          name: '@terrazzo/plugin-css',
        },
      },
    }),
  ],
});
```

:::

Lastly, run:

```sh
npx tz build
```

And you’ll see a `./tokens/tokens.listing.json` file generated in your project.


## Usage

This plugin creates a Token Listing file, which consolidates information about your source tokens and tokens built from other plugins. Token Listing is a community proposal that lists design tokens in a predictable, known format, to improve interoperability among design token tools. This format includes information about source tokens, modes, platforms where the tokens are built, and a mapping of token names between each platform.

Without Token Listings, maintainers of design token tools must develop their own input format, and users of these tools must format their tokens for each individual tool they want to use. With Token Listings, tool makers have a predictable data input that's natively supported by Terrazzo and that can be shared across tools.

Tools targeted by the Token Listing format include:
* design token diffing algorithms
* changelog and release note generators
* design token review and QA tools
* documentation websites
* MCP servers
* linting plugins
* code migration tools
* search indexes for design tokens


Below is an example of Token Listing content:

:::code-group

```jsonc [tokens.listing.json]
{
  "meta": {
    "version": 1,
    "authoringTool": "Terrazzo",
    "modes": [
      {
        "name": "color-scheme",
        "values": [ "light", "dark" ],
        "description": "Color theme matching user device preferences"
      }
    ],
    "platforms": {
      "figma": {
        "description": "Figma variables (color, spacing) and local styles (typography)"
      },
      "css": {
        "description": "Tokens built as CSS variables for the developers"
      }
    },
    "sourceOfTruth": "figma"
  },
  "data": [
    {
      "$name": "color.black.100",
      "$type": "color",
      "$value": "rgba(12, 12, 13, 0.05)",
      "$extensions": {
        "app.terrazzo.listing": {
          "names": {
            "figma": "color/black/100",
            "css": "--color-black-100"
          },
          "originalValue": {
            "colorSpace": "srgb",
            "components": [
              0.047058823529411764,
              0.047058823529411764,
              0.050980392156862744
            ],
            "alpha": 0.050980392156862744,
            "hex": "#0c0c0d"
          },
          "previewValue": "#0c0c0d0d",
          "source": {
            "resource": "file:///path/to/tokens.json",
            "loc": {
              "start": { /* ... */ },
              "end": { /* ... */ }
            }
          }
        }
      }
    },
    // Etc.
  ],
}
```

:::


## Features

### Mapping of token names between platforms

The primary purpose of Token Listings is to map the names of design tokens on different platforms. For instance, `color/bg/primary` on Figma would be called `--color-bg-primary` in CSS or `bg-primary` in Tailwind.

#### Naming
This plugin lets you declare all platforms your design tokens exist on, and lets you provide names for each token on each platform. Platforms can have a description, which can be reused in documentation tools and can help LLMs contextualize platforms.

You can map a specific platform to a compatible Terrazzo plugin (such as [plugin-css](./css) or [plugin-sass](./sass)), which will automatically compute a Token Listing name for that platform. You can also provide a custom `name` function for unsupported platforms, or to account for postprocessing you do on your built design tokens.

> [!NOTE]
> Terrazzo plugins transform tokens for a specific format. For example, `@terrazzo/plugin-css` registers transformed tokens in the `css` format. When a string is passed to the `name` property of a platform, it matches a format name, rather than a Terrazzo plugin name. Check the plugins you're using for the name of the format they transform tokens to, and use that format name to automate token name mapping.


#### Filtering
When a Terrazzo plugin is used for a platform, names will only be included based on what that plugin exports. For instance, the CSS plugin does not export multi-valued tokens that do not have a CSS shorthand. Such tokens will not have a listed `css` name, so they can never be included in a platform that uses the `css` name.

You can pass a custom `filter` function to further filter the listed design tokens. For instance, you may want to hide internal-use tokens from your documentation or AI agents.

Even if you use a custom `name` function, you can also pass a plugin's format name to `filter` (e.g. `css`), so that only tokens available on that format will be named in your token listing.

#### Example

See the example below that defines three platforms: `css`, `sass` and `figma`. The `sass` platform uses a custom filter to remove tokens computed within a mode from the listing, possibly because the team consuming SASS files does not use modes in its product. The `figma` platform does not have a Terrazzo plugin, so a custom naming function emulating Figma Variable naming is provided in the config.

:::code-group

```js [terrazzo.config.js]
export default defineConfig({
  plugins: [
    listing({
      platforms: {
        css: 'css',
        sass: {
          description: 'Design tokens as SASS variables (modes are not supported)',
          name: 'sass',
          filter: ({ mode }) => mode === '.',
        },
        figma: {
          description: 'Figma Variables curated by the design system team',
          name: ({ token }) => token.id.replace(/\./g, '/'),
        },
      },
    }),
  ],
};
```


### Source of truth declaration
The Token Listing format lets you declare which platform acts as a source of truth for your design tokens. This plugin has a `sourceOfTruth` config key to which you can pass a platform name (or an arbitrary string).

The plugin also lets you pass a custom function if your design tokens have multiple sources of truth (e.g. if you're in a middle of a token authoring tool migration).


See the example below where some design tokens are created and handled by developers (e.g. focus outline offset tokens). The default source of truth avoids repetition in the JSON output. Only tokens with a custom source of truth will have the field filled out.

:::code-group

```js [terrazzo.config.js]
export default defineConfig({
  plugins: [
    listing({
      platforms: {
        css: { /* ... */ },
        figma: { /* ... */ },
      },
      sourceOfTruth: {
        // goes in the listing metadata
        default: 'figma',
        // added only to relevant tokens
        custom: ({ token }) => token.id.startsWith('dev') ? 'css' : undefined,
      }
    }),
  ],
};
```

:::

### Source file mapping

This plugin keeps track of where each design token comes from. Each listed token has a `source` property pointing to the resource where the source token is found, and the location of the token within the resource.

> [!WARNING]
> Once the Resolver Spec is accepted into the DTCG spec, resources should match the names defined in your design tokens' `resolver.json` file. Expect potential changes to the format or config used in Terrazzo as a result of the Resolver Spec release.

This information can be used to create links between documentation tools and token editors. No configuration is needed to produce `source` information. Source information typically looks like this:

:::code-group

```jsonc [tokens.listing.json]
{
  "resource": "file://<root>/tokens.json",
  "loc": {
    "start": { "line": 21, "column": 14, "offset": 556 },
    "end": { "line": 28, "column": 8, "offset": 770 }
  }
}
```

:::



### Mode identification

The Token Listing format keeps track of which modes are available in your token system, and of which token is available in which mode. Listing metadata provides a list of modes with a description of each mode, their possible values and their default value. Each token has a mode field informing in which mode the token is available. This helps documentation tools build mode selection UI components, and filter the list of tokens based on the selected mode.

> [!NOTE]
> Once the Resolver Spec is accepted into the DTCG spec, we plan to make this plugin read modes directly from `resolver.json`.

In the below example, two modes are defined: one affects color tokens and has a default value, whereas the other affects dimension tokens and is not considered to have a default.

:::code-group

```js [terrazzo.config.js]
export default defineConfig({
  plugins: [
    listing({
      modes: [
        {
          name: 'theme',
          values: ['light', 'dark'],
          description: 'Color theme matching user device preferences',
          default: 'light',
        },
        {
          name: 'device',
          values: ['mobile', 'tablet', 'desktop'],
          description: 'Tokens that depend on device size',
        },
      ],
    }),
  ],
};
```

:::



### Design token subtyping
Some design token tools benefit from a more fine-grained typing of tokens than provided by the DTCG; documentation sites in particular can provide more realistic previews for a design token by analyzing the type of color or dimension the token represents. Because this information is often tightly coupled with token naming choices made by teams, this plugin expects a custom function to be passed to the `subtype` config property. That function is responsible for mapping design tokens to subtypes.

The available subtypes in the Token Listing format are based on an audit of design token documentation sites from leading design system teams. More subtypes may be added in future revisions of the format.

The below example includes all the supported subtypes in version 1 of the Token Listing format:

:::code-group

```js [terrazzo.config.js]
export default defineConfig({
  plugins: [
    listing({
      subtype: ({ token }) => {
        if (token.$type === 'color') {
          if (token.id.includes('background')) return 'bgColor';
          if (token.id.includes('border')) return 'borderColor';
          if (token.id.includes('icon') || token.id.includes('text')) return 'fgColor';
        }

        if (token.$type === 'dimension') {
          if (token.id.includes('width') || token.id.includes('height')) return 'size';
          if (token.id.includes('space') || token.id.includes('depth')) return 'gap';
          if (token.id.includes('padding')) return 'padding';
          if (token.id.includes('margin')) return 'margin';
          if (token.id.includes('stroke')) return 'borderWidth';
          if (token.id.includes('radius')) return 'borderRadius';
        }
      },
    }),
  ],
};
```

:::


### Preview values

The Token Listing format allows for preview values for each design token, which are expected to be valid CSS syntax. This plugin reuses the CSS plugin's transformation logic to compute preview values for each token. It also produces a `font` CSS shorthand for typography tokens.

Preview values are not intended for human consumption, so there is little need to customize them. Still, a function can be passed as `previewValue` in this plugin's config to change token preview values. When the custom function returns `undefined`, the computed CSS value is used instead.

Below is an example of a custom `previewValue` function that forces the use of sRGB for preview values:

:::code-group

```js [terrazzo.config.js]
export default defineConfig({
  plugins: [
    listing({
      previewValue: ({ token }) => {
        if (token.$type === 'color') {
          const color = new Color({ space: token.$value.colorSpace, coords: token.$value.components, alpha: token.$value.alpha });
          return color.to("srgb").toString();
        }
    }),
  ],
};
```
:::

Below is an example of CSS preview value computed by this plugin:

:::code-group

```jsonc [tokens.listing.json]
{
  "$name": "typography.code.medium",
  "$type": "typography",
  "$value": {
    "fontFamily": [ "roboto mono", "monospace" ],
    "fontSize": { "value": 1, "unit": "rem" },
    "fontWeight": 400
  },
  "$extensions": {
    "app.terrazzo.listing": {
      // ...
      "previewValue": "400 1rem \"roboto mono\", monospace",
      // ...
    }
  }
}
```
:::


### Original values
In some design token workflows (particularly QA and documentation), it can be important to know where the underlying value of a design token comes from. The Token Listing format contains the original value of each token so that tools can navigate token alias chains and create links between different tiers of design tokens. Original values are computed automatically. No configuration is needed.


## Sample Config

Configure options in [terrazzo.config.js](/docs/cli/config):

:::code-group

```js [terrazzo.config.js]
import { defineConfig } from "@terrazzo/cli";
import listing from "@terrazzo/plugin-listing";
import { kebabCase } from "scule";

export default defineConfig({
  plugins: [
    listing({
      // Name of the output file
      filename: 'tokens.listing.json',
      // Modes included in this build
      modes: [
        {
          // Identity of the mode
          name: 'color-scheme',
          // Human-readable explanation of what the mode does
          description: 'Color theme matching user device preferences',
          // Possible values for this mode (matches resolver.json modifier context)
          values: ['light', 'dark'],
          // Default value if applicable
          defaultValue: 'light'
        },
      ],
      // Platforms covered by the Terrazzo build and other platforms where the token exist
      platforms: {
        figma: {
          // Human-readable descriptiong of what the platform contains and who consumes it
          description: 'Figma Variables curated by the design system team',
          // Custom function that computes the names of tokens on that platform
          name: ({ token }) => token.id.replace(/\./g, '/'),
          // Optional custom filter function to filter out specific tokens
          filter: ({ token }) => token.id.startsWith('devOnly'),
        },
        sass: {
          description: 'Design tokens as SASS variables (modes are not supported)',
          // A plugin name can be passed to reuse the naming logic of the plugin, if it supports token listing
          name: '@terrazzo/plugin-sass',
          // Token filtering can be based on modes, or on reasoning about the whole token set; not just tokens
          filter: ({ mode }) => mode === '.',
        },
        // A plugin name can be passed to the whole platform as a shorthand
        css: '@terrazzo/plugin-css',
      },
      // Root folder where the source design tokens consumed by Terrazzo are stored
      resourceRoot: '~/Work/design-tokens/src/'
      // Platform where the design tokens are authored and maintained
      sourceOfTruth: {
        // goes in the listing metadata
        default: 'figma',
        // added only to relevant tokens
        custom: ({ token }) => token.id.startsWith('dev') ? 'css' : undefined,
      },
      subtype: ({ token }) => {
        if (token.$type === 'color') {
          if (token.id.includes('background')) return 'bgColor';
          if (token.id.includes('border')) return 'borderColor';
          if (token.id.includes('icon') || token.id.includes('text')) return 'fgColor';
        }

        if (token.$type === 'dimension') {
          if (token.id.includes('width') || token.id.includes('height')) return 'size';
          if (token.id.includes('space') || token.id.includes('depth')) return 'gap';
          if (token.id.includes('padding')) return 'padding';
          if (token.id.includes('margin')) return 'margin';
          if (token.id.includes('stroke')) return 'borderWidth';
          if (token.id.includes('radius')) return 'borderRadius';
        }
      },
    }),
  ],
});
```

:::

| Name            | Type                                                            | Description                                                           |
| :-------------- | :-------------------------------------------------------------- | :-------------------------------------------------------------------- |
| `filename`      | `string`                                                        | Filename to generate (default: `"tokens.listing.json"`).              |
| `modes`         | `ModeOption[]`                                                  | Modes to include in this token listing.                               |
| `platforms`     | `Record<string, PlatformOption>`                                | Platforms for which token names are included.                         |
| `resourceRoot`  | `string`                                                        | Root folder containing the source design tokens used by Terrazzo.     |
| `sourceOfTruth` | `SourceOfTruthOption`                                           | Source of truth for the design tokens.                                |
| `previewValue`  | `(params: CustomFunctionParams) => string | number | undefined` | Custom function to compute preview values.                            |
| `subtype`       | `(params: CustomFunctionParams) => Subtype | undefined`         | Custom function to provide more fine-grained types for design tokens. |

All properties in config are optional.

### CustomFunctionParams

All custom functions receive the same `CustomFunctionParams` object with the following keys:
* `logger`: the Terrazzo logger instance
* `mode`: the mode for the current token (`.` means no mode is applied)
* `token`: the current token
* `tokensSet`: the dictionary containing all resolved tokens

### ModeOption

The `ModeOption` object contains the following properties:
* `name`: the name of the mode
* `values`: possible values for the mode
* `description`: an optional human-readable description of the mode
* `default`: an optional default value

### PlatformOption

To reuse an existing Terrazzo plugin that's compatible with the Token Listing plugin, pass the name of the plugin. Check your token listing output for token names to verify compatibility.

Otherwise, pass the following object:
* `description`: an optional human-readable description of what the platform contains and who it is addressed to
* `filter`: an optional function receiving `CustomFunctionParams` and returning `true` for tokens for which a name should be provided, or the name of a Terrazzo plugin to delegate this logic to
* `name`: a mandatory function receiving `CustomFunctionParams` and returning the name of a token in the platform, or the name of a Terrazzo plugin to delegate this logic to

### SourceOfTruthOption

If there is a single source of truth, pass a string. The string should match a platform name.

If there are multiple sources of truth, pass the following object:
* `default`: the name of the platform acting as the default source of truth for most tokens
* `custom`: A function receiving `CustomFunctionParams` and returning a string only for tokens with a non-default source of truth (and `undefined` otherwise)

### Subtype

Any of the following values:
* `bgColor`
* `fgColor`
* `borderColor`
* `padding`
* `margin`
* `gap`
* `size`
* `borderWidth`
* `borderRadius`