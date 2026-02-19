# @terrazzo/plugin-tailwind

## 2.0.0

### Minor Changes

- Fully supports DTCG 2025.10 and resolvers.

- ⚠️ Breaking change: plugin-tailwind now uses [Custom variants](https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually) which allow for closer 1:1 translation from tokens.
  - This results in a config change from `modeVariations` → `customVariants`.

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: lint on plugins no longer runs on individual files, rather, the full set once merged.

  If your lint plugin is not using the `src` context value, no changes are needed. If it is, you’ll need to instead read from the `sources` array, and look up sources with a token’s `source.loc` filename manually. This change was because lint rules now run on all files in one pass, essentially.

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ [Plugin API] Minor breaking change: token.originalValue may be undefined for tokens created with $ref. This shouldn’t affect any tokens or plugins not using $refs. But going forward this value will be missing if the token was created dynamically via $ref.

- [#646](https://github.com/terrazzoapp/terrazzo/pull/646) [`fd9de2b`](https://github.com/terrazzoapp/terrazzo/commit/fd9de2b4a93f42e1f1bfd81cf4a63475b506488d) Thanks [@9rotama](https://github.com/9rotama)! - feat: add template option to plugin-tailwind

### Patch Changes

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - Validation moved to lint rules, which means token validation can be individually configured, and optionally extended.

- [#568](https://github.com/terrazzoapp/terrazzo/pull/568) [`67c75be`](https://github.com/terrazzoapp/terrazzo/commit/67c75be78978cece52b61cf258ccc3a875e6af48) Thanks [@drwpow](https://github.com/drwpow)! - Fix border tokens not cascading correctly across modes

## 0.3.3

### Patch Changes

- [#550](https://github.com/terrazzoapp/terrazzo/pull/550) [`936789e`](https://github.com/terrazzoapp/terrazzo/commit/936789eb0604c5d8adfa256f16322d11fd99da6a) Thanks [@nlemoine](https://github.com/nlemoine)! - Add support for color-scheme property

- Updated dependencies [[`936789e`](https://github.com/terrazzoapp/terrazzo/commit/936789eb0604c5d8adfa256f16322d11fd99da6a)]:
  - @terrazzo/plugin-css@0.10.4

## 0.3.2

### Patch Changes

- [#513](https://github.com/terrazzoapp/terrazzo/pull/513) [`7bb2b26`](https://github.com/terrazzoapp/terrazzo/commit/7bb2b2612e00df34f15f75f6bd5c7251163b9783) Thanks [@camerondubas](https://github.com/camerondubas)! - fix tailwind import

## 0.3.1

### Patch Changes

- [#510](https://github.com/terrazzoapp/terrazzo/pull/510) [`4493731`](https://github.com/terrazzoapp/terrazzo/commit/4493731a4d458af45a1bb4c56e3fe0d42d66aeef) Thanks [@drwpow](https://github.com/drwpow)! - Reduce decimal places in color output.
  - [plugin-css] ⚠️ Minor breaking change: decimals have been simplified in output. To restore original behavior, pass in `colorDepth: 'unlimited'`

- Updated dependencies [[`4493731`](https://github.com/terrazzoapp/terrazzo/commit/4493731a4d458af45a1bb4c56e3fe0d42d66aeef)]:
  - @terrazzo/token-tools@0.10.1
  - @terrazzo/plugin-css@0.10.1
  - @terrazzo/cli@0.10.1

## 0.3.0

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
  - @terrazzo/token-tools@0.10.0
  - @terrazzo/cli@0.10.0
  - @terrazzo/plugin-css@0.10.0

## 0.2.1

### Patch Changes

- [#502](https://github.com/terrazzoapp/terrazzo/pull/502) [`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug in parsing LAB colors

- [#502](https://github.com/terrazzoapp/terrazzo/pull/502) [`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59) Thanks [@drwpow](https://github.com/drwpow)! - Add support for lab65 colors (not technically part of CSS Module 4 spec, but a nice convenience)

- Updated dependencies [[`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59), [`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59)]:
  - @terrazzo/token-tools@0.9.1
  - @terrazzo/cli@0.9.1
  - @terrazzo/plugin-css@0.9.1

## 0.2.0

### Minor Changes

- [#497](https://github.com/terrazzoapp/terrazzo/pull/497) [`9b80fd4`](https://github.com/terrazzoapp/terrazzo/commit/9b80fd4edd1198021d8e309483e8cd8551fe79dc) Thanks [@bschlenk](https://github.com/bschlenk)! - - potential 5x speedup for @terrazzo/plugin-css
  - removed isTokenMatch from @terrazzo/token-tools

### Patch Changes

- Updated dependencies [[`9b80fd4`](https://github.com/terrazzoapp/terrazzo/commit/9b80fd4edd1198021d8e309483e8cd8551fe79dc)]:
  - @terrazzo/cli@0.9.0
  - @terrazzo/plugin-css@0.9.0
  - @terrazzo/token-tools@0.9.0

## 0.1.0

### Minor Changes

- [#489](https://github.com/terrazzoapp/terrazzo/pull/489) [`63f91e6`](https://github.com/terrazzoapp/terrazzo/commit/63f91e6eee1bec5cf7fae3c1bffdde40a5604ec6) Thanks [@drwpow](https://github.com/drwpow)! - Use Rolldown for packaging 🚀

### Patch Changes

- Updated dependencies [[`63f91e6`](https://github.com/terrazzoapp/terrazzo/commit/63f91e6eee1bec5cf7fae3c1bffdde40a5604ec6)]:
  - @terrazzo/token-tools@0.8.0
  - @terrazzo/plugin-css@0.8.0
  - @terrazzo/cli@0.8.0

## 0.0.4

### Patch Changes

- [#485](https://github.com/terrazzoapp/terrazzo/pull/485) [`84335da`](https://github.com/terrazzoapp/terrazzo/commit/84335da86adbe4cf112b91d8d9bfa1301c5492d4) Thanks [@drwpow](https://github.com/drwpow)! - Add transform API to allow dynamic parsing / transformation of tokens on load

- Updated dependencies [[`84335da`](https://github.com/terrazzoapp/terrazzo/commit/84335da86adbe4cf112b91d8d9bfa1301c5492d4)]:
  - @terrazzo/cli@0.7.4
  - @terrazzo/plugin-css@0.7.4
  - @terrazzo/token-tools@0.7.4

## 0.0.3

### Patch Changes

- Updated dependencies [[`abc14c4`](https://github.com/terrazzoapp/terrazzo/commit/abc14c4f59f21a1c7d05d613dacdebcd9d512838)]:
  - @terrazzo/cli@0.7.3
  - @terrazzo/plugin-css@0.7.3
  - @terrazzo/token-tools@0.7.3

## 0.0.2

### Patch Changes

- [#477](https://github.com/terrazzoapp/terrazzo/pull/477) [`0e24810`](https://github.com/terrazzoapp/terrazzo/commit/0e248106b313e363edcfb1a27d11de619133af03) Thanks [@dzonatan](https://github.com/dzonatan)! - [plugin-css] add `baseSelector` option to css plugin to allow changing the root selector

## 0.0.1

### Patch Changes

- [#411](https://github.com/terrazzoapp/terrazzo/pull/411) [`2ad079c`](https://github.com/terrazzoapp/terrazzo/commit/2ad079c06dcdb3b0241e678b1625f202a4ec92b1) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug in pnpm workspaces

- Updated dependencies [[`7e3d513`](https://github.com/terrazzoapp/terrazzo/commit/7e3d513e5bcde5e613cde35d367d49c6a46293a1), [`2ad079c`](https://github.com/terrazzoapp/terrazzo/commit/2ad079c06dcdb3b0241e678b1625f202a4ec92b1)]:
  - @terrazzo/plugin-css@0.3.2
