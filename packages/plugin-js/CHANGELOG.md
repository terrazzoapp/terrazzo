# @cobalt-ui/plugin-js

## 1.4.3

### Patch Changes

- [#169](https://github.com/drwpow/cobalt-ui/pull/169) [`8b77c6e`](https://github.com/drwpow/cobalt-ui/commit/8b77c6efb4af147a5989af1d74fc3db5a79ce085) Thanks [@dev-nicolaos](https://github.com/dev-nicolaos)! - pluginJS: properly serialize output when $extensions.mode is an empty object

## 1.4.2

### Patch Changes

- [#132](https://github.com/drwpow/cobalt-ui/pull/132) [`97274f4`](https://github.com/drwpow/cobalt-ui/commit/97274f4be83966d178f3a06524ead926bcdd649c) Thanks [@drwpow](https://github.com/drwpow)! - Fix exported types

- [#132](https://github.com/drwpow/cobalt-ui/pull/132) [`97274f4`](https://github.com/drwpow/cobalt-ui/commit/97274f4be83966d178f3a06524ead926bcdd649c) Thanks [@drwpow](https://github.com/drwpow)! - Allow options?.transformer() to return `undefined` and fall back to default

## 1.4.1

### Patch Changes

- [#117](https://github.com/drwpow/cobalt-ui/pull/117) [`e36605c`](https://github.com/drwpow/cobalt-ui/commit/e36605c01ff86a2e8f3f43192aa53637a8934dfd) Thanks [@drwpow](https://github.com/drwpow)! - Fix array of shadows bug

## 1.4.0

### Minor Changes

- [#114](https://github.com/drwpow/cobalt-ui/pull/114) [`9f62035`](https://github.com/drwpow/cobalt-ui/commit/9f620359ee6c426279645a29edc5854085dd6045) Thanks [@drwpow](https://github.com/drwpow)! - Add "inset" property for shadows

- [#114](https://github.com/drwpow/cobalt-ui/pull/114) [`9f62035`](https://github.com/drwpow/cobalt-ui/commit/9f620359ee6c426279645a29edc5854085dd6045) Thanks [@drwpow](https://github.com/drwpow)! - Support arrays of shadows

## 1.3.1

### Patch Changes

- [#94](https://github.com/drwpow/cobalt-ui/pull/94) [`01d1d31`](https://github.com/drwpow/cobalt-ui/commit/01d1d3139dcdc25c2883378522f349c817e9fc1f) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug where token IDs and modes couldn’t start with a number

- [#94](https://github.com/drwpow/cobalt-ui/pull/94) [`01d1d31`](https://github.com/drwpow/cobalt-ui/commit/01d1d3139dcdc25c2883378522f349c817e9fc1f) Thanks [@drwpow](https://github.com/drwpow)! - Bump @cobalt-ui/utils

## 1.3.0

### Minor Changes

- [#79](https://github.com/drwpow/cobalt-ui/pull/79) [`2963b21`](https://github.com/drwpow/cobalt-ui/commit/2963b215e31096290acadd247963105646248bb2) Thanks [@mike-engel](https://github.com/mike-engel)! - Allow JS plugin output to be nested

### Patch Changes

- Updated dependencies [[`2963b21`](https://github.com/drwpow/cobalt-ui/commit/2963b215e31096290acadd247963105646248bb2)]:
  - @cobalt-ui/utils@1.2.0

## 1.2.3

### Patch Changes

- Updated dependencies [[`432029f`](https://github.com/drwpow/cobalt-ui/commit/432029f78130bec264fbdb26e83a6980fb923b0e)]:
  - @cobalt-ui/cli@1.2.0

## 1.2.2

### Patch Changes

- [#45](https://github.com/drwpow/cobalt-ui/pull/45) [`4e4e2c0`](https://github.com/drwpow/cobalt-ui/commit/4e4e2c03ed0750306633fe757396733b8f6db385) Thanks [@drwpow](https://github.com/drwpow)! - Fix release script

- Updated dependencies [[`4e4e2c0`](https://github.com/drwpow/cobalt-ui/commit/4e4e2c03ed0750306633fe757396733b8f6db385)]:
  - @cobalt-ui/cli@1.1.3
  - @cobalt-ui/utils@1.1.1

## 1.2.1

### Patch Changes

- Updated dependencies [[`482f5cd`](https://github.com/drwpow/cobalt-ui/commit/482f5cd4dfd7dd5bf71b64ae1f103322e6709717), [`482f5cd`](https://github.com/drwpow/cobalt-ui/commit/482f5cd4dfd7dd5bf71b64ae1f103322e6709717), [`152f666`](https://github.com/drwpow/cobalt-ui/commit/152f66661de125e1c4b9d872794bbcff8b51de8f), [`eb942a7`](https://github.com/drwpow/cobalt-ui/commit/eb942a7c50a7afd48e73c0f652f34f71f01db68f)]:
  - @cobalt-ui/cli@1.1.0
  - @cobalt-ui/utils@1.1.0

## 1.2.0

### Minor Changes

- 51fd059: Allow meta fields to not be generated for javascript builds

## 1.1.0

### Minor Changes

- 526777f: Add `fontFamily`, `fontWeight`, `fontName`, and `number` types, remove `font` type

### Patch Changes

- ecc5389: Fix TS inference error with newer versions of TS
- ecc5389: Update TS types for 4.7
- Updated dependencies [ecc5389]
- Updated dependencies [526777f]
  - @cobalt-ui/utils@0.5.4
  - @cobalt-ui/cli@0.8.0

## 1.0.7

### Patch Changes

- ae8a4d6: Update dependencies
- ae8a4d6: Fix TypeScript bug with modes
- Updated dependencies [ae8a4d6]
  - @cobalt-ui/utils@0.5.3
  - @cobalt-ui/cli@0.7.3

## 1.0.6

### Patch Changes

- 28baebe: Fix TypeScript types for token fn
- Updated dependencies [42401cd]
  - @cobalt-ui/cli@0.7.2

## 1.0.5

### Patch Changes

- faa7340: Fix TS function overload

## 1.0.4

### Patch Changes

- 91b1eed: Fix $value resolution on tokens.meta

## 1.0.3

### Patch Changes

- 2da8f16: Fix missing \_group and \_original data

## 1.0.2

### Patch Changes

- 9edc9d9: Fix token.\_original.$extensions.modes shallow clone bug
- Updated dependencies [9edc9d9]
  - @cobalt-ui/utils@0.5.2

## 1.0.1

### Patch Changes

- 51647a3: Add missing $type from meta info

## 1.0.0

### Minor Changes

- e50c864: Add strokeStyle and border support in plugins, improve validation in core

### Patch Changes

- Updated dependencies [e50c864]
  - @cobalt-ui/cli@0.7.0

## 0.0.3

### Patch Changes

- Bump @cobalt-ui/utils version
- Updated dependencies
  - @cobalt-ui/cli@0.6.2

## 0.0.2

### Patch Changes

- 0d993c8: Fix main entry

## 0.0.1

### Minor Changes

- 8c92d45: Initial release: JS codegen with all the features of @cobalt-ui/plugin-ts and @cobalt-ui/plugin-json

### Patch Changes

- Updated dependencies [160200f]
  - @cobalt-ui/cli@0.6.0
