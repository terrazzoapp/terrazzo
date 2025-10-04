# @terrazzo/plugin-vanilla-extract

## 1.0.0

### Minor Changes

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: lint on plugins no longer runs on individual files, rather, the full set once merged.

  If your lint plugin is not using the `src` context value, no changes are needed. If it is, you’ll need to instead read from the `sources` array, and look up sources with a token’s `source.loc` filename manually. This change was because lint rules now run on all files in one pass, essentially.

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ [Plugin API] Minor breaking change: token.originalValue may be undefined for tokens created with $ref. This shouldn’t affect any tokens or plugins not using $refs. But going forward this value will be missing if the token was created dynamically via $ref.

### Patch Changes

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - Validation moved to lint rules, which means token validation can be individually configured, and optionally extended.

- Updated dependencies [[`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3), [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3), [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3), [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3), [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3), [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3), [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3), [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3), [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3), [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3), [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3), [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3), [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3)]:
  - @terrazzo/cli@0.11.0
  - @terrazzo/plugin-css@1.0.0

## 0.2.2

### Patch Changes

- [#550](https://github.com/terrazzoapp/terrazzo/pull/550) [`936789e`](https://github.com/terrazzoapp/terrazzo/commit/936789eb0604c5d8adfa256f16322d11fd99da6a) Thanks [@nlemoine](https://github.com/nlemoine)! - Add support for color-scheme property

- Updated dependencies [[`936789e`](https://github.com/terrazzoapp/terrazzo/commit/936789eb0604c5d8adfa256f16322d11fd99da6a)]:
  - @terrazzo/plugin-css@0.10.4

## 0.2.1

### Patch Changes

- [#510](https://github.com/terrazzoapp/terrazzo/pull/510) [`4493731`](https://github.com/terrazzoapp/terrazzo/commit/4493731a4d458af45a1bb4c56e3fe0d42d66aeef) Thanks [@drwpow](https://github.com/drwpow)! - Reduce decimal places in color output.
  - [plugin-css] ⚠️ Minor breaking change: decimals have been simplified in output. To restore original behavior, pass in `colorDepth: 'unlimited'`

- Updated dependencies [[`4493731`](https://github.com/terrazzoapp/terrazzo/commit/4493731a4d458af45a1bb4c56e3fe0d42d66aeef)]:
  - @terrazzo/plugin-css@0.10.1
  - @terrazzo/cli@0.10.1

## 0.2.0

### Minor Changes

- [#507](https://github.com/terrazzoapp/terrazzo/pull/507) [`0060100`](https://github.com/terrazzoapp/terrazzo/commit/00601002a731dc009fb4ef2b438a01b087325a1a) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: remove HSV as a supported colorSpace, because it’s absent from CSS Color Module 4

- [#507](https://github.com/terrazzoapp/terrazzo/pull/507) [`0060100`](https://github.com/terrazzoapp/terrazzo/commit/00601002a731dc009fb4ef2b438a01b087325a1a) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: align color token ranges to CSS Color Module 4. This results in breaking changes to HSL and HWB, which normalize to `0 - 100`, rather than `0 - 1`:

  ```diff
    {
      "colorSpace": "hsl",
  -   "components": [270, 0.5, 0.4]
  +   "components": [270, 50, 40]
    }
  ```

  All other color spaces should be unaffected, as they were already matching CSS Color Module 4.

### Patch Changes

- [#507](https://github.com/terrazzoapp/terrazzo/pull/507) [`0060100`](https://github.com/terrazzoapp/terrazzo/commit/00601002a731dc009fb4ef2b438a01b087325a1a) Thanks [@drwpow](https://github.com/drwpow)! - Fix a98-rgb colorSpace, accidentally referring to it as "a98"

- Updated dependencies [[`0060100`](https://github.com/terrazzoapp/terrazzo/commit/00601002a731dc009fb4ef2b438a01b087325a1a), [`0060100`](https://github.com/terrazzoapp/terrazzo/commit/00601002a731dc009fb4ef2b438a01b087325a1a), [`0060100`](https://github.com/terrazzoapp/terrazzo/commit/00601002a731dc009fb4ef2b438a01b087325a1a)]:
  - @terrazzo/cli@0.10.0
  - @terrazzo/plugin-css@0.10.0

## 0.1.1

### Patch Changes

- [#502](https://github.com/terrazzoapp/terrazzo/pull/502) [`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug in parsing LAB colors

- [#502](https://github.com/terrazzoapp/terrazzo/pull/502) [`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59) Thanks [@drwpow](https://github.com/drwpow)! - Add support for lab65 colors (not technically part of CSS Module 4 spec, but a nice convenience)

- Updated dependencies [[`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59), [`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59)]:
  - @terrazzo/cli@0.9.1
  - @terrazzo/plugin-css@0.9.1

## 0.1.0

### Minor Changes

- Updated dependencies [[`9b80fd4`](https://github.com/terrazzoapp/terrazzo/commit/9b80fd4edd1198021d8e309483e8cd8551fe79dc)]:
  - @terrazzo/cli@0.9.0
  - @terrazzo/plugin-css@0.9.0

## 0.0.2

### Patch Changes

- [#495](https://github.com/terrazzoapp/terrazzo/pull/495) [`920cad6`](https://github.com/terrazzoapp/terrazzo/commit/920cad6cf5be1ad0dc17dda17f8b61018491fae2) Thanks [@drwpow](https://github.com/drwpow)! - Generate theme from contract, improve naming

## 0.0.1

Initial release
