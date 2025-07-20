# @terrazzo/react-color-picker

Pick colors using CSS Color Module 4, wide color gamut (WCG), and all supported web colorspaces using React and WebGL for monitor-accurate colors. Powered by 🌈 [Culori](https://culorijs.org/).

`15 kB`, enforced by [size-limit](https://www.npmjs.com/package/size-limit)

## Setup

```sh
pnpm i @terrazzo/react-color-picker @terrazzo/tiles
```

```tsx
import ColorPicker from "@terrazzo/react-color-picker";
import { useState } from "react";

import "@terrazzo/tiles/all-components.css";

const [color, setColor] = useState("color(display-p3 0 0.3 1)");

<ColorPicker value={color} onChange={setColor} />;
```
