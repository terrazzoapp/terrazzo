# @terrazzo/token-diff

## Install

```sh
npm install @terrazzo/token-diff
```

## Usage

Call the diff function matching the data type you want to diff.

### Diff tokens

Diff two tokens and receive a `DiffEntry`.

The entry contains a `changeType` property that can either be `none`, `added`, `removed` or `changed`.

When the `changeType` is `added` or `changed`, a `new` property contains all the token properties that are new compared to the old token.

When the `changeType` is `removed` or `changed`, an `old` property contains all the token properties that have been removed in the new token.

```ts
import { diffTokens } from '@terrazzo/token-diff/token';

const result = diffTokens(oldToken, newToken);

console.log(result.changeType);
```

### Diff token listings

Diff two token listings to receive a diff listing. The diff listing contains a `data` array with all the changes between the two listings' tokens.

For performance reasons, the order of appearance of token diff entries in `data` is not guaranteed.

```ts
import { diffTokenListings } from '@terrazzo/token-diff/listing';

const result = diffTokenListings(oldListing, newListing);

// One entry per difference between both listings will be added.
console.log(result.data.length);
```
