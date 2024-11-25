# @terrazzo/cli

## 0.2.0

### Minor Changes

- [#353](https://github.com/terrazzoapp/terrazzo/pull/353) [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa) Thanks [@drwpow](https://github.com/drwpow)! - Add lint API

### Patch Changes

- [#353](https://github.com/terrazzoapp/terrazzo/pull/353) [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa) Thanks [@drwpow](https://github.com/drwpow)! - Create terrazzo.config.mjs by default (still likely a person’s package is CJS by default)

- [#353](https://github.com/terrazzoapp/terrazzo/pull/353) [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa) Thanks [@drwpow](https://github.com/drwpow)! - Add support for $deprecated tokens

- [#353](https://github.com/terrazzoapp/terrazzo/pull/353) [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa) Thanks [@drwpow](https://github.com/drwpow)! - Ditch yargs-parser in favor of native Node parseArgs

- Updated dependencies [[`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa), [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa), [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa), [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa), [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa)]:
  - @terrazzo/token-tools@0.2.0
  - @terrazzo/parser@0.2.0

## 0.1.3

### Patch Changes

- Updated dependencies [[`b90287c`](https://github.com/terrazzoapp/terrazzo/commit/b90287cb13dc3bfdb24b8d6698931c7d156c3638)]:
  - @terrazzo/token-tools@0.1.3
  - @terrazzo/parser@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [[`4bd7b85`](https://github.com/terrazzoapp/terrazzo/commit/4bd7b85427267728ba8c3ffd80aa4e01e8616c98)]:
  - @terrazzo/token-tools@0.1.2
  - @terrazzo/parser@0.1.2

## 0.1.1

### Patch Changes

- Updated dependencies [[`9197405`](https://github.com/terrazzoapp/terrazzo/commit/9197405209d560f406494b6bd7aa1634608999c6), [`a637f67`](https://github.com/terrazzoapp/terrazzo/commit/a637f67e20009ce5eef1d5bc5b115cfa00b002d4)]:
  - @terrazzo/token-tools@0.1.1
  - @terrazzo/parser@0.1.1

## 0.1.0

### Minor Changes

- [#319](https://github.com/terrazzoapp/terrazzo/pull/319) [`e7f272d`](https://github.com/terrazzoapp/terrazzo/commit/e7f272defcd889f5a410fdbd30497cf704671b32) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: dimension and duration tokens normalize to object syntax in plugins (following upcoming changes in DTCG spec; see https://github.com/design-tokens/community-group/pull/244).

### Patch Changes

- Updated dependencies [[`e7f272d`](https://github.com/terrazzoapp/terrazzo/commit/e7f272defcd889f5a410fdbd30497cf704671b32)]:
  - @terrazzo/token-tools@0.1.0
  - @terrazzo/parser@0.1.0

## 0.0.19

### Patch Changes

- [#313](https://github.com/terrazzoapp/terrazzo/pull/313) [`1408594`](https://github.com/terrazzoapp/terrazzo/commit/1408594de029f57137c936dc2ff9ab949f039215) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug in gradient position aliasing

- [#313](https://github.com/terrazzoapp/terrazzo/pull/313) [`1408594`](https://github.com/terrazzoapp/terrazzo/commit/1408594de029f57137c936dc2ff9ab949f039215) Thanks [@drwpow](https://github.com/drwpow)! - Improve alias type validation

- Updated dependencies [[`1408594`](https://github.com/terrazzoapp/terrazzo/commit/1408594de029f57137c936dc2ff9ab949f039215), [`1408594`](https://github.com/terrazzoapp/terrazzo/commit/1408594de029f57137c936dc2ff9ab949f039215)]:
  - @terrazzo/parser@0.0.19

## 0.0.18

### Patch Changes

- [#305](https://github.com/terrazzoapp/terrazzo/pull/305) [`9ce829c`](https://github.com/terrazzoapp/terrazzo/commit/9ce829c37c8a068f7d7157b615d4a00472c33156) Thanks [@drwpow](https://github.com/drwpow)! - Don’t log AST node on error

- Updated dependencies [[`9ce829c`](https://github.com/terrazzoapp/terrazzo/commit/9ce829c37c8a068f7d7157b615d4a00472c33156)]:
  - @terrazzo/parser@0.0.18

## 0.0.17

### Patch Changes

- [#302](https://github.com/terrazzoapp/terrazzo/pull/302) [`d0a9df4`](https://github.com/terrazzoapp/terrazzo/commit/d0a9df43ccabd10ea338e12cbfcfbd7e00952d28) Thanks [@drwpow](https://github.com/drwpow)! - Fix parser bug with partialAliasOf that would lead to incorrect final values when aliasing

- Updated dependencies [[`d0a9df4`](https://github.com/terrazzoapp/terrazzo/commit/d0a9df43ccabd10ea338e12cbfcfbd7e00952d28)]:
  - @terrazzo/parser@0.0.17

## 0.0.13

### Patch Changes

- [#289](https://github.com/terrazzoapp/terrazzo/pull/289) [`0fc9738`](https://github.com/terrazzoapp/terrazzo/commit/0fc9738bb3dfecb680d225e4bd3970f21cfe8079) Thanks [@drwpow](https://github.com/drwpow)! - Add YAML support

- Updated dependencies [[`0fc9738`](https://github.com/terrazzoapp/terrazzo/commit/0fc9738bb3dfecb680d225e4bd3970f21cfe8079), [`6a875b1`](https://github.com/terrazzoapp/terrazzo/commit/6a875b163539dba8111911851a7819732056b3aa)]:
  - @terrazzo/parser@0.0.13

## 0.0.12

### Patch Changes

- [#285](https://github.com/terrazzoapp/terrazzo/pull/285) [`e8a0df1`](https://github.com/terrazzoapp/terrazzo/commit/e8a0df1f3b50cf7cb292bcc475aae271feae4569) Thanks [@drwpow](https://github.com/drwpow)! - Add support for multiple token files

- Updated dependencies [[`e8a0df1`](https://github.com/terrazzoapp/terrazzo/commit/e8a0df1f3b50cf7cb292bcc475aae271feae4569)]:
  - @terrazzo/token-tools@0.0.6
  - @terrazzo/parser@0.0.12
