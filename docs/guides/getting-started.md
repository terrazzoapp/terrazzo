---
title: Getting Started
---

# Getting Started

Cobalt turns your [design tokens](/guides/tokens) into code using a CLI or Node.js. Cobalt is configurable and pluggable, and can generate [JavaScript](/integrations/js), [TypeScript](/integrations/js),
[JSON](/integrations/json), [CSS](/integrations/css), and [Sass](/integrations/sass) via the official plugins, and even [integrate with Tailwind CSS](/integrations/tailwind).

You can also create your own plugin to turn your design tokens into anything using [the plugin API](/advanced/plugin-api).

## Setup

With [the latest version of Node installed](https://nodejs.org), install the Cobalt CLI using npm, along with any plugins you’d like (for our example we’ll install the JS and CSS plugins, but you can install fewer or more depending on what you’d like):

```sh
npm i -D @cobalt-ui/cli @cobalt-ui/plugin-css @cobalt-ui/plugin-js
```

Next, we’ll create a `tokens.json` file in the root of our project (or `tokens.yaml`). This is where we’ll put all our [tokens](/guides/tokens):

::: code-group

```json [JSON]
{
  "color": {
    "$type": "color",
    "base": {
      "gray": {
        "0": {"$value": "#f6f8fa"},
        "1": {"$value": "#eaeef2"},
        "2": {"$value": "#d0d7de"},
        "3": {"$value": "#afb8c1"},
        "4": {"$value": "#8c959f"},
        "5": {"$value": "#6e7781"},
        "6": {"$value": "#57606a"},
        "7": {"$value": "#424a53"},
        "8": {"$value": "#32383f"},
        "9": {"$value": "#24292f"}
      },
      "blue": {
        "0": {"$value": "#ddf4ff"},
        "1": {"$value": "#b6e3ff"},
        "2": {"$value": "#80ccff"},
        "3": {"$value": "#54aeff"},
        "4": {"$value": "#218bff"},
        "5": {"$value": "#0969da"},
        "6": {"$value": "#0550ae"},
        "7": {"$value": "#033d8b"},
        "8": {"$value": "#0a3069"},
        "9": {"$value": "#002155"}
      }
    },
    "semantic": {
      "action": {"$value": "{color.base.blue.5}"},
      "textColor": {"$value": "{color.base.gray.9}"}
    }
  },
  "fontStack": {
    "$type": "fontFamily",
    "sansSerif": {
      "$value": ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Noto Sans", "Helvetica", "Arial", "sans-serif", "Apple Color Emoji", "Segoe UI Emoji"]
    }
  },
  "space": {
    "$type": "dimension",
    "xxsmall": {"$value": "2px"},
    "xsmall": {"$value": "4px"},
    "small": {"$value": "6px"},
    "medium": {"$value": "8px"},
    "large": {"$value": "12px"},
    "xlarge": {"$value": "16px"}
  }
}
```

```yaml [YAML]
color:
  $type: color
  base:
    gray:
      '0':
        $value: '#f6f8fa'
      '1':
        $value: '#eaeef2'
      '2':
        $value: '#d0d7de'
      '3':
        $value: '#afb8c1'
      '4':
        $value: '#8c959f'
      '5':
        $value: '#6e7781'
      '6':
        $value: '#57606a'
      '7':
        $value: '#424a53'
      '8':
        $value: '#32383f'
      '9':
        $value: '#24292f'
    blue:
      '0':
        $value: '#ddf4ff'
      '1':
        $value: '#b6e3ff'
      '2':
        $value: '#80ccff'
      '3':
        $value: '#54aeff'
      '4':
        $value: '#218bff'
      '5':
        $value: '#0969da'
      '6':
        $value: '#0550ae'
      '7':
        $value: '#033d8b'
      '8':
        $value: '#0a3069'
      '9':
        $value: '#002155'
  semantic:
    action:
      $value: '{color.base.blue.5}'
    textColor:
      $value: '{color.base.gray.9}'
fontStack:
  $type: fontFamily
  sansSerif:
    $value:
      - -apple-system
      - BlinkMacSystemFont
      - Segoe UI
      - Noto Sans
      - Helvetica
      - Arial
      - sans-serif
      - Apple Color Emoji
      - Segoe UI Emoji
space:
  $type: dimension
  xxsmall:
    $value: 2px
  xsmall:
    $value: 4px
  small:
    $value: 6px
  medium:
    $value: 8px
  large:
    $value: 12px
  xlarge:
    $value: 16px
```

:::

Then we’ll configure our plugins. Create a `tokens.config.mjs` file ([docs](/advanced/config)) also in the root of your project:

::: code-group

```js [tokens.config.mjs]
import pluginCSS from '@cobalt-ui/plugin-css';
import pluginJS from '@cobalt-ui/plugin-js';

/** @type {import('@cobalt-ui/core').Config} */
export default {
  tokens: './tokens.json',
  outDir: './tokens/',
  plugins: [pluginCSS(/* options */), pluginJS(/* options */)],
};
```

:::

Lastly, run the following command to generate all code from your tokens:

```sh
npx co build
```

You should see a new `/tokens/` folder with your newly-generated tokens:

```
├── package.json
├── tokens/        <-- ✨ New ✨
│   ├── index.css
│   ├── index.d.ts
│   ├── index.js
├── tokens.config.mjs
└── tokens.json
```

You can now use the generated CSS and/or JS in your project!

You can also change any settings in `tokens.config.mjs` ([docs](/advanced/config)) such as the name of `tokens.json` and the output folder, as well as configure plugins individually (be sure to read guides on all each plugin can do—some can do quite a bit!).

## Next Steps

This covers the basics, but there’s a lot more you can do with your design tokens:

- [Learn about the DTFM format](/guides/tokens)
- [Learn about Modes](/guides/modes) (unique to Cobalt!)
- See additional integrations:
  - [CSS](/integrations/css)
  - [JavaScript/TypeScript](/integrations/js)
  - [JSON/Native](/integrations/json)
  - [Sass](/integrations/sass)
  - [Tailwind CSS](/integrations/tailwind)
- View advanced guides
  - [All Config Options](/advanced/config)
  - [Plugin API](/advanced/plugin-api) for making your own plugins easily
  - [Integrating with CI](/advanced/ci)
