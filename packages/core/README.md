# @cobalt-ui/core

Generate code from your design tokens, and sync your design tokens with Figma.

## Install

```
npm install @cobalt-ui/core
```

## Usage

### Parse

Parse a `tokens.json` file into a JS object

```js
import co from "@cobalt-ui/core";
import fs from "fs";

const schema = JSON.parse(co.parse(fs.readFileSync("./tokens.json", "utf8")));
```

### Build

Generate code from `tokens.json` schema

```js
import co from "@cobalt-ui/core";
import sass from "@cobalt-ui/sass";
import css from "@cobalt-ui/css";
import fs from "fs";

const schema = JSON.parse(co.parse(fs.readFileSync("./tokens.json", "utf8")));
const files = co.build(schema, {
  plugins: [sass(), css()],
});
```

### Sync

Sync `tokens.json` with Figma

```js
import co from "@cobalt-ui/core";
import fs from "fs";
import deepmerge from 'deepmerge'

const schema = Jco.parse(JSON.parse(fs.readFileSync("./tokens.json", "utf8")));
const updates = co.sync({
  'https://figma.com/file/ABC123?node_id=123': {
    styles: {
      Black: {type: 'color', id: 'color.black'},
    },
    components: {
      'Font / Body': {type: 'font', id: 'font.family.body'},
    },
  }
});

fs.writeFileSync('./tokens.json', deepmerge(schema, updates, {arrayMerge(a, b) => b}));
```
