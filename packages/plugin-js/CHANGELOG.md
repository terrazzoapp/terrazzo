# @terrazzo/plugin-js

## 0.5.0

### Minor Changes

- [#420](https://github.com/terrazzoapp/terrazzo/pull/420) [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a) Thanks [@drwpow](https://github.com/drwpow)! - fix: ⚠️ Breaking change: CSS aliases will revert to original 1.0 behavior and be “shallow,” meaning they’ll be preserved as-written. Terrazzo 2.0 (beta) attempted to simplify aliases to only be single-depth, but that results in unintentional behavior.

### Patch Changes

- [#420](https://github.com/terrazzoapp/terrazzo/pull/420) [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a) Thanks [@drwpow](https://github.com/drwpow)! - fix: Improve reverse alias lookups (needed for plugin-css, where redeclared base tokens need downstream aliases to be redeclared too, so the values aren’t stale)

- [#419](https://github.com/terrazzoapp/terrazzo/pull/419) [`3962918`](https://github.com/terrazzoapp/terrazzo/commit/3962918b25af69fad7833d0399aee5bae0033d4f) Thanks [@drwpow](https://github.com/drwpow)! - Improve CLI logging and debugging for performance testing

- Updated dependencies [[`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a), [`3962918`](https://github.com/terrazzoapp/terrazzo/commit/3962918b25af69fad7833d0399aee5bae0033d4f), [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a), [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a), [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a)]:
  - @terrazzo/cli@0.5.0
  - @terrazzo/token-tools@0.5.0

## 0.4.0

### Minor Changes

- [#416](https://github.com/terrazzoapp/terrazzo/pull/416) [`822c956`](https://github.com/terrazzoapp/terrazzo/commit/822c95666c18da1c591ee232e6f62cc1b1ae968d) Thanks [@drwpow](https://github.com/drwpow)! - fix: ⚠️ Breaking change: CSS variables updated to closer match Cobalt 1.0 behavior

### Patch Changes

- Updated dependencies [[`822c956`](https://github.com/terrazzoapp/terrazzo/commit/822c95666c18da1c591ee232e6f62cc1b1ae968d), [`822c956`](https://github.com/terrazzoapp/terrazzo/commit/822c95666c18da1c591ee232e6f62cc1b1ae968d)]:
  - @terrazzo/token-tools@0.4.0
  - @terrazzo/cli@0.4.0

## 0.3.0

### Minor Changes

- [#411](https://github.com/terrazzoapp/terrazzo/pull/411) [`2ad079c`](https://github.com/terrazzoapp/terrazzo/commit/2ad079c06dcdb3b0241e678b1625f202a4ec92b1) Thanks [@drwpow](https://github.com/drwpow)! - fix: Bug in pnpm workspaces

## 0.2.0

### Minor Changes

- Reconcile types with latest changes from @terrazzo/cli and @terrazzo/parser

## 0.1.1

### Patch Changes

- [#347](https://github.com/terrazzoapp/terrazzo/pull/347) [`b90287c`](https://github.com/terrazzoapp/terrazzo/commit/b90287cb13dc3bfdb24b8d6698931c7d156c3638) Thanks [@tomasfrancisco](https://github.com/tomasfrancisco)! - Add support for inset shadows

- Updated dependencies [[`b90287c`](https://github.com/terrazzoapp/terrazzo/commit/b90287cb13dc3bfdb24b8d6698931c7d156c3638)]:
  - @terrazzo/token-tools@0.1.3
  - @terrazzo/cli@0.1.3

## 0.1.0

### Minor Changes

- [#319](https://github.com/terrazzoapp/terrazzo/pull/319) [`e7f272d`](https://github.com/terrazzoapp/terrazzo/commit/e7f272defcd889f5a410fdbd30497cf704671b32) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: dimension and duration tokens normalize to object syntax in plugins (following upcoming changes in DTCG spec; see https://github.com/design-tokens/community-group/pull/244).

### Patch Changes

- Updated dependencies [[`e7f272d`](https://github.com/terrazzoapp/terrazzo/commit/e7f272defcd889f5a410fdbd30497cf704671b32)]:
  - @terrazzo/token-tools@0.1.0
  - @terrazzo/cli@0.1.0

## 0.0.3

### Patch Changes

- Updated dependencies [[`d0a9df4`](https://github.com/terrazzoapp/terrazzo/commit/d0a9df43ccabd10ea338e12cbfcfbd7e00952d28)]:
  - @terrazzo/cli@0.0.17

## 0.0.2

### Patch Changes

- [#285](https://github.com/terrazzoapp/terrazzo/pull/285) [`e8a0df1`](https://github.com/terrazzoapp/terrazzo/commit/e8a0df1f3b50cf7cb292bcc475aae271feae4569) Thanks [@drwpow](https://github.com/drwpow)! - Add support for multiple token files

- Updated dependencies [[`e8a0df1`](https://github.com/terrazzoapp/terrazzo/commit/e8a0df1f3b50cf7cb292bcc475aae271feae4569)]:
  - @terrazzo/token-tools@0.0.6
  - @terrazzo/cli@0.0.12
