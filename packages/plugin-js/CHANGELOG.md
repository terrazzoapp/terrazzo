# @terrazzo/plugin-js

## 2.0.0

### Minor Changes

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: lint on plugins no longer runs on individual files, rather, the full set once merged.

  If your lint plugin is not using the `src` context value, no changes are needed. If it is, you’ll need to instead read from the `sources` array, and look up sources with a token’s `source.loc` filename manually. This change was because lint rules now run on all files in one pass, essentially.

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ [Plugin API] Minor breaking change: token.originalValue may be undefined for tokens created with $ref. This shouldn’t affect any tokens or plugins not using $refs. But going forward this value will be missing if the token was created dynamically via $ref.

### Patch Changes

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - Validation moved to lint rules, which means token validation can be individually configured, and optionally extended.
- [#553](https://github.com/terrazzoapp/terrazzo/pull/553) [`e63a627`](https://github.com/terrazzoapp/terrazzo/commit/e63a6277f61282fb608744a8348689b16f977076) Thanks [@Sidnioulz](https://github.com/Sidnioulz)! - Add support for the Token Listing format

## 0.10.3

### Patch Changes

- [#533](https://github.com/terrazzoapp/terrazzo/pull/533) [`e1a612f`](https://github.com/terrazzoapp/terrazzo/commit/e1a612f2297662b1dfd4ca517c83b9679960a5cf) Thanks [@pvignau](https://github.com/pvignau)! - Auto-install CSS plugin with Sass during init

- Updated dependencies [[`6141d4f`](https://github.com/terrazzoapp/terrazzo/commit/6141d4f5a9790be73b314c517d9da010f237814e)]:
  - @terrazzo/parser@0.10.3

## 0.10.1

### Patch Changes

- [#510](https://github.com/terrazzoapp/terrazzo/pull/510) [`4493731`](https://github.com/terrazzoapp/terrazzo/commit/4493731a4d458af45a1bb4c56e3fe0d42d66aeef) Thanks [@drwpow](https://github.com/drwpow)! - Reduce decimal places in color output.
  - [plugin-css] ⚠️ Minor breaking change: decimals have been simplified in output. To restore original behavior, pass in `colorDepth: 'unlimited'`

- Updated dependencies [[`4493731`](https://github.com/terrazzoapp/terrazzo/commit/4493731a4d458af45a1bb4c56e3fe0d42d66aeef)]:
  - @terrazzo/token-tools@0.10.1
  - @terrazzo/cli@0.10.1

## 0.10.0

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

## 0.9.1

### Patch Changes

- [#502](https://github.com/terrazzoapp/terrazzo/pull/502) [`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug in parsing LAB colors

- [#502](https://github.com/terrazzoapp/terrazzo/pull/502) [`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59) Thanks [@drwpow](https://github.com/drwpow)! - Add support for lab65 colors (not technically part of CSS Module 4 spec, but a nice convenience)

- Updated dependencies [[`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59), [`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59)]:
  - @terrazzo/token-tools@0.9.1
  - @terrazzo/cli@0.9.1

## 0.9.0

### Minor Changes

- [#497](https://github.com/terrazzoapp/terrazzo/pull/497) [`9b80fd4`](https://github.com/terrazzoapp/terrazzo/commit/9b80fd4edd1198021d8e309483e8cd8551fe79dc) Thanks [@bschlenk](https://github.com/bschlenk)! - - potential 5x speedup for @terrazzo/plugin-css
  - removed isTokenMatch from @terrazzo/token-tools

### Patch Changes

- Updated dependencies [[`9b80fd4`](https://github.com/terrazzoapp/terrazzo/commit/9b80fd4edd1198021d8e309483e8cd8551fe79dc)]:
  - @terrazzo/cli@0.9.0
  - @terrazzo/token-tools@0.9.0

## 0.8.1

### Patch Changes

- Updated dependencies [[`5edf1fd`](https://github.com/terrazzoapp/terrazzo/commit/5edf1fde42cd53b5883eefcbe849dc5749cfaa8f)]:
  - @terrazzo/cli@0.8.1
  - @terrazzo/token-tools@0.8.1

## 0.8.0

### Minor Changes

- [#489](https://github.com/terrazzoapp/terrazzo/pull/489) [`63f91e6`](https://github.com/terrazzoapp/terrazzo/commit/63f91e6eee1bec5cf7fae3c1bffdde40a5604ec6) Thanks [@drwpow](https://github.com/drwpow)! - Use Rolldown for packaging 🚀

### Patch Changes

- Updated dependencies [[`63f91e6`](https://github.com/terrazzoapp/terrazzo/commit/63f91e6eee1bec5cf7fae3c1bffdde40a5604ec6)]:
  - @terrazzo/token-tools@0.8.0
  - @terrazzo/cli@0.8.0

## 0.7.3

### Patch Changes

- [#485](https://github.com/terrazzoapp/terrazzo/pull/485) [`84335da`](https://github.com/terrazzoapp/terrazzo/commit/84335da86adbe4cf112b91d8d9bfa1301c5492d4) Thanks [@drwpow](https://github.com/drwpow)! - Add transform API to allow dynamic parsing / transformation of tokens on load

- Updated dependencies [[`84335da`](https://github.com/terrazzoapp/terrazzo/commit/84335da86adbe4cf112b91d8d9bfa1301c5492d4)]:
  - @terrazzo/cli@0.7.4
  - @terrazzo/token-tools@0.7.4

## 0.7.2

### Patch Changes

- [#482](https://github.com/terrazzoapp/terrazzo/pull/482) [`abc14c4`](https://github.com/terrazzoapp/terrazzo/commit/abc14c4f59f21a1c7d05d613dacdebcd9d512838) Thanks [@drwpow](https://github.com/drwpow)! - Fix documentation links

- Updated dependencies [[`abc14c4`](https://github.com/terrazzoapp/terrazzo/commit/abc14c4f59f21a1c7d05d613dacdebcd9d512838)]:
  - @terrazzo/cli@0.7.3
  - @terrazzo/token-tools@0.7.3

## 0.7.1

### Patch Changes

- [#468](https://github.com/terrazzoapp/terrazzo/pull/468) [`2c28957`](https://github.com/terrazzoapp/terrazzo/commit/2c289579bee73eabcdf648fbdb99071fece9c018) Thanks [@drwpow](https://github.com/drwpow)! - When downsampling colors for sRGB gamut, preserve the originally-authored colorspace

- Updated dependencies [[`2c28957`](https://github.com/terrazzoapp/terrazzo/commit/2c289579bee73eabcdf648fbdb99071fece9c018)]:
  - @terrazzo/token-tools@0.7.1
  - @terrazzo/cli@0.7.1

## 0.7.0

### Minor Changes

- [#454](https://github.com/terrazzoapp/terrazzo/pull/454) [`44ff082`](https://github.com/terrazzoapp/terrazzo/commit/44ff082ec3cc4034dcbcf7702f9676a631c99dde) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: the new color token object format uses "components" instead of "channels". Please update your tokens accordingly.

### Patch Changes

- Updated dependencies [[`44ff082`](https://github.com/terrazzoapp/terrazzo/commit/44ff082ec3cc4034dcbcf7702f9676a631c99dde)]:
  - @terrazzo/token-tools@0.7.0
  - @terrazzo/cli@0.7.0

## 0.6.0

### Minor Changes

- [#425](https://github.com/terrazzoapp/terrazzo/pull/425) [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4) Thanks [@drwpow](https://github.com/drwpow)! - feat: ⚠️ Breaking change: aliasing to specific modes (`#` character) is deprecated. It was an experimental feature in Cobalt 1.0 with unpredictable behavior. In some upcoming spec changes it will be incompatible with advanced usecases.

- [#425](https://github.com/terrazzoapp/terrazzo/pull/425) [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4) Thanks [@drwpow](https://github.com/drwpow)! - fix: Improvements to mode aliasing and mode overrides. `typography` tokens only have to partially-declare overrides for modes, while keeping their core set. While this has been supported, behavior was buggy and sometimes was inconsistent.

- [#425](https://github.com/terrazzoapp/terrazzo/pull/425) [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: cubicBezier tokens no longer support aliases as values, in line with the spec.

### Patch Changes

- [#425](https://github.com/terrazzoapp/terrazzo/pull/425) [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4) Thanks [@drwpow](https://github.com/drwpow)! - fix: [plugin-css] Font Family names without spaces no longer get quotes.

  fix: Font Family tokens are always normalized to an array internally for easier parsing.

- [#425](https://github.com/terrazzoapp/terrazzo/pull/425) [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4) Thanks [@drwpow](https://github.com/drwpow)! - feat: @terrazzo/plugin-css now returns entire token for `variableName`. This is a minor breaking change from `variableName(name: string)` → `variableName(token: Token)`, but current users can just use `token.id` to get the same value as before.

  ⚠️ Minor internal breaking change as a result: `transformCSSValue()` in @terrazzo/token-tools now requires entire token️ to make this possible.

- [#425](https://github.com/terrazzoapp/terrazzo/pull/425) [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4) Thanks [@drwpow](https://github.com/drwpow)! - fix: ⚠️ [plugin-css] Minor breaking change: transition tokens no longer generate variables for sub-parts. This is a change done in service to better protect “allowed” token usage. If you want consumers to be able to “break apart” tokens, then they must also exist as individual tokens that get aliased.

- Updated dependencies [[`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4)]:
  - @terrazzo/token-tools@0.6.0
  - @terrazzo/cli@0.6.0

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
