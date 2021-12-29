# @cobalt-ui/core

Generate code from your design tokens, and sync your design tokens with Figma. 🦀 Powered by Rust.

## Install

```
npm install @cobalt-ui/core
```

## Usage

### Parse

Parse a `tokens.yaml` file into a JS object

```js
import co from "@cobalt-ui/core";
import fs from "fs";

const schema = JSON.parse(co.parse(fs.readFileSync("./tokens.yaml", "utf8")));
```

### Build

Generate code from `tokens.yaml` schema

```js
import co from "@cobalt-ui/core";
import sass from "@cobalt-ui/sass";
import css from "@cobalt-ui/css";
import fs from "fs";

const schema = JSON.parse(co.parse(fs.readFileSync("./tokens.yaml", "utf8")));
const files = co.build(schema, {
  plugins: [sass(), css()],
});
```

### Sync

Sync `tokens.yaml` with Figma

```js
import co from "@cobalt-ui/core";
import fs from "fs";
import deepmerge from 'deepmerge'
import yaml from 'js-yaml';

const schema = JSON.parse(co.parse(fs.readFileSync("./tokens.yaml", "utf8")));
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

fs.writeFileSync('./tokens.yaml', deepmerge(schema, updates, {arrayMerge(a, b) => b}));
```
