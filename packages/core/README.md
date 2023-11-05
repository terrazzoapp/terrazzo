# @cobalt-ui/core

Parser/validator for the [Design Tokens Format Module](https://designtokens.org) (DTFM) standard.

For the CLI, use `@cobalt-ui/cli`.

## Install

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
