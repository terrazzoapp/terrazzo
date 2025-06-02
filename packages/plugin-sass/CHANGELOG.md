# @terrazzo/plugin-sass

## 0.8.0

### Minor Changes

- [#489](https://github.com/terrazzoapp/terrazzo/pull/489) [`63f91e6`](https://github.com/terrazzoapp/terrazzo/commit/63f91e6eee1bec5cf7fae3c1bffdde40a5604ec6) Thanks [@drwpow](https://github.com/drwpow)! - Use Rolldown for packaging 🚀

### Patch Changes

- Updated dependencies [[`63f91e6`](https://github.com/terrazzoapp/terrazzo/commit/63f91e6eee1bec5cf7fae3c1bffdde40a5604ec6)]:
  - @terrazzo/token-tools@0.8.0
  - @terrazzo/plugin-css@0.8.0
  - @terrazzo/cli@0.8.0

## 0.7.4

### Patch Changes

- Updated dependencies [[`84335da`](https://github.com/terrazzoapp/terrazzo/commit/84335da86adbe4cf112b91d8d9bfa1301c5492d4)]:
  - @terrazzo/cli@0.7.4
  - @terrazzo/plugin-css@0.7.4
  - @terrazzo/token-tools@0.7.4

## 0.7.3

### Patch Changes

- [#482](https://github.com/terrazzoapp/terrazzo/pull/482) [`abc14c4`](https://github.com/terrazzoapp/terrazzo/commit/abc14c4f59f21a1c7d05d613dacdebcd9d512838) Thanks [@drwpow](https://github.com/drwpow)! - Fix documentation links

- Updated dependencies [[`abc14c4`](https://github.com/terrazzoapp/terrazzo/commit/abc14c4f59f21a1c7d05d613dacdebcd9d512838)]:
  - @terrazzo/cli@0.7.3
  - @terrazzo/plugin-css@0.7.3
  - @terrazzo/token-tools@0.7.3

## 0.7.2

### Patch Changes

- [#477](https://github.com/terrazzoapp/terrazzo/pull/477) [`0e24810`](https://github.com/terrazzoapp/terrazzo/commit/0e248106b313e363edcfb1a27d11de619133af03) Thanks [@dzonatan](https://github.com/dzonatan)! - [plugin-css] add `baseSelector` option to css plugin to allow changing the root selector

## 0.7.1

### Patch Changes

- [#468](https://github.com/terrazzoapp/terrazzo/pull/468) [`2c28957`](https://github.com/terrazzoapp/terrazzo/commit/2c289579bee73eabcdf648fbdb99071fece9c018) Thanks [@drwpow](https://github.com/drwpow)! - When downsampling colors for sRGB gamut, preserve the originally-authored colorspace

- Updated dependencies [[`2c28957`](https://github.com/terrazzoapp/terrazzo/commit/2c289579bee73eabcdf648fbdb99071fece9c018)]:
  - @terrazzo/token-tools@0.7.1
  - @terrazzo/cli@0.7.1
  - @terrazzo/plugin-css@0.7.1

## 0.7.0

### Minor Changes

- [#454](https://github.com/terrazzoapp/terrazzo/pull/454) [`44ff082`](https://github.com/terrazzoapp/terrazzo/commit/44ff082ec3cc4034dcbcf7702f9676a631c99dde) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: the new color token object format uses "components" instead of "channels". Please update your tokens accordingly.

### Patch Changes

- Updated dependencies [[`44ff082`](https://github.com/terrazzoapp/terrazzo/commit/44ff082ec3cc4034dcbcf7702f9676a631c99dde)]:
  - @terrazzo/token-tools@0.7.0
  - @terrazzo/cli@0.7.0
  - @terrazzo/plugin-css@0.7.0

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
  - @terrazzo/plugin-css@0.6.0

## 0.5.0

### Minor Changes

- [#420](https://github.com/terrazzoapp/terrazzo/pull/420) [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a) Thanks [@drwpow](https://github.com/drwpow)! - fix: ⚠️ Breaking change: CSS aliases will revert to original 1.0 behavior and be “shallow,” meaning they’ll be preserved as-written. Terrazzo 2.0 (beta) attempted to simplify aliases to only be single-depth, but that results in unintentional behavior.

### Patch Changes

- [#420](https://github.com/terrazzoapp/terrazzo/pull/420) [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a) Thanks [@drwpow](https://github.com/drwpow)! - fix: Improve reverse alias lookups (needed for plugin-css, where redeclared base tokens need downstream aliases to be redeclared too, so the values aren’t stale)

- [#419](https://github.com/terrazzoapp/terrazzo/pull/419) [`3962918`](https://github.com/terrazzoapp/terrazzo/commit/3962918b25af69fad7833d0399aee5bae0033d4f) Thanks [@drwpow](https://github.com/drwpow)! - Improve CLI logging and debugging for performance testing

- Updated dependencies [[`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a), [`3962918`](https://github.com/terrazzoapp/terrazzo/commit/3962918b25af69fad7833d0399aee5bae0033d4f), [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a), [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a), [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a)]:
  - @terrazzo/plugin-css@0.5.0
  - @terrazzo/cli@0.5.0
  - @terrazzo/token-tools@0.5.0

## 0.4.0

### Minor Changes

- [#416](https://github.com/terrazzoapp/terrazzo/pull/416) [`822c956`](https://github.com/terrazzoapp/terrazzo/commit/822c95666c18da1c591ee232e6f62cc1b1ae968d) Thanks [@drwpow](https://github.com/drwpow)! - fix: ⚠️ Breaking change: CSS variables updated to closer match Cobalt 1.0 behavior

### Patch Changes

- Updated dependencies [[`822c956`](https://github.com/terrazzoapp/terrazzo/commit/822c95666c18da1c591ee232e6f62cc1b1ae968d), [`822c956`](https://github.com/terrazzoapp/terrazzo/commit/822c95666c18da1c591ee232e6f62cc1b1ae968d)]:
  - @terrazzo/token-tools@0.4.0
  - @terrazzo/cli@0.4.0

## 0.3.1

### Patch Changes

- [#411](https://github.com/terrazzoapp/terrazzo/pull/411) [`2ad079c`](https://github.com/terrazzoapp/terrazzo/commit/2ad079c06dcdb3b0241e678b1625f202a4ec92b1) Thanks [@drwpow](https://github.com/drwpow)! - fix: Bug in pnpm workspaces

- Updated dependencies [[`7e3d513`](https://github.com/terrazzoapp/terrazzo/commit/7e3d513e5bcde5e613cde35d367d49c6a46293a1), [`2ad079c`](https://github.com/terrazzoapp/terrazzo/commit/2ad079c06dcdb3b0241e678b1625f202a4ec92b1)]:
  - @terrazzo/plugin-css@0.3.2

## 0.3.0

### Minor Changes

- [#391](https://github.com/terrazzoapp/terrazzo/pull/391) [`8e6810c`](https://github.com/terrazzoapp/terrazzo/commit/8e6810c33aded376aca58ebf2f28ad20aa3a06b1) Thanks [@drwpow](https://github.com/drwpow)! - fix: ⚠️ Breaking change: Remove dash around numbers in CSS var names

### Patch Changes

- Updated dependencies [[`8e6810c`](https://github.com/terrazzoapp/terrazzo/commit/8e6810c33aded376aca58ebf2f28ad20aa3a06b1)]:
  - @terrazzo/cli@0.3.0
  - @terrazzo/plugin-css@0.3.0

## 0.2.0

### Minor Changes

- Reconcile types with latest changes from @terrazzo/cli and @terrazzo/parser

## 0.1.1

### Patch Changes

- Updated dependencies [[`b90287c`](https://github.com/terrazzoapp/terrazzo/commit/b90287cb13dc3bfdb24b8d6698931c7d156c3638)]:
  - @terrazzo/token-tools@0.1.3
  - @terrazzo/plugin-css@0.1.2
  - @terrazzo/cli@0.1.3

## 0.1.0

### Minor Changes

- [#319](https://github.com/terrazzoapp/terrazzo/pull/319) [`e7f272d`](https://github.com/terrazzoapp/terrazzo/commit/e7f272defcd889f5a410fdbd30497cf704671b32) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: dimension and duration tokens normalize to object syntax in plugins (following upcoming changes in DTCG spec; see https://github.com/design-tokens/community-group/pull/244).

### Patch Changes

- Updated dependencies [[`e7f272d`](https://github.com/terrazzoapp/terrazzo/commit/e7f272defcd889f5a410fdbd30497cf704671b32)]:
  - @terrazzo/token-tools@0.1.0
  - @terrazzo/plugin-css@0.1.0
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
  - @terrazzo/plugin-css@0.0.10
  - @terrazzo/cli@0.0.12
