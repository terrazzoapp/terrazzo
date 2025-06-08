# @terrazzo/token-tools

## 0.8.1

### Patch Changes

- [#491](https://github.com/terrazzoapp/terrazzo/pull/491) [`5edf1fd`](https://github.com/terrazzoapp/terrazzo/commit/5edf1fde42cd53b5883eefcbe849dc5749cfaa8f) Thanks [@drwpow](https://github.com/drwpow)! - Add warning on incorrect getTransforms() usage

## 0.8.0

### Minor Changes

- [#489](https://github.com/terrazzoapp/terrazzo/pull/489) [`63f91e6`](https://github.com/terrazzoapp/terrazzo/commit/63f91e6eee1bec5cf7fae3c1bffdde40a5604ec6) Thanks [@drwpow](https://github.com/drwpow)! - Use Rolldown for packaging 🚀

## 0.7.4

### Patch Changes

- [#485](https://github.com/terrazzoapp/terrazzo/pull/485) [`84335da`](https://github.com/terrazzoapp/terrazzo/commit/84335da86adbe4cf112b91d8d9bfa1301c5492d4) Thanks [@drwpow](https://github.com/drwpow)! - Add transform API to allow dynamic parsing / transformation of tokens on load

## 0.7.3

### Patch Changes

- [#482](https://github.com/terrazzoapp/terrazzo/pull/482) [`abc14c4`](https://github.com/terrazzoapp/terrazzo/commit/abc14c4f59f21a1c7d05d613dacdebcd9d512838) Thanks [@drwpow](https://github.com/drwpow)! - Fix documentation links

## 0.7.2

### Patch Changes

- [#477](https://github.com/terrazzoapp/terrazzo/pull/477) [`0e24810`](https://github.com/terrazzoapp/terrazzo/commit/0e248106b313e363edcfb1a27d11de619133af03) Thanks [@dzonatan](https://github.com/dzonatan)! - [plugin-css] add `baseSelector` option to css plugin to allow changing the root selector

## 0.7.1

### Patch Changes

- [#468](https://github.com/terrazzoapp/terrazzo/pull/468) [`2c28957`](https://github.com/terrazzoapp/terrazzo/commit/2c289579bee73eabcdf648fbdb99071fece9c018) Thanks [@drwpow](https://github.com/drwpow)! - When downsampling colors for sRGB gamut, preserve the originally-authored colorspace

## 0.7.0

### Minor Changes

- [#454](https://github.com/terrazzoapp/terrazzo/pull/454) [`44ff082`](https://github.com/terrazzoapp/terrazzo/commit/44ff082ec3cc4034dcbcf7702f9676a631c99dde) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: the new color token object format uses "components" instead of "channels". Please update your tokens accordingly.

## 0.6.3

### Patch Changes

- [#443](https://github.com/terrazzoapp/terrazzo/pull/443) [`8cc558f`](https://github.com/terrazzoapp/terrazzo/commit/8cc558ff98cef4eb36240918aa594905dfeb11ee) Thanks [@drwpow](https://github.com/drwpow)! - Bugfix: allow resolving from node_modules in @terrazzo/cli (note: @terrazzo/parser/JS API still runs in browser, so it still can’t resolve npm modules).

## 0.6.2

### Patch Changes

- [#440](https://github.com/terrazzoapp/terrazzo/pull/440) [`34e2cdc`](https://github.com/terrazzoapp/terrazzo/commit/34e2cdce27a578571e04eb006d3b209461a0fbbe) Thanks [@drwpow](https://github.com/drwpow)! - Add debug info for buildEnd

## 0.6.1

### Patch Changes

- [#427](https://github.com/terrazzoapp/terrazzo/pull/427) [`af57a80`](https://github.com/terrazzoapp/terrazzo/commit/af57a8010664e0e5b5b6eb5eef10779a4197da25) Thanks [@drwpow](https://github.com/drwpow)! - feat: `parse()` JS API doesn’t need an array for a single file (can just accept an object)

## 0.6.0

### Minor Changes

- [#425](https://github.com/terrazzoapp/terrazzo/pull/425) [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4) Thanks [@drwpow](https://github.com/drwpow)! - feat: ⚠️ Breaking change: aliasing to specific modes (`#` character) is deprecated. It was an experimental feature in Cobalt 1.0 with unpredictable behavior. In some upcoming spec changes it will be incompatible with advanced usecases.

- [#425](https://github.com/terrazzoapp/terrazzo/pull/425) [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4) Thanks [@drwpow](https://github.com/drwpow)! - fix: Improvements to mode aliasing and mode overrides. `typography` tokens only have to partially-declare overrides for modes, while keeping their core set. While this has been supported, behavior was buggy and sometimes was inconsistent.

- [#425](https://github.com/terrazzoapp/terrazzo/pull/425) [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: cubicBezier tokens no longer support aliases as values, in line with the spec.

### Patch Changes

- [#425](https://github.com/terrazzoapp/terrazzo/pull/425) [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4) Thanks [@drwpow](https://github.com/drwpow)! - fix: Improved handling of modes partially overriding object tokens (e.g. typography modes modifying a single value). In plugin-css, for instance, you may notice more output, but it’s done for safer style generation.

- [#425](https://github.com/terrazzoapp/terrazzo/pull/425) [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4) Thanks [@drwpow](https://github.com/drwpow)! - feat: Further improved reverse alias lookups to be more accurate and more complete

- [#425](https://github.com/terrazzoapp/terrazzo/pull/425) [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4) Thanks [@drwpow](https://github.com/drwpow)! - fix: Better error messages on alias mismatches

- [#425](https://github.com/terrazzoapp/terrazzo/pull/425) [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4) Thanks [@drwpow](https://github.com/drwpow)! - fix: [plugin-css] Font Family names without spaces no longer get quotes.

  fix: Font Family tokens are always normalized to an array internally for easier parsing.

- [#425](https://github.com/terrazzoapp/terrazzo/pull/425) [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4) Thanks [@drwpow](https://github.com/drwpow)! - feat: @terrazzo/plugin-css now returns entire token for `variableName`. This is a minor breaking change from `variableName(name: string)` → `variableName(token: Token)`, but current users can just use `token.id` to get the same value as before.

  ⚠️ Minor internal breaking change as a result: `transformCSSValue()` in @terrazzo/token-tools now requires entire token️ to make this possible.

- [#425](https://github.com/terrazzoapp/terrazzo/pull/425) [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4) Thanks [@drwpow](https://github.com/drwpow)! - fix: ⚠️ [plugin-css] Minor breaking change: transition tokens no longer generate variables for sub-parts. This is a change done in service to better protect “allowed” token usage. If you want consumers to be able to “break apart” tokens, then they must also exist as individual tokens that get aliased.

## 0.5.0

### Minor Changes

- [#420](https://github.com/terrazzoapp/terrazzo/pull/420) [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a) Thanks [@drwpow](https://github.com/drwpow)! - fix: ⚠️ Breaking change: CSS aliases will revert to original 1.0 behavior and be “shallow,” meaning they’ll be preserved as-written. Terrazzo 2.0 (beta) attempted to simplify aliases to only be single-depth, but that results in unintentional behavior.

### Patch Changes

- [#420](https://github.com/terrazzoapp/terrazzo/pull/420) [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a) Thanks [@drwpow](https://github.com/drwpow)! - fix: Improve reverse alias lookups (needed for plugin-css, where redeclared base tokens need downstream aliases to be redeclared too, so the values aren’t stale)

- [#419](https://github.com/terrazzoapp/terrazzo/pull/419) [`3962918`](https://github.com/terrazzoapp/terrazzo/commit/3962918b25af69fad7833d0399aee5bae0033d4f) Thanks [@drwpow](https://github.com/drwpow)! - Improve CLI logging and debugging for performance testing

- [#420](https://github.com/terrazzoapp/terrazzo/pull/420) [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a) Thanks [@drwpow](https://github.com/drwpow)! - fix: Minor performance improvements and cleanup

- [#420](https://github.com/terrazzoapp/terrazzo/pull/420) [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a) Thanks [@drwpow](https://github.com/drwpow)! - fix: CSS utilities alphabetize declarations to produce more consistent output. Reordering tokens should be a plugin-level concern; parser will preserve token authoring order.

## 0.4.0

### Minor Changes

- [#416](https://github.com/terrazzoapp/terrazzo/pull/416) [`822c956`](https://github.com/terrazzoapp/terrazzo/commit/822c95666c18da1c591ee232e6f62cc1b1ae968d) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: CSS variables updated to closer match Cobalt 1.0 behavior

### Patch Changes

- [#416](https://github.com/terrazzoapp/terrazzo/pull/416) [`822c956`](https://github.com/terrazzoapp/terrazzo/commit/822c95666c18da1c591ee232e6f62cc1b1ae968d) Thanks [@drwpow](https://github.com/drwpow)! - Add legacyHex option for outputting legacy hex codes

## 0.3.5

### Patch Changes

- [#414](https://github.com/terrazzoapp/terrazzo/pull/414) [`fd8fb6b`](https://github.com/terrazzoapp/terrazzo/commit/fd8fb6bf18b9353d8ea7482b23bd80f35a05af9a) Thanks [@drwpow](https://github.com/drwpow)! - Enable debugging in CLI

## 0.3.4

### Patch Changes

- [#408](https://github.com/terrazzoapp/terrazzo/pull/408) [`6f97566`](https://github.com/terrazzoapp/terrazzo/commit/6f97566ea83b7bcb42befd36aa618d52ec6e758f) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug where setTransform() would not properly deduplicate token values

## 0.3.3

### Patch Changes

- [#400](https://github.com/terrazzoapp/terrazzo/pull/400) [`9d888a6`](https://github.com/terrazzoapp/terrazzo/commit/9d888a65014b90fec90462cf8dc69f323f6e486b) Thanks [@drwpow](https://github.com/drwpow)! - Fix tz init "outDir" typo

## 0.3.2

### Patch Changes

- [#396](https://github.com/terrazzoapp/terrazzo/pull/396) [`4d1294d`](https://github.com/terrazzoapp/terrazzo/commit/4d1294d5695cf36cee65133b18f480d189911de2) Thanks [@drwpow](https://github.com/drwpow)! - Color tokens: add hex fallback for tokens parsed from hex

## 0.3.1

### Patch Changes

- [#393](https://github.com/terrazzoapp/terrazzo/pull/393) [`3ac154f`](https://github.com/terrazzoapp/terrazzo/commit/3ac154fe499a828ebf0bff033a5da302cccb7793) Thanks [@drwpow](https://github.com/drwpow)! - Improve error message for tz normalize

## 0.3.0

### Minor Changes

- [#391](https://github.com/terrazzoapp/terrazzo/pull/391) [`8e6810c`](https://github.com/terrazzoapp/terrazzo/commit/8e6810c33aded376aca58ebf2f28ad20aa3a06b1) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: Remove dash around numbers in CSS var names

## 0.2.9

### Patch Changes

- [#387](https://github.com/terrazzoapp/terrazzo/pull/387) [`f14224b`](https://github.com/terrazzoapp/terrazzo/commit/f14224b5ae3dcf31d1a67a2f3346ffabfe7dc71b) Thanks [@drwpow](https://github.com/drwpow)! - Fix incorrect parsing of typography tokens’ lineHeight when it’s a dimension value.

- [#387](https://github.com/terrazzoapp/terrazzo/pull/387) [`f14224b`](https://github.com/terrazzoapp/terrazzo/commit/f14224b5ae3dcf31d1a67a2f3346ffabfe7dc71b) Thanks [@drwpow](https://github.com/drwpow)! - Fix warning on parsing dimension tokens in typography tokens

## 0.2.8

### Patch Changes

- [#380](https://github.com/terrazzoapp/terrazzo/pull/380) [`a18c0a9`](https://github.com/terrazzoapp/terrazzo/commit/a18c0a972b6e6c19f2c0856e10326d96a838fcd2) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug in normalize where modes were skipped over

## 0.2.7

### Patch Changes

- [#376](https://github.com/terrazzoapp/terrazzo/pull/376) [`059b62a`](https://github.com/terrazzoapp/terrazzo/commit/059b62a95d1a7ec9667baef3dc695200a454eb61) Thanks [@drwpow](https://github.com/drwpow)! - Loosen up source type for parse()

## 0.2.6

### Patch Changes

- [#374](https://github.com/terrazzoapp/terrazzo/pull/374) [`cb64063`](https://github.com/terrazzoapp/terrazzo/commit/cb640631220f1abb72dd9e39806c5e1b61e92baf) Thanks [@drwpow](https://github.com/drwpow)! - Add normalize CLI command, which can upgrade a giant tokens file to the latest DTCG format.

## 0.2.5

### Patch Changes

- [#372](https://github.com/terrazzoapp/terrazzo/pull/372) [`d19df01`](https://github.com/terrazzoapp/terrazzo/commit/d19df016cd804971a190a8602d575aecdec00d5e) Thanks [@drwpow](https://github.com/drwpow)! - Ignore token-like structures inside $extensions

## 0.2.4

### Patch Changes

- [#369](https://github.com/terrazzoapp/terrazzo/pull/369) [`f2ca2b9`](https://github.com/terrazzoapp/terrazzo/commit/f2ca2b9261a88263e2fa3b7f1ec0a2fa10aa26e6) Thanks [@drwpow](https://github.com/drwpow)! - Fix tz init spinner

## 0.2.3

### Patch Changes

- [#367](https://github.com/terrazzoapp/terrazzo/pull/367) [`00af144`](https://github.com/terrazzoapp/terrazzo/commit/00af144538390c0fd22ebc14bf70db2c1f942203) Thanks [@drwpow](https://github.com/drwpow)! - Add Microsoft Fluent as starter template

## 0.2.2

### Patch Changes

- [#364](https://github.com/terrazzoapp/terrazzo/pull/364) [`27cc92e`](https://github.com/terrazzoapp/terrazzo/commit/27cc92ef5e9e187b5ec7a8abe3f23bc51f59fc9c) Thanks [@drwpow](https://github.com/drwpow)! - Add init CLI options

## 0.2.1

### Patch Changes

- [#358](https://github.com/terrazzoapp/terrazzo/pull/358) [`6b3c543`](https://github.com/terrazzoapp/terrazzo/commit/6b3c543a3356c582522f6e2d9b2948a0634a66df) Thanks [@christoph-fricke](https://github.com/christoph-fricke)! - Fix npm error when invoking the Terrazzo CLI through npm

## 0.2.0

### Minor Changes

- [#353](https://github.com/terrazzoapp/terrazzo/pull/353) [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa) Thanks [@drwpow](https://github.com/drwpow)! - Add lint API

- [#353](https://github.com/terrazzoapp/terrazzo/pull/353) [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa) Thanks [@drwpow](https://github.com/drwpow)! - Change tokenToCulori signature to only accept values

### Patch Changes

- [#353](https://github.com/terrazzoapp/terrazzo/pull/353) [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa) Thanks [@drwpow](https://github.com/drwpow)! - Add support for $deprecated tokens

## 0.1.3

### Patch Changes

- [#347](https://github.com/terrazzoapp/terrazzo/pull/347) [`b90287c`](https://github.com/terrazzoapp/terrazzo/commit/b90287cb13dc3bfdb24b8d6698931c7d156c3638) Thanks [@tomasfrancisco](https://github.com/tomasfrancisco)! - Add support for inset shadows

## 0.1.2

### Patch Changes

- [#342](https://github.com/terrazzoapp/terrazzo/pull/342) [`4bd7b85`](https://github.com/terrazzoapp/terrazzo/commit/4bd7b85427267728ba8c3ffd80aa4e01e8616c98) Thanks [@tomasfrancisco](https://github.com/tomasfrancisco)! - Improve typings for Group to allow nested Groups

## 0.1.1

### Patch Changes

- [#339](https://github.com/terrazzoapp/terrazzo/pull/339) [`9197405`](https://github.com/terrazzoapp/terrazzo/commit/9197405209d560f406494b6bd7aa1634608999c6) Thanks [@tomasfrancisco](https://github.com/tomasfrancisco)! - Fix missing letter spacing transformation as a dimension token

- [#341](https://github.com/terrazzoapp/terrazzo/pull/341) [`a637f67`](https://github.com/terrazzoapp/terrazzo/commit/a637f67e20009ce5eef1d5bc5b115cfa00b002d4) Thanks [@drwpow](https://github.com/drwpow)! - Fix 0 durations missing units in CSS

## 0.1.0

### Minor Changes

- [#319](https://github.com/terrazzoapp/terrazzo/pull/319) [`e7f272d`](https://github.com/terrazzoapp/terrazzo/commit/e7f272defcd889f5a410fdbd30497cf704671b32) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: dimension and duration tokens normalize to object syntax in plugins (following upcoming changes in DTCG spec; see https://github.com/design-tokens/community-group/pull/244).

## 0.0.6

### Patch Changes

- [#285](https://github.com/terrazzoapp/terrazzo/pull/285) [`e8a0df1`](https://github.com/terrazzoapp/terrazzo/commit/e8a0df1f3b50cf7cb292bcc475aae271feae4569) Thanks [@drwpow](https://github.com/drwpow)! - Add support for multiple token files
