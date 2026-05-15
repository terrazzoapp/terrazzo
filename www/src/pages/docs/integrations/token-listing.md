---
title: Token Listing
layout: ../../../layouts/docs.astro
---

# Token Listing

Produce a Token Listing Format file for your design token build. The Token Listing Format is used by design token tool makers to understand the relationship between your source design tokens and your style files built in Terrazzo.

:::note
The Token Listing format is final at v1.0. The reference plugin is in alpha while config ergonomics are confirmed under real use; expect non-breaking config surface changes before `1.0.0` final.
:::

For a conceptual overview of the format, see the [Token Listing guide](/docs/guides/token-listing). For field-level details, see the format specification: <!-- TODO(format-website): link to format website -->.

## Setup

Requires [Node.js](https://nodejs.org) and [the CLI installed](https://terrazzo.app). With both installed, run:

:::npm

```sh
npm i -D @terrazzo/cli @terrazzo/plugin-token-listing
```

:::

And add it to `terrazzo.config.ts` under `plugins`:

:::code-group

```ts [terrazzo.config.ts]
import { defineConfig } from "@terrazzo/cli";
import css from "@terrazzo/plugin-css";
import listing from "@terrazzo/plugin-token-listing";

export default defineConfig({
  outDir: "./tokens/",
  plugins: [
    // Include at least one plugin to build tokens.
    css({
      filename: "tokens.css",
    }),

    // Configure the token listing.
    listing({
      filename: "tokens.listing.json",
      // Define the platforms covered by this listing.
      platforms: {
        css: {
          description: "Tokens built as CSS variables for the developers",
          name: "@terrazzo/plugin-css",
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

You'll see a `./tokens/tokens.listing.json` file generated in your project.

## Usage

This plugin creates a Token Listing file, which consolidates information about your source tokens and tokens built from other plugins. Token Listing is a community proposal that lists design tokens in a predictable, known format, to improve interoperability among design token tools.

Tools targeted by the Token Listing format include:

- design token diffing algorithms
- changelog and release note generators
- design token review and QA tools
- documentation websites
- MCP servers
- linting plugins
- code migration tools
- search indexes for design tokens

Below is an example of v1.0 listing content:

:::code-group

```jsonc [tokens.listing.json]
{
  "meta": {
    "version": 1,
    "authoringTool": "Terrazzo",
    "modes": [
      {
        "name": "theme",
        "values": ["light", "dark"],
        "default": "light",
        "description": "Color theme matching user device preferences"
      }
    ],
    "platforms": {
      "figma": {
        "description": "Figma variables curated by the design system team"
      },
      "css": {
        "description": "Tokens built as CSS variables for the developers"
      }
    },
    "groups": {
      "color": { "description": "All color tokens" },
      "color.brand": { "description": "Brand-defined palette" }
    },
    "sourceOfTruth": "figma"
  },
  "data": [
    {
      "$name": "color.brand.500",
      "$type": "color",
      "$description": "Brand primary",
      "$value": { "colorSpace": "srgb", "components": [0.66, 0.20, 0.20], "alpha": 1 },
      "$extensions": {
        "listing": {
          "platforms": {
            "figma": { "name": "color/brand/500" },
            "css": { "name": "--color-brand-500", "value": "#aabbcc" }
          },
          "previewValue": "#a83232",
          "aliasChain": ["color.semantic.fg", "color.brand.500"],
          "source": {
            "$ref": "base/colors.json#/color/brand/500",
            "via": "#/sets/brand",
            "loc": {
              "start": { "line": 21, "column": 14, "offset": 556 },
              "end": { "line": 28, "column": 8, "offset": 770 }
            }
          }
        }
      }
    }
  ]
}
```

:::

## Features

### Per-platform mapping

The primary purpose of Token Listings is to map design tokens across platforms. The plugin emits a per-token `platforms` map under `$extensions.listing`. Each entry contains:

- `name`: the token's identifier on that platform (CSS variable name, Figma path, etc.). **Required when the platform entry exists.**
- `value`: the built/serialised value on that platform (e.g. resolved CSS string, Figma hex). Optional.
- `deprecated`: per-platform deprecation marker (boolean or string). May diverge from the token-level `$deprecated`. Optional.

**Presence of an entry signals the token exists on that platform; absence means it does not.**

You can map a specific platform to a compatible Terrazzo plugin (such as [plugin-css](./css) or [plugin-sass](./sass)). The plugin reads `name`, `value`, and `deprecated` from the format's transformed-token meta path. You can also supply custom functions for any field.

:::note
Terrazzo plugins transform tokens for a specific format. For example, `@terrazzo/plugin-css` registers transformed tokens in the `css` format. When a string is passed to `name`, `value`, or `deprecated`, it matches a format name, rather than a Terrazzo plugin name.
:::

#### Filtering

When a Terrazzo plugin is used for a platform, names will only be included based on what that plugin exports. For instance, the CSS plugin does not export multi-valued tokens that do not have a CSS shorthand. Such tokens will not have a CSS platform entry.

You can pass a custom `filter` function to further filter the listed design tokens. Pass a plugin's format name to delegate filtering, or a function returning `true` for tokens to include.

#### Example

:::code-group

```ts [terrazzo.config.ts]
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
          deprecated: ({ token }) =>
            token.id.startsWith('legacy.') ? 'use the modern token instead' : undefined,
        },
      },
    }),
  ],
});
```

:::

### Source of truth declaration

The format lets you declare which platform acts as a source of truth for your design tokens. Pass a platform name (or arbitrary string) to `sourceOfTruth`, or an object with a default and a custom per-token resolver:

:::code-group

```ts [terrazzo.config.ts]
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
      },
    }),
  ],
});
```

:::

### Source file mapping

Each listed token has a `source` object with:

- `$ref`: an [RFC 6901](https://datatracker.ietf.org/doc/html/rfc6901) JSON Pointer to the token's location, in [Resolver Spec](https://www.designtokens.org/tr/2025.10/resolver/) syntax. Path component is relative to the resolver document if provided, else the build cwd.
- `via`: a same-document JSON Pointer into the resolver, identifying the resolver entry that brought this token in. Examples: `#/sets/color`, `#/modifiers/theme/contexts/dark`. Omitted when no `resolver.json` is provided.
- `loc`: byte/line/column range of the token's authoring location inside the file at `$ref`. Optional in the format spec; emitted by default by this plugin.

