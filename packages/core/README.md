# @cobalt-ui/core

JS-only tool to parse a `tokens.json` schema, validate it for errors, and return tokens as a
normalized, flattened array. Works both in Node and the browser!

For building tokens and syncing with Figma, use `@cobalt-ui/cli`.

## Install

```
npm install @cobalt-ui/core
```

## Usage

This

Parse a `tokens.json` file into a JS object

```js
import co from '@cobalt-ui/core';
import fs from 'fs';

const { errors, warnings, result } = JSON.parse(co.parse(fs.readFileSync('./tokens.json', 'utf8')));
```
