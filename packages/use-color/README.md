# @terrazzo/use-color

React hook for memoizing and transforming any web-compatible color. Only 12 kB (with full support for all web colorspaces!) thanks to Culori.

## Setup

```sh
pnpm i @terrazzo/use-color
```

```tsx
import useColor, { formatCSS } from "@terrazzo/use-color";

const [color, setColor] = useColor("color(srgb 0.0 0.3 1.0)");

// Reading

color.css; // color(srgb 0.0 0.3 1.0)
color.original; // { mode: "srgb", r: 0, g: 0.3, b: 1.0, alpha: 1 }
color.p3; // { mode: "p3", r: 0.1184, g: 0.2956, b: 0.9611 }
formatCSS(color.p3); // color(display-p3 0.1184 0.2956 0.9611)

// Setting color

setColor("color(display-p3 0.12 0.3 0.98)");
setColor({ mode: "p3", r: 0.12, g: 0.3, b: 0.98 });

// Adjusting color relatively (lighten by 10% via Oklab)

setColor({ ...color.original.oklab, l: color.oklab.l + 0.1 });
```

## Reading color

The color is fully memoized, so it can be used in any `useEffect()` hooks. This uses Culori to convert colors, but only the [CSS Color Module 4](https://www.w3.org/TR/css-color-4/) colorspaces are loaded. Further, all the properties are **getters** that cache their output, so even if accessing a different format, work will never be redone. You have the following property available:

| Property      | Type     | Description                                                                                                 |
| :------------ | :------- | :---------------------------------------------------------------------------------------------------------- |
| `css`         | `string` | CSS-compatible color using Color Module 4                                                                   |
| `original`    | `object` | Culori color object using the original mode of the color (tip: use `color.original.mode` to see the format) |
| `a98`         | `object` | Culori A98 color object                                                                                     |
| `hsl`         | `object` | Culori HSL color object                                                                                     |
| `hsv`         | `object` | Culori HSV color object                                                                                     |
| `lrgb`        | `object` | Culori LinearRGB color object                                                                               |
| `lab`         | `object` | Culori CIELab color object (not to be confused with Oklab)                                                  |
| `lch`         | `object` | Culori CIELCh color object (not to be confused with Oklch)                                                  |
| `luv`         | `object` | Culori LUV color object                                                                                     |
| `okhsl`       | `object` | Culori Okhsl color object                                                                                   |
| `okhsv`       | `object` | Culori Okhsv color object                                                                                   |
| `oklab`       | `object` | Culori Oklab color object                                                                                   |
| `oklch`       | `object` | Culori Oklch color object                                                                                   |
| `p3`          | `object` | Culori P3 color object                                                                                      |
| `prophotoRgb` | `object` | Culori ProPhotoRGB color object                                                                             |
| `rec2020`     | `object` | Culori Rec2020 color object                                                                                 |
| `rgb`         | `object` | (sRGB) Culori RGB color object                                                                              |
| `srgb`        | `object` | (alias of `rgb`)                                                                                            |
| `xyz`         | `object` | (alias of `xyz65`)                                                                                          |
| `xyz50`       | `object` | Culori Xyz50 color object                                                                                   |
| `xyz65`       | `object` | Culori Xyz65 color object                                                                                   |

## Setting color

Setting color can be done by either passing in any valid CSS string:

```tsx
const [color, setColor] = useColor();

setColor("color(display-p3 0.12 0.3 0.98)");
```

Or any Culori object:

```tsx
const [color, setColor] = useColor();

setColor({ mode: "p3", r: 0.12, g: 0.3, b: 0.98 });
```

Or adjusting the color object relatively (tip: for most purposes, adjusting by `oklab` will yield the best results):

```tsx
const [color, setColor] = useColor();

setColor({
  ...color.original.oklab,
  l: color.oklab.l + 0.1, // Lighten by 10% via Oklab
});
```

_Note: if adjusting by a different colorspace, that will affect the `color.original` and `color.css` output, which pulls the most-recently-used colorspace._