This information lets documentation tools link to source files, and lets editor/IDE plugins jump to specific lines.

### Mode identification

The format keeps track of which modes are available in your token system. **When a `resolver.json` is provided**, modes are derived from the resolver's modifiers automatically: each modifier becomes a mode entry, with `name`, `values` (the modifier's context names), `default`, and `description`.

The plugin's `modes` config can only enrich the resolver-derived modes with descriptions. Any mismatched name, values, or default fails the build with an error — the resolver is the single source of truth for mode identity.

When no resolver is provided, modes come entirely from the plugin's `modes` config.

:::code-group

```ts [terrazzo.config.ts]
export default defineConfig({
  plugins: [
    listing({
      modes: [
        {
          name: 'theme',
          values: ['light', 'dark'],
          default: 'light',
          description: 'Color theme matching user device preferences',
        },
      ],
    }),
  ],
});
```

:::

### Group descriptions

When source DTCG token files attach `$description` or `$deprecated` to groups, this plugin emits them under `meta.groups`, keyed by group ID. Tools can render group headers, mark deprecated sections, or surface explanatory descriptions in documentation UIs without having to walk the original token tree.

### Design token subtyping

Some design token tools benefit from a more fine-grained typing of tokens than provided by the DTCG. Pass a custom function to the `subtype` config property to map tokens to one of the v1.0 subtypes (see [Subtype enum](#subtype-enum) below).

The available subtypes are based on an audit of design token documentation sites from leading design system teams. They are frozen for v1.0; new values would require a format version bump.

:::code-group

```ts [terrazzo.config.ts]
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
});
```

:::

### Preview values

The format allows for preview values for each design token, which must be valid CSS. This plugin reuses the CSS plugin's transformation logic to compute preview values automatically. It also produces a `font` CSS shorthand for typography tokens.

You can pass a custom `previewValue` function. Returning a number coerces to string; returning `undefined` falls back to the computed value.

:::code-group

```ts [terrazzo.config.ts]
export default defineConfig({
  plugins: [
    listing({
      previewValue: ({ token }) => {
        if (token.$type === 'color') {
          const color = new Color({ space: token.$value.colorSpace, coords: token.$value.components, alpha: token.$value.alpha });
          return color.to("srgb").toString();
        }
      },
    }),
  ],
});
```

:::

### Alias chains

In some design token workflows (particularly QA and documentation), it's important to know how a token resolves through aliases. The format includes an `aliasChain` field with the ordered list of token IDs along the resolution path, source → leaf. Computed automatically; no configuration needed. Omitted for non-aliased tokens.

## Sample Config

Configure options in [terrazzo.config.ts](/docs/reference/config):

:::code-group

```ts [terrazzo.config.ts]
import { defineConfig } from "@terrazzo/cli";
import listing from "@terrazzo/plugin-token-listing";

export default defineConfig({
  plugins: [
    listing({
      // Name of the output file
      filename: 'tokens.listing.json',
      // Modes included in this build
      modes: [
        {
          name: 'color-scheme',
          description: 'Color theme matching user device preferences',
          values: ['light', 'dark'],
          default: 'light',
        },
      ],
      // Platforms covered by the Terrazzo build and other platforms where the token exists
      platforms: {
        figma: {
          description: 'Figma Variables curated by the design system team',
          // Custom function that computes the names of tokens on that platform
          name: ({ token }) => token.id.replace(/\./g, '/'),
          // Optional custom filter function to filter out specific tokens
          filter: ({ token }) => !token.id.startsWith('devOnly'),
        },
        sass: {
          description: 'Design tokens as SASS variables (modes are not supported)',
          // A plugin format name can be passed to reuse the naming logic of the plugin
          name: 'sass',
          // Token filtering can be based on modes, or on reasoning about the whole token set
          filter: ({ mode }) => mode === '.',
        },
        // A plugin format name can be passed to the whole platform as a shorthand
        css: 'css',
      },
      // Platform where the design tokens are authored and maintained
      sourceOfTruth: {
        default: 'figma',
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

| Name            | Type                                                              | Description                                                           |
| :-------------- | :---------------------------------------------------------------- | :-------------------------------------------------------------------- |
| `filename`      | `string`                                                          | Filename to generate (default: `"tokens.listing.json"`).              |
| `modes`         | `ModeOption[]`                                                    | Modes to include in this token listing.                               |
| `platforms`     | `Record<string, PlatformOption>`                                  | Platforms for which token info is included.                           |
| `sourceOfTruth` | `SourceOfTruthOption`                                             | Source of truth for the design tokens.                                |
| `previewValue`  | `(params: CustomFunctionParams) => string \| number \| undefined` | Custom function to compute preview values.                            |
| `subtype`       | `(params: CustomFunctionParams) => Subtype \| undefined`          | Custom function to provide more fine-grained types for design tokens. |

All properties in config are optional.

### CustomFunctionParams

All custom functions receive the same `CustomFunctionParams` object with the following keys:

- `logger`: the Terrazzo logger instance
- `mode`: the mode for the current token (`.` means no mode is applied)
- `token`: the current token
- `tokensSet`: the dictionary containing all resolved tokens

### ModeOption

The `ModeOption` object contains the following properties:

- `name`: the name of the mode
- `values`: possible values for the mode
- `description`: an optional human-readable description of the mode
- `default`: an optional default value

When a `resolver.json` is provided, mode entries are derived from the resolver. The `description` from this option will override or extend the resolver's description; any other field that diverges from the resolver causes a build error.

### PlatformOption

To reuse an existing Terrazzo plugin that's compatible with the Token Listing plugin, pass the format name of the plugin as a string. Check your token listing output for token names to verify compatibility.

Otherwise, pass an object:

- `description`: an optional human-readable description of what the platform contains and who it is addressed to
- `filter`: an optional function or plugin format name; returns `true` for tokens to include
- `name`: a function or plugin format name returning each token's name on this platform
- `value`: a function or plugin format name returning each token's serialised value on this platform
- `deprecated`: a function or plugin format name returning a per-platform deprecation marker (boolean or string)

### SourceOfTruthOption

If there is a single source of truth, pass a string (typically a platform name).

If there are multiple sources of truth, pass an object:

- `default`: the platform name acting as the default source of truth
- `custom`: a function returning a string only for tokens with a non-default source of truth (and `undefined` otherwise)

### Subtype enum

The frozen v1.0 subtype values:

- `bgColor`
- `fgColor`
- `borderColor`
- `padding`
- `margin`
- `gap`
- `size`
- `borderWidth`
- `borderRadius`

Tools encountering an unrecognised value SHOULD fall back to the token's `$type`.
