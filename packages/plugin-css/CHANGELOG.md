# @terrazzo/plugin-css

## 0.3.2

### Patch Changes

- [#412](https://github.com/terrazzoapp/terrazzo/pull/412) [`7e3d513`](https://github.com/terrazzoapp/terrazzo/commit/7e3d513e5bcde5e613cde35d367d49c6a46293a1) Thanks [@drwpow](https://github.com/drwpow)! - Add skipBuild option to skip generating .css files

- [#411](https://github.com/terrazzoapp/terrazzo/pull/411) [`2ad079c`](https://github.com/terrazzoapp/terrazzo/commit/2ad079c06dcdb3b0241e678b1625f202a4ec92b1) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug in pnpm workspaces

## 0.3.1

### Patch Changes

- [#408](https://github.com/terrazzoapp/terrazzo/pull/408) [`6f97566`](https://github.com/terrazzoapp/terrazzo/commit/6f97566ea83b7bcb42befd36aa618d52ec6e758f) Thanks [@drwpow](https://github.com/drwpow)! - Critical fix: plugin-css didn’t scope values properly

- [#408](https://github.com/terrazzoapp/terrazzo/pull/408) [`6f97566`](https://github.com/terrazzoapp/terrazzo/commit/6f97566ea83b7bcb42befd36aa618d52ec6e758f) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug where setTransform() would not properly deduplicate token values

- Updated dependencies [[`6f97566`](https://github.com/terrazzoapp/terrazzo/commit/6f97566ea83b7bcb42befd36aa618d52ec6e758f)]:
  - @terrazzo/cli@0.3.4

## 0.3.0

### Minor Changes

- [#391](https://github.com/terrazzoapp/terrazzo/pull/391) [`8e6810c`](https://github.com/terrazzoapp/terrazzo/commit/8e6810c33aded376aca58ebf2f28ad20aa3a06b1) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: Remove dash around numbers in CSS var names

### Patch Changes

- Updated dependencies [[`8e6810c`](https://github.com/terrazzoapp/terrazzo/commit/8e6810c33aded376aca58ebf2f28ad20aa3a06b1)]:
  - @terrazzo/cli@0.3.0

## 0.2.0

### Minor Changes

- Reconcile types with latest changes from @terrazzo/cli and @terrazzo/parser

## 0.1.2

### Patch Changes

- [#347](https://github.com/terrazzoapp/terrazzo/pull/347) [`b90287c`](https://github.com/terrazzoapp/terrazzo/commit/b90287cb13dc3bfdb24b8d6698931c7d156c3638) Thanks [@tomasfrancisco](https://github.com/tomasfrancisco)! - Add support for inset shadows

- Updated dependencies [[`b90287c`](https://github.com/terrazzoapp/terrazzo/commit/b90287cb13dc3bfdb24b8d6698931c7d156c3638)]:
  - @terrazzo/token-tools@0.1.3
  - @terrazzo/parser@0.1.3
  - @terrazzo/cli@0.1.3

## 0.1.1

### Patch Changes

- [#339](https://github.com/terrazzoapp/terrazzo/pull/339) [`9197405`](https://github.com/terrazzoapp/terrazzo/commit/9197405209d560f406494b6bd7aa1634608999c6) Thanks [@tomasfrancisco](https://github.com/tomasfrancisco)! - Fix missing letter spacing transformation as a dimension token

- [#341](https://github.com/terrazzoapp/terrazzo/pull/341) [`a637f67`](https://github.com/terrazzoapp/terrazzo/commit/a637f67e20009ce5eef1d5bc5b115cfa00b002d4) Thanks [@drwpow](https://github.com/drwpow)! - Fix 0 durations missing units in CSS

- Updated dependencies [[`9197405`](https://github.com/terrazzoapp/terrazzo/commit/9197405209d560f406494b6bd7aa1634608999c6), [`a637f67`](https://github.com/terrazzoapp/terrazzo/commit/a637f67e20009ce5eef1d5bc5b115cfa00b002d4)]:
  - @terrazzo/token-tools@0.1.1
  - @terrazzo/parser@0.1.1
  - @terrazzo/cli@0.1.1

## 0.1.0

### Minor Changes

- [#319](https://github.com/terrazzoapp/terrazzo/pull/319) [`e7f272d`](https://github.com/terrazzoapp/terrazzo/commit/e7f272defcd889f5a410fdbd30497cf704671b32) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: dimension and duration tokens normalize to object syntax in plugins (following upcoming changes in DTCG spec; see https://github.com/design-tokens/community-group/pull/244).

### Patch Changes

- Updated dependencies [[`e7f272d`](https://github.com/terrazzoapp/terrazzo/commit/e7f272defcd889f5a410fdbd30497cf704671b32)]:
  - @terrazzo/token-tools@0.1.0
  - @terrazzo/parser@0.1.0
  - @terrazzo/cli@0.1.0

## 0.0.11

### Patch Changes

- [#302](https://github.com/terrazzoapp/terrazzo/pull/302) [`d0a9df4`](https://github.com/terrazzoapp/terrazzo/commit/d0a9df43ccabd10ea338e12cbfcfbd7e00952d28) Thanks [@drwpow](https://github.com/drwpow)! - Fix parser bug with partialAliasOf that would lead to incorrect final values when aliasing

- Updated dependencies [[`d0a9df4`](https://github.com/terrazzoapp/terrazzo/commit/d0a9df43ccabd10ea338e12cbfcfbd7e00952d28)]:
  - @terrazzo/parser@0.0.17
  - @terrazzo/cli@0.0.17

## 0.0.10

### Patch Changes

- [#285](https://github.com/terrazzoapp/terrazzo/pull/285) [`e8a0df1`](https://github.com/terrazzoapp/terrazzo/commit/e8a0df1f3b50cf7cb292bcc475aae271feae4569) Thanks [@drwpow](https://github.com/drwpow)! - Add support for multiple token files

- Updated dependencies [[`e8a0df1`](https://github.com/terrazzoapp/terrazzo/commit/e8a0df1f3b50cf7cb292bcc475aae271feae4569)]:
  - @terrazzo/token-tools@0.0.6
  - @terrazzo/parser@0.0.12
  - @terrazzo/cli@0.0.12
