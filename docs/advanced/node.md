---
title: Cobalt Node.js API
---

# Node.js API

Cobalt’s Node.js API is for parsing and validating the [Design Tokens Format Module](https://designtokens.org) (DTFM) standard. It can’t output code like the [CLI](/guides/cli) can, but it is a lightweight and fast parser/validator for the DTFM spec that could even be used in client code if desired.

## Setup

```sh
npm install @cobalt-ui/core
```

## Usage

Parse a `tokens.json` file into a JS object

<!-- prettier-ignore -->
```js
import co from '@cobalt-ui/core';

const designTokens = {
  color: {
    red:   {$type: 'color', $value: '#e34850'},
    green: {$type: 'color', $value: '#2d9d78'},
    blue:  {$type: 'color', $value: '#2680eb'},
  },
};

const {errors, warnings, result} = co.parse(designTokens);
```

| Name       | Type                      | Description                                                                                                                                 |
| :--------- | :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------ |
| `result`   | Token[]                   | Flattened array of all parsed tokens in the schema (this may be incomplete if `errors` present)                                             |
| `errors`   | `string[]` \| `undefined` | If present, unrecoverable errors were encountered (you should probably `throw` with these messages).                                        |
| `warnings` | `string[]` \| `undefined` | If present, the parser found schema issues that are likely undesirable, but the schema is still usable (you should probably show the user). |
