---
title: Color Picker
layout: ../../../layouts/docs.astro
---

# Color Picker

`@terrazzo/react-color-picker` is a futuristic color picker component for React that can handle wide gamut and high bit-depth colors in stunning color reproduction. Powered by WebGL for monitor-accurate colors and [Color.js](https://colorjs.io/).

It supports all CSS Color Module 4 colorspaces including `srgb`, `display-p3`, `oklch`, `oklab`, and more.

**Bundle size:** `15 kB`, enforced by [size-limit](https://www.npmjs.com/package/size-limit).

## Setup

Install the color picker and its peer dependency `@terrazzo/tiles`:

:::npm

```sh
npm i @terrazzo/react-color-picker @terrazzo/tiles
```

:::

## Usage

```tsx
import ColorPicker from "@terrazzo/react-color-picker";
import { useState } from "react";

function App() {
  const [color, setColor] = useState("color(display-p3 0 0.3 1)");

  return (
    <ColorPicker
      color={color}
      setColor={setColor}
      colorSpaces={["srgb", "oklch", "oklab"]}
    />
  );
}
```

### Props

| Prop          | Type       | Description                                                                |
| :------------ | :--------- | :------------------------------------------------------------------------- |
| `color`       | `string`   | The current color value, expressed as a CSS Color Module 4 string.         |
| `setColor`    | `function` | Callback fired when the color changes. Receives the new color as a string. |
| `colorSpaces` | `string[]` | Array of colorspaces to display as tabs in the picker.                     |

### Styling

Import both `@terrazzo/tiles` and `@terrazzo/react-color-picker` CSS for default styles:

```diff
+ import "@terrazzo/tiles/all-components.css";
+ import "@terrazzo/react-color-picker/styles.css";
```

Or, you can copy both of those files manually into your own styling, and customize/delete what you don't use.

## Colorspaces

The color picker supports the following colorspaces:

- `srgb` — Standard RGB (default web colorspace)
- `display-p3` — Wide gamut colorspace for modern displays
- `oklch` — Perceptually uniform polar colorspace
- `oklab` — Perceptually uniform rectangular colorspace
- `lab` — CIE LAB colorspace
- `lch` — CIE LCH colorspace

## Related

- [@terrazzo/tiles](https://www.npmjs.com/package/@terrazzo/tiles) — Shared UI primitives for Terrazzo web components
- [Color.js](https://colorjs.io/) — Color conversion and manipulation library
