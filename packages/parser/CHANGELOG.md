# @terrazzo/parser

## 2.0.0-alpha.2

### Patch Changes

- [#568](https://github.com/terrazzoapp/terrazzo/pull/568) [`67c75be`](https://github.com/terrazzoapp/terrazzo/commit/67c75be78978cece52b61cf258ccc3a875e6af48) Thanks [@drwpow](https://github.com/drwpow)! - Fix border tokens not cascading correctly across modes

- Updated dependencies [[`67c75be`](https://github.com/terrazzoapp/terrazzo/commit/67c75be78978cece52b61cf258ccc3a875e6af48)]:
  - @terrazzo/token-tools@2.0.0-alpha.2

## 2.0.0

### Minor Changes

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change; DTCG 2nd Editors draft format will throw errors by default. This means converting all colors and dimensions to the new object format.

  Though this is a breaking change in default behavior, you can opt back into the old behavior by adjusting your config’s lint settings. See https://terrazzo.app/docs/cli/lint/.

  List of changes:
  - **color**: `channels` is invalid; `components` is required (“channels” was never part of the spec; this just deprecates an in-progress draft that was briefly supported)
  - **dimension**: object notation (`{ value: 16, unit: 'px' }`) required.
  - **dimension**: `0` is no longer automatically expanded to`{ value: 0, unit: 'px' }`.
  - **duration**: object notation (`{ value: 100, unit: 'ms' }`) required.
  - **dimension**: `{ $value: 0 }` no longer allowed.
  - **typography**: `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, and `letterSpacing` are all required at a minimum (additional properties are still allowed).

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - Soft deprecate core/required-typography-properties in favor of core/valid-typography

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Minor breaking change: the transform() API now returns the Momoa node as the 1st parameter. The 2nd parameter is now an object with more context. Lastly, it requires returning a momoa node, rather than raw JSON.

  ```diff
  + import * as momoa from "@humanwhocodes/momoa";

    transform: {
  -   color(json, path, node) {
  +   color(node, { path, filename }) {
  +     const json = momoa.evaluate(node);
  -     return json;
  +     return momoa.parse(json);
      }
  ```

  This should result in a little less work overall. For example, instead of writing `if (typeof json === 'object' && !Array.isArray(json))` that could be shortened to `if (node.type === 'Object')`, among many other such advantages. You can call `evaluate()` manually if you’re more used to working with the raw JSON instead. Similarly, you can call `parse()` if you’re working with

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: lint on plugins no longer runs on individual files, rather, the full set once merged.

  If your lint plugin is not using the `src` context value, no changes are needed. If it is, you’ll need to instead read from the `sources` array, and look up sources with a token’s `source.loc` filename manually. This change was because lint rules now run on all files in one pass, essentially.

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ [Plugin API] Minor breaking change: token.originalValue may be undefined for tokens created with $ref. This shouldn’t affect any tokens or plugins not using $refs. But going forward this value will be missing if the token was created dynamically via $ref.

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - Minor breaking change: build() and buildEnd() plugin hooks are now executed in parallel. The other hooks are still executed sequentially.

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: the following token types have more strict requirements about all properties being present:
  - Border
  - Transition
  - Typography

  These behaviors may be opted out individually by adjusting the new lint rules ([see documentation](https://terrazzo.app/docs/cli/lint/)).

### Patch Changes

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug where border tokens’ partial aliases would sometimes refer to themselves

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug of lint warning of rules turned off being unused

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - Validation moved to lint rules, which means token validation can be individually configured, and optionally extended.

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - Add first class support for JSON $refs, both remote and local.

  Under-the-hood this transforms DTCG aliase to JSON $refs, so they’re interchangeable.

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - Bugfix: fix strokeStyle partialAliasOf

- [#530](https://github.com/terrazzoapp/terrazzo/pull/530) [`370ed7b`](https://github.com/terrazzoapp/terrazzo/commit/370ed7b0f578a64824124145d7f4936536b37bb3) Thanks [@drwpow](https://github.com/drwpow)! - Add missing $deprecated property to group types

- [#553](https://github.com/terrazzoapp/terrazzo/pull/553) [`e63a627`](https://github.com/terrazzoapp/terrazzo/commit/e63a6277f61282fb608744a8348689b16f977076) Thanks [@Sidnioulz](https://github.com/Sidnioulz)! - Add support for the Token Listing format

## 0.10.4

### Patch Changes

- [#552](https://github.com/terrazzoapp/terrazzo/pull/552) [`d96e0e5`](https://github.com/terrazzoapp/terrazzo/commit/d96e0e544d49ee94148d38270c29bec22f9bc6ea) Thanks [@nlemoine](https://github.com/nlemoine)! - Apply transform to token nodes

## 0.10.3

### Patch Changes

- [#532](https://github.com/terrazzoapp/terrazzo/pull/532) [`6141d4f`](https://github.com/terrazzoapp/terrazzo/commit/6141d4f5a9790be73b314c517d9da010f237814e) Thanks [@Sidnioulz](https://github.com/Sidnioulz)! - Support the $deprecated prop being inherited from a token's group

## 0.10.2

### Patch Changes

- [#526](https://github.com/terrazzoapp/terrazzo/pull/526) [`085f657`](https://github.com/terrazzoapp/terrazzo/commit/085f6573ca964af72fa2985e33f671f972cdf7fd) Thanks [@drwpow](https://github.com/drwpow)! - Update strokeStyle tokens to allow modern dimension syntax

## 0.10.1

### Patch Changes

- [#510](https://github.com/terrazzoapp/terrazzo/pull/510) [`4493731`](https://github.com/terrazzoapp/terrazzo/commit/4493731a4d458af45a1bb4c56e3fe0d42d66aeef) Thanks [@drwpow](https://github.com/drwpow)! - Reduce decimal places in color output.
  - [plugin-css] ⚠️ Minor breaking change: decimals have been simplified in output. To restore original behavior, pass in `colorDepth: 'unlimited'`

- Updated dependencies [[`4493731`](https://github.com/terrazzoapp/terrazzo/commit/4493731a4d458af45a1bb4c56e3fe0d42d66aeef)]:
  - @terrazzo/token-tools@0.10.1

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

## 0.9.1

### Patch Changes

- [#502](https://github.com/terrazzoapp/terrazzo/pull/502) [`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug in parsing LAB colors

- [#502](https://github.com/terrazzoapp/terrazzo/pull/502) [`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59) Thanks [@drwpow](https://github.com/drwpow)! - Add support for lab65 colors (not technically part of CSS Module 4 spec, but a nice convenience)

- Updated dependencies [[`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59), [`c9792bd`](https://github.com/terrazzoapp/terrazzo/commit/c9792bdef27aa2edab3f9f74b37a794f0a14da59)]:
  - @terrazzo/token-tools@0.9.1

## 0.9.0

### Minor Changes

- [#497](https://github.com/terrazzoapp/terrazzo/pull/497) [`9b80fd4`](https://github.com/terrazzoapp/terrazzo/commit/9b80fd4edd1198021d8e309483e8cd8551fe79dc) Thanks [@bschlenk](https://github.com/bschlenk)! - - potential 5x speedup for @terrazzo/plugin-css
  - removed isTokenMatch from @terrazzo/token-tools

### Patch Changes

- Updated dependencies [[`9b80fd4`](https://github.com/terrazzoapp/terrazzo/commit/9b80fd4edd1198021d8e309483e8cd8551fe79dc)]:
  - @terrazzo/token-tools@0.9.0

## 0.8.1

### Patch Changes

- [#491](https://github.com/terrazzoapp/terrazzo/pull/491) [`5edf1fd`](https://github.com/terrazzoapp/terrazzo/commit/5edf1fde42cd53b5883eefcbe849dc5749cfaa8f) Thanks [@drwpow](https://github.com/drwpow)! - Add warning on incorrect getTransforms() usage

- Updated dependencies [[`5edf1fd`](https://github.com/terrazzoapp/terrazzo/commit/5edf1fde42cd53b5883eefcbe849dc5749cfaa8f)]:
  - @terrazzo/token-tools@0.8.1

## 0.8.0

### Minor Changes

- [#489](https://github.com/terrazzoapp/terrazzo/pull/489) [`63f91e6`](https://github.com/terrazzoapp/terrazzo/commit/63f91e6eee1bec5cf7fae3c1bffdde40a5604ec6) Thanks [@drwpow](https://github.com/drwpow)! - Use Rolldown for packaging 🚀

### Patch Changes

- Updated dependencies [[`63f91e6`](https://github.com/terrazzoapp/terrazzo/commit/63f91e6eee1bec5cf7fae3c1bffdde40a5604ec6)]:
  - @terrazzo/token-tools@0.8.0

## 0.7.3

### Patch Changes

- [#485](https://github.com/terrazzoapp/terrazzo/pull/485) [`84335da`](https://github.com/terrazzoapp/terrazzo/commit/84335da86adbe4cf112b91d8d9bfa1301c5492d4) Thanks [@drwpow](https://github.com/drwpow)! - Add transform API to allow dynamic parsing / transformation of tokens on load

- Updated dependencies [[`84335da`](https://github.com/terrazzoapp/terrazzo/commit/84335da86adbe4cf112b91d8d9bfa1301c5492d4)]:
  - @terrazzo/token-tools@0.7.4

## 0.7.2

### Patch Changes

- [#482](https://github.com/terrazzoapp/terrazzo/pull/482) [`abc14c4`](https://github.com/terrazzoapp/terrazzo/commit/abc14c4f59f21a1c7d05d613dacdebcd9d512838) Thanks [@drwpow](https://github.com/drwpow)! - Fix documentation links

- Updated dependencies [[`abc14c4`](https://github.com/terrazzoapp/terrazzo/commit/abc14c4f59f21a1c7d05d613dacdebcd9d512838)]:
  - @terrazzo/token-tools@0.7.3

## 0.7.1

### Patch Changes

- [#468](https://github.com/terrazzoapp/terrazzo/pull/468) [`2c28957`](https://github.com/terrazzoapp/terrazzo/commit/2c289579bee73eabcdf648fbdb99071fece9c018) Thanks [@drwpow](https://github.com/drwpow)! - When downsampling colors for sRGB gamut, preserve the originally-authored colorspace

- Updated dependencies [[`2c28957`](https://github.com/terrazzoapp/terrazzo/commit/2c289579bee73eabcdf648fbdb99071fece9c018)]:
  - @terrazzo/token-tools@0.7.1

## 0.7.0

### Minor Changes

- [#454](https://github.com/terrazzoapp/terrazzo/pull/454) [`44ff082`](https://github.com/terrazzoapp/terrazzo/commit/44ff082ec3cc4034dcbcf7702f9676a631c99dde) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: the new color token object format uses "components" instead of "channels". Please update your tokens accordingly.

### Patch Changes

- Updated dependencies [[`44ff082`](https://github.com/terrazzoapp/terrazzo/commit/44ff082ec3cc4034dcbcf7702f9676a631c99dde)]:
  - @terrazzo/token-tools@0.7.0

## 0.6.3

### Patch Changes

- [#443](https://github.com/terrazzoapp/terrazzo/pull/443) [`8cc558f`](https://github.com/terrazzoapp/terrazzo/commit/8cc558ff98cef4eb36240918aa594905dfeb11ee) Thanks [@drwpow](https://github.com/drwpow)! - Bugfix: allow resolving from node_modules in @terrazzo/cli (note: @terrazzo/parser/JS API still runs in browser, so it still can’t resolve npm modules).

- Updated dependencies [[`8cc558f`](https://github.com/terrazzoapp/terrazzo/commit/8cc558ff98cef4eb36240918aa594905dfeb11ee)]:
  - @terrazzo/token-tools@0.6.3

## 0.6.2

### Patch Changes

- [#440](https://github.com/terrazzoapp/terrazzo/pull/440) [`34e2cdc`](https://github.com/terrazzoapp/terrazzo/commit/34e2cdce27a578571e04eb006d3b209461a0fbbe) Thanks [@drwpow](https://github.com/drwpow)! - Add debug info for buildEnd

- Updated dependencies [[`34e2cdc`](https://github.com/terrazzoapp/terrazzo/commit/34e2cdce27a578571e04eb006d3b209461a0fbbe)]:
  - @terrazzo/token-tools@0.6.2

## 0.6.1

### Patch Changes

- [#427](https://github.com/terrazzoapp/terrazzo/pull/427) [`af57a80`](https://github.com/terrazzoapp/terrazzo/commit/af57a8010664e0e5b5b6eb5eef10779a4197da25) Thanks [@drwpow](https://github.com/drwpow)! - feat: `parse()` JS API doesn’t need an array for a single file (can just accept an object)

- Updated dependencies [[`af57a80`](https://github.com/terrazzoapp/terrazzo/commit/af57a8010664e0e5b5b6eb5eef10779a4197da25)]:
  - @terrazzo/token-tools@0.6.1

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

- Updated dependencies [[`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4), [`9a98ab0`](https://github.com/terrazzoapp/terrazzo/commit/9a98ab0441b518fa4bb0e5a40f6f5cde58764af4)]:
  - @terrazzo/token-tools@0.6.0

## 0.5.0

### Minor Changes

- [#420](https://github.com/terrazzoapp/terrazzo/pull/420) [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a) Thanks [@drwpow](https://github.com/drwpow)! - fix: ⚠️ Breaking change: CSS aliases will revert to original 1.0 behavior and be “shallow,” meaning they’ll be preserved as-written. Terrazzo 2.0 (beta) attempted to simplify aliases to only be single-depth, but that results in unintentional behavior.

### Patch Changes

- [#420](https://github.com/terrazzoapp/terrazzo/pull/420) [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a) Thanks [@drwpow](https://github.com/drwpow)! - fix: Improve reverse alias lookups (needed for plugin-css, where redeclared base tokens need downstream aliases to be redeclared too, so the values aren’t stale)

- [#419](https://github.com/terrazzoapp/terrazzo/pull/419) [`3962918`](https://github.com/terrazzoapp/terrazzo/commit/3962918b25af69fad7833d0399aee5bae0033d4f) Thanks [@drwpow](https://github.com/drwpow)! - Improve CLI logging and debugging for performance testing

- [#420](https://github.com/terrazzoapp/terrazzo/pull/420) [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a) Thanks [@drwpow](https://github.com/drwpow)! - fix: Minor performance improvements and cleanup

- [#420](https://github.com/terrazzoapp/terrazzo/pull/420) [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a) Thanks [@drwpow](https://github.com/drwpow)! - fix: CSS utilities alphabetize declarations to produce more consistent output. Reordering tokens should be a plugin-level concern; parser will preserve token authoring order.

- Updated dependencies [[`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a), [`3962918`](https://github.com/terrazzoapp/terrazzo/commit/3962918b25af69fad7833d0399aee5bae0033d4f), [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a), [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a), [`ff3d9d1`](https://github.com/terrazzoapp/terrazzo/commit/ff3d9d199dc53102110f8403c6832f8bdeeee45a)]:
  - @terrazzo/token-tools@0.5.0

## 0.4.0

### Minor Changes

- [#416](https://github.com/terrazzoapp/terrazzo/pull/416) [`822c956`](https://github.com/terrazzoapp/terrazzo/commit/822c95666c18da1c591ee232e6f62cc1b1ae968d) Thanks [@drwpow](https://github.com/drwpow)! - fix: ⚠️ Breaking change: CSS variables updated to closer match Cobalt 1.0 behavior

### Patch Changes

- Updated dependencies [[`822c956`](https://github.com/terrazzoapp/terrazzo/commit/822c95666c18da1c591ee232e6f62cc1b1ae968d), [`822c956`](https://github.com/terrazzoapp/terrazzo/commit/822c95666c18da1c591ee232e6f62cc1b1ae968d)]:
  - @terrazzo/token-tools@0.4.0

## 0.3.5

### Patch Changes

- [#414](https://github.com/terrazzoapp/terrazzo/pull/414) [`fd8fb6b`](https://github.com/terrazzoapp/terrazzo/commit/fd8fb6bf18b9353d8ea7482b23bd80f35a05af9a) Thanks [@drwpow](https://github.com/drwpow)! - feat: Enable debugging in CLI

- Updated dependencies [[`fd8fb6b`](https://github.com/terrazzoapp/terrazzo/commit/fd8fb6bf18b9353d8ea7482b23bd80f35a05af9a)]:
  - @terrazzo/token-tools@0.3.5

## 0.3.4

### Patch Changes

- [#408](https://github.com/terrazzoapp/terrazzo/pull/408) [`6f97566`](https://github.com/terrazzoapp/terrazzo/commit/6f97566ea83b7bcb42befd36aa618d52ec6e758f) Thanks [@drwpow](https://github.com/drwpow)! - fix: setTransform() would not properly deduplicate token values

- Updated dependencies [[`6f97566`](https://github.com/terrazzoapp/terrazzo/commit/6f97566ea83b7bcb42befd36aa618d52ec6e758f)]:
  - @terrazzo/token-tools@0.3.4

## 0.3.3

### Patch Changes

- [#400](https://github.com/terrazzoapp/terrazzo/pull/400) [`9d888a6`](https://github.com/terrazzoapp/terrazzo/commit/9d888a65014b90fec90462cf8dc69f323f6e486b) Thanks [@drwpow](https://github.com/drwpow)! - fix: tz init "outDir" typo

- Updated dependencies [[`9d888a6`](https://github.com/terrazzoapp/terrazzo/commit/9d888a65014b90fec90462cf8dc69f323f6e486b)]:
  - @terrazzo/token-tools@0.3.3

## 0.3.2

### Patch Changes

- [#396](https://github.com/terrazzoapp/terrazzo/pull/396) [`4d1294d`](https://github.com/terrazzoapp/terrazzo/commit/4d1294d5695cf36cee65133b18f480d189911de2) Thanks [@drwpow](https://github.com/drwpow)! - feat: Color tokens: add hex fallback for tokens parsed from hex

- Updated dependencies [[`4d1294d`](https://github.com/terrazzoapp/terrazzo/commit/4d1294d5695cf36cee65133b18f480d189911de2)]:
  - @terrazzo/token-tools@0.3.2

## 0.3.1

### Patch Changes

- [#393](https://github.com/terrazzoapp/terrazzo/pull/393) [`3ac154f`](https://github.com/terrazzoapp/terrazzo/commit/3ac154fe499a828ebf0bff033a5da302cccb7793) Thanks [@drwpow](https://github.com/drwpow)! - fix: Improve error message for tz normalize

- Updated dependencies [[`3ac154f`](https://github.com/terrazzoapp/terrazzo/commit/3ac154fe499a828ebf0bff033a5da302cccb7793)]:
  - @terrazzo/token-tools@0.3.1

## 0.3.0

### Minor Changes

- [#391](https://github.com/terrazzoapp/terrazzo/pull/391) [`8e6810c`](https://github.com/terrazzoapp/terrazzo/commit/8e6810c33aded376aca58ebf2f28ad20aa3a06b1) Thanks [@drwpow](https://github.com/drwpow)! - fix: ⚠️ Breaking change: Remove dash around numbers in CSS var names

### Patch Changes

- Updated dependencies [[`8e6810c`](https://github.com/terrazzoapp/terrazzo/commit/8e6810c33aded376aca58ebf2f28ad20aa3a06b1)]:
  - @terrazzo/token-tools@0.3.0

## 0.2.9

### Patch Changes

- [#387](https://github.com/terrazzoapp/terrazzo/pull/387) [`f14224b`](https://github.com/terrazzoapp/terrazzo/commit/f14224b5ae3dcf31d1a67a2f3346ffabfe7dc71b) Thanks [@drwpow](https://github.com/drwpow)! - fix: Incorrect parsing of typography tokens’ lineHeight when it’s a dimension value.

- [#387](https://github.com/terrazzoapp/terrazzo/pull/387) [`f14224b`](https://github.com/terrazzoapp/terrazzo/commit/f14224b5ae3dcf31d1a67a2f3346ffabfe7dc71b) Thanks [@drwpow](https://github.com/drwpow)! - fix: Warning on parsing dimension tokens in typography tokens

- Updated dependencies [[`f14224b`](https://github.com/terrazzoapp/terrazzo/commit/f14224b5ae3dcf31d1a67a2f3346ffabfe7dc71b), [`f14224b`](https://github.com/terrazzoapp/terrazzo/commit/f14224b5ae3dcf31d1a67a2f3346ffabfe7dc71b)]:
  - @terrazzo/token-tools@0.2.9

## 0.2.8

### Patch Changes

- [#380](https://github.com/terrazzoapp/terrazzo/pull/380) [`a18c0a9`](https://github.com/terrazzoapp/terrazzo/commit/a18c0a972b6e6c19f2c0856e10326d96a838fcd2) Thanks [@drwpow](https://github.com/drwpow)! - fix: Bug in normalize where modes were skipped over

- Updated dependencies [[`a18c0a9`](https://github.com/terrazzoapp/terrazzo/commit/a18c0a972b6e6c19f2c0856e10326d96a838fcd2)]:
  - @terrazzo/token-tools@0.2.8

## 0.2.7

### Patch Changes

- [#376](https://github.com/terrazzoapp/terrazzo/pull/376) [`059b62a`](https://github.com/terrazzoapp/terrazzo/commit/059b62a95d1a7ec9667baef3dc695200a454eb61) Thanks [@drwpow](https://github.com/drwpow)! - fix: Loosen up source type for parse()

- Updated dependencies [[`059b62a`](https://github.com/terrazzoapp/terrazzo/commit/059b62a95d1a7ec9667baef3dc695200a454eb61)]:
  - @terrazzo/token-tools@0.2.7

## 0.2.6

### Patch Changes

- [#374](https://github.com/terrazzoapp/terrazzo/pull/374) [`cb64063`](https://github.com/terrazzoapp/terrazzo/commit/cb640631220f1abb72dd9e39806c5e1b61e92baf) Thanks [@drwpow](https://github.com/drwpow)! - feat: Add normalize CLI command, which can upgrade a giant tokens file to the latest DTCG format.

- Updated dependencies [[`cb64063`](https://github.com/terrazzoapp/terrazzo/commit/cb640631220f1abb72dd9e39806c5e1b61e92baf)]:
  - @terrazzo/token-tools@0.2.6

## 0.2.5

### Patch Changes

- [#372](https://github.com/terrazzoapp/terrazzo/pull/372) [`d19df01`](https://github.com/terrazzoapp/terrazzo/commit/d19df016cd804971a190a8602d575aecdec00d5e) Thanks [@drwpow](https://github.com/drwpow)! - Ignore token-like structures inside $extensions

- Updated dependencies [[`d19df01`](https://github.com/terrazzoapp/terrazzo/commit/d19df016cd804971a190a8602d575aecdec00d5e)]:
  - @terrazzo/token-tools@0.2.5

## 0.2.4

### Patch Changes

- [#369](https://github.com/terrazzoapp/terrazzo/pull/369) [`f2ca2b9`](https://github.com/terrazzoapp/terrazzo/commit/f2ca2b9261a88263e2fa3b7f1ec0a2fa10aa26e6) Thanks [@drwpow](https://github.com/drwpow)! - Fix tz init spinner

- Updated dependencies [[`f2ca2b9`](https://github.com/terrazzoapp/terrazzo/commit/f2ca2b9261a88263e2fa3b7f1ec0a2fa10aa26e6)]:
  - @terrazzo/token-tools@0.2.4

## 0.2.3

### Patch Changes

- [#367](https://github.com/terrazzoapp/terrazzo/pull/367) [`00af144`](https://github.com/terrazzoapp/terrazzo/commit/00af144538390c0fd22ebc14bf70db2c1f942203) Thanks [@drwpow](https://github.com/drwpow)! - Add Microsoft Fluent as starter template

- Updated dependencies [[`00af144`](https://github.com/terrazzoapp/terrazzo/commit/00af144538390c0fd22ebc14bf70db2c1f942203)]:
  - @terrazzo/token-tools@0.2.3

## 0.2.2

### Patch Changes

- [#364](https://github.com/terrazzoapp/terrazzo/pull/364) [`27cc92e`](https://github.com/terrazzoapp/terrazzo/commit/27cc92ef5e9e187b5ec7a8abe3f23bc51f59fc9c) Thanks [@drwpow](https://github.com/drwpow)! - Add init CLI options

- Updated dependencies [[`27cc92e`](https://github.com/terrazzoapp/terrazzo/commit/27cc92ef5e9e187b5ec7a8abe3f23bc51f59fc9c)]:
  - @terrazzo/token-tools@0.2.2

## 0.2.1

### Patch Changes

- [#358](https://github.com/terrazzoapp/terrazzo/pull/358) [`6b3c543`](https://github.com/terrazzoapp/terrazzo/commit/6b3c543a3356c582522f6e2d9b2948a0634a66df) Thanks [@christoph-fricke](https://github.com/christoph-fricke)! - Fix npm error when invoking the Terrazzo CLI through npm

## 0.2.0

### Minor Changes

- [#353](https://github.com/terrazzoapp/terrazzo/pull/353) [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa) Thanks [@drwpow](https://github.com/drwpow)! - Add lint API

### Patch Changes

- [#353](https://github.com/terrazzoapp/terrazzo/pull/353) [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa) Thanks [@drwpow](https://github.com/drwpow)! - Add support for $deprecated tokens

- [#353](https://github.com/terrazzoapp/terrazzo/pull/353) [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug in alias resolution

- [#353](https://github.com/terrazzoapp/terrazzo/pull/353) [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa) Thanks [@drwpow](https://github.com/drwpow)! - Fix type error with parser output

- Updated dependencies [[`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa), [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa), [`80e04c3`](https://github.com/terrazzoapp/terrazzo/commit/80e04c36a354234e04153a8332ebddd5360247aa)]:
  - @terrazzo/token-tools@0.2.0

## 0.1.3

### Patch Changes

- [#347](https://github.com/terrazzoapp/terrazzo/pull/347) [`b90287c`](https://github.com/terrazzoapp/terrazzo/commit/b90287cb13dc3bfdb24b8d6698931c7d156c3638) Thanks [@tomasfrancisco](https://github.com/tomasfrancisco)! - Add support for inset shadows

- Updated dependencies [[`b90287c`](https://github.com/terrazzoapp/terrazzo/commit/b90287cb13dc3bfdb24b8d6698931c7d156c3638)]:
  - @terrazzo/token-tools@0.1.3

## 0.1.2

### Patch Changes

- Updated dependencies [[`4bd7b85`](https://github.com/terrazzoapp/terrazzo/commit/4bd7b85427267728ba8c3ffd80aa4e01e8616c98)]:
  - @terrazzo/token-tools@0.1.2

## 0.1.1

### Patch Changes

- [#339](https://github.com/terrazzoapp/terrazzo/pull/339) [`9197405`](https://github.com/terrazzoapp/terrazzo/commit/9197405209d560f406494b6bd7aa1634608999c6) Thanks [@tomasfrancisco](https://github.com/tomasfrancisco)! - Fix missing letter spacing transformation as a dimension token

- Updated dependencies [[`9197405`](https://github.com/terrazzoapp/terrazzo/commit/9197405209d560f406494b6bd7aa1634608999c6), [`a637f67`](https://github.com/terrazzoapp/terrazzo/commit/a637f67e20009ce5eef1d5bc5b115cfa00b002d4)]:
  - @terrazzo/token-tools@0.1.1

## 0.1.0

### Minor Changes

- [#319](https://github.com/terrazzoapp/terrazzo/pull/319) [`e7f272d`](https://github.com/terrazzoapp/terrazzo/commit/e7f272defcd889f5a410fdbd30497cf704671b32) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Breaking change: dimension and duration tokens normalize to object syntax in plugins (following upcoming changes in DTCG spec; see https://github.com/design-tokens/community-group/pull/244).

### Patch Changes

- Updated dependencies [[`e7f272d`](https://github.com/terrazzoapp/terrazzo/commit/e7f272defcd889f5a410fdbd30497cf704671b32)]:
  - @terrazzo/token-tools@0.1.0

## 0.0.19

### Patch Changes

- [#313](https://github.com/terrazzoapp/terrazzo/pull/313) [`1408594`](https://github.com/terrazzoapp/terrazzo/commit/1408594de029f57137c936dc2ff9ab949f039215) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug in gradient position aliasing

- [#313](https://github.com/terrazzoapp/terrazzo/pull/313) [`1408594`](https://github.com/terrazzoapp/terrazzo/commit/1408594de029f57137c936dc2ff9ab949f039215) Thanks [@drwpow](https://github.com/drwpow)! - Improve alias type validation

## 0.0.18

### Patch Changes

- [#305](https://github.com/terrazzoapp/terrazzo/pull/305) [`9ce829c`](https://github.com/terrazzoapp/terrazzo/commit/9ce829c37c8a068f7d7157b615d4a00472c33156) Thanks [@drwpow](https://github.com/drwpow)! - Don’t log AST node on error

## 0.0.17

### Patch Changes

- [#302](https://github.com/terrazzoapp/terrazzo/pull/302) [`d0a9df4`](https://github.com/terrazzoapp/terrazzo/commit/d0a9df43ccabd10ea338e12cbfcfbd7e00952d28) Thanks [@drwpow](https://github.com/drwpow)! - Fix parser bug with partialAliasOf that would lead to incorrect final values when aliasing

## 0.0.13

### Patch Changes

- [#289](https://github.com/terrazzoapp/terrazzo/pull/289) [`0fc9738`](https://github.com/terrazzoapp/terrazzo/commit/0fc9738bb3dfecb680d225e4bd3970f21cfe8079) Thanks [@drwpow](https://github.com/drwpow)! - Add YAML support

- [#291](https://github.com/terrazzoapp/terrazzo/pull/291) [`6a875b1`](https://github.com/terrazzoapp/terrazzo/commit/6a875b163539dba8111911851a7819732056b3aa) Thanks [@drwpow](https://github.com/drwpow)! - Allow negative dimension values

## 0.0.12

### Patch Changes

- [#285](https://github.com/terrazzoapp/terrazzo/pull/285) [`e8a0df1`](https://github.com/terrazzoapp/terrazzo/commit/e8a0df1f3b50cf7cb292bcc475aae271feae4569) Thanks [@drwpow](https://github.com/drwpow)! - Add support for multiple token files

- Updated dependencies [[`e8a0df1`](https://github.com/terrazzoapp/terrazzo/commit/e8a0df1f3b50cf7cb292bcc475aae271feae4569)]:
  - @terrazzo/token-tools@0.0.6
