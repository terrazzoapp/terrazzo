# @cobalt-ui/core

## 1.10.2

### Patch Changes

- [`a00e3c6d8ffb4ab8e4473a2c0152b3cd199a8414`](https://github.com/drwpow/cobalt-ui/commit/a00e3c6d8ffb4ab8e4473a2c0152b3cd199a8414) Thanks [@drwpow](https://github.com/drwpow)! - Improve lint error outputs

## 1.10.1

### Patch Changes

- [#233](https://github.com/drwpow/cobalt-ui/pull/233) [`54bd5a31f01dd97dceb3808db7f3ff93d4342166`](https://github.com/drwpow/cobalt-ui/commit/54bd5a31f01dd97dceb3808db7f3ff93d4342166) Thanks [@drwpow](https://github.com/drwpow)! - Tiny parser performance bump

## 1.10.0

### Minor Changes

- [#231](https://github.com/drwpow/cobalt-ui/pull/231) [`6bd99785eb50af83c96a0d70bd78fe6c6ab88a19`](https://github.com/drwpow/cobalt-ui/commit/6bd99785eb50af83c96a0d70bd78fe6c6ab88a19) Thanks [@drwpow](https://github.com/drwpow)! - Support YAML parsing in core

### Patch Changes

- [#231](https://github.com/drwpow/cobalt-ui/pull/231) [`6bd99785eb50af83c96a0d70bd78fe6c6ab88a19`](https://github.com/drwpow/cobalt-ui/commit/6bd99785eb50af83c96a0d70bd78fe6c6ab88a19) Thanks [@drwpow](https://github.com/drwpow)! - ⚠️ Tiny breaking change: Remove index.min.js from package (not used by anything, and probably shouldn’t be used; just using default package entryfile will yield better results in all setups)

- [#231](https://github.com/drwpow/cobalt-ui/pull/231) [`6bd99785eb50af83c96a0d70bd78fe6c6ab88a19`](https://github.com/drwpow/cobalt-ui/commit/6bd99785eb50af83c96a0d70bd78fe6c6ab88a19) Thanks [@drwpow](https://github.com/drwpow)! - Improve JSON parsing errors with json-parse

## 1.9.0

### Minor Changes

- [#228](https://github.com/drwpow/cobalt-ui/pull/228) [`1e12d04fb24eebc1df152017935dd65a2c6d7618`](https://github.com/drwpow/cobalt-ui/commit/1e12d04fb24eebc1df152017935dd65a2c6d7618) Thanks [@drwpow](https://github.com/drwpow)! - Add gamut clipping for color tokens

### Patch Changes

- [#228](https://github.com/drwpow/cobalt-ui/pull/228) [`1e12d04fb24eebc1df152017935dd65a2c6d7618`](https://github.com/drwpow/cobalt-ui/commit/1e12d04fb24eebc1df152017935dd65a2c6d7618) Thanks [@drwpow](https://github.com/drwpow)! - Improve Tokens Studio inline aliasing

- [#228](https://github.com/drwpow/cobalt-ui/pull/228) [`1e12d04fb24eebc1df152017935dd65a2c6d7618`](https://github.com/drwpow/cobalt-ui/commit/1e12d04fb24eebc1df152017935dd65a2c6d7618) Thanks [@drwpow](https://github.com/drwpow)! - Make parse options optional for easier use

## 1.8.1

### Patch Changes

- [#226](https://github.com/drwpow/cobalt-ui/pull/226) [`09e44f0efa0d025a2f1545abdc87ba107b7043e7`](https://github.com/drwpow/cobalt-ui/commit/09e44f0efa0d025a2f1545abdc87ba107b7043e7) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug in linting via CLI

- [#226](https://github.com/drwpow/cobalt-ui/pull/226) [`09e44f0efa0d025a2f1545abdc87ba107b7043e7`](https://github.com/drwpow/cobalt-ui/commit/09e44f0efa0d025a2f1545abdc87ba107b7043e7) Thanks [@drwpow](https://github.com/drwpow)! - Add `co lint` command and `lint.build.enabled` config flag

## 1.8.0

### Minor Changes

- [#218](https://github.com/drwpow/cobalt-ui/pull/218) [`041a8d070b74d2bca46e0c26c0c522f96b585458`](https://github.com/drwpow/cobalt-ui/commit/041a8d070b74d2bca46e0c26c0c522f96b585458) Thanks [@drwpow](https://github.com/drwpow)! - Add `lint()` and `registerRules()` stages to plugins

- [#218](https://github.com/drwpow/cobalt-ui/pull/218) [`041a8d070b74d2bca46e0c26c0c522f96b585458`](https://github.com/drwpow/cobalt-ui/commit/041a8d070b74d2bca46e0c26c0c522f96b585458) Thanks [@drwpow](https://github.com/drwpow)! - Support `lint` and lint rules in config

### Patch Changes

- [#218](https://github.com/drwpow/cobalt-ui/pull/218) [`041a8d070b74d2bca46e0c26c0c522f96b585458`](https://github.com/drwpow/cobalt-ui/commit/041a8d070b74d2bca46e0c26c0c522f96b585458) Thanks [@drwpow](https://github.com/drwpow)! - build() command is no longer required in types

## 1.7.3

### Patch Changes

- [#208](https://github.com/drwpow/cobalt-ui/pull/208) [`12f41273b853b98c8da665552ab342df7b0baf9e`](https://github.com/drwpow/cobalt-ui/commit/12f41273b853b98c8da665552ab342df7b0baf9e) Thanks [@james-nash](https://github.com/james-nash)! - Allows DTCG files to contain empty groups. Previously they would cause a parsing error, now only a warning will be logged.

## 1.7.2

### Patch Changes

- [#205](https://github.com/drwpow/cobalt-ui/pull/205) [`5f39eb577ce4ede00d479d2ecc73bd087aa584c2`](https://github.com/drwpow/cobalt-ui/commit/5f39eb577ce4ede00d479d2ecc73bd087aa584c2) Thanks [@drwpow](https://github.com/drwpow)! - Improve parsing of Tokens Studio files

## 1.7.0

### Minor Changes

- [#189](https://github.com/drwpow/cobalt-ui/pull/189) [`a2afdc48a9cda210eafc59c4f4f9af1e5bb3dc42`](https://github.com/drwpow/cobalt-ui/commit/a2afdc48a9cda210eafc59c4f4f9af1e5bb3dc42) Thanks [@drwpow](https://github.com/drwpow)! - Add Figma Variable support natively

### Patch Changes

- [#187](https://github.com/drwpow/cobalt-ui/pull/187) [`a395b21d017ae4b2f0a05bba6706b05a63850f69`](https://github.com/drwpow/cobalt-ui/commit/a395b21d017ae4b2f0a05bba6706b05a63850f69) Thanks [@drwpow](https://github.com/drwpow)! - Update Culori to 4.x

- Updated dependencies [[`a2afdc48a9cda210eafc59c4f4f9af1e5bb3dc42`](https://github.com/drwpow/cobalt-ui/commit/a2afdc48a9cda210eafc59c4f4f9af1e5bb3dc42)]:
  - @cobalt-ui/utils@1.2.3

## 1.6.1

### Patch Changes

- [#140](https://github.com/drwpow/cobalt-ui/pull/140) [`636f4da`](https://github.com/drwpow/cobalt-ui/commit/636f4dae537677dfe893bb310352589b7bb58795) Thanks [@drwpow](https://github.com/drwpow)! - Fix strokeStyle object values

## 1.6.0

### Minor Changes

- [#119](https://github.com/drwpow/cobalt-ui/pull/119) [`1a76946`](https://github.com/drwpow/cobalt-ui/commit/1a769463920d730a9688e0be66c27426da25cf7d) Thanks [@drwpow](https://github.com/drwpow)! - Breaking change: don’t automatically convert colors to hex

## 1.5.0

### Minor Changes

- [#114](https://github.com/drwpow/cobalt-ui/pull/114) [`9f62035`](https://github.com/drwpow/cobalt-ui/commit/9f620359ee6c426279645a29edc5854085dd6045) Thanks [@drwpow](https://github.com/drwpow)! - Add "inset" property for shadows

- [#114](https://github.com/drwpow/cobalt-ui/pull/114) [`9f62035`](https://github.com/drwpow/cobalt-ui/commit/9f620359ee6c426279645a29edc5854085dd6045) Thanks [@drwpow](https://github.com/drwpow)! - Support arrays of shadows

## 1.4.3

### Patch Changes

- [#92](https://github.com/drwpow/cobalt-ui/pull/92) [`e859bef`](https://github.com/drwpow/cobalt-ui/commit/e859bef2dea05c5087c4205f3ef89dc8273361a3) Thanks [@drwpow](https://github.com/drwpow)! - Sort tokens alphabetically

- Updated dependencies [[`e859bef`](https://github.com/drwpow/cobalt-ui/commit/e859bef2dea05c5087c4205f3ef89dc8273361a3)]:
  - @cobalt-ui/utils@1.2.1

## 1.4.0

### Minor Changes

- [#63](https://github.com/drwpow/cobalt-ui/pull/63) [`f20f589`](https://github.com/drwpow/cobalt-ui/commit/f20f5896568a9f71b90135606eb3abc041263a02) Thanks [@drwpow](https://github.com/drwpow)! - Add `co bundle` command

## 1.3.1

### Patch Changes

- [#61](https://github.com/drwpow/cobalt-ui/pull/61) [`949481f`](https://github.com/drwpow/cobalt-ui/commit/949481ff53489baf485f6befd3befcd6ec176260) Thanks [@drwpow](https://github.com/drwpow)! - Replace better-color-tools with culori for faster, more accurate color operations

## 1.3.0

### Minor Changes

- [#51](https://github.com/drwpow/cobalt-ui/pull/51) [`e1e18c1`](https://github.com/drwpow/cobalt-ui/commit/e1e18c1aa0fca4f3fc915f937fe148ee56ac184f) Thanks [@drwpow](https://github.com/drwpow)! - Allow combining multiple schemas

- [#51](https://github.com/drwpow/cobalt-ui/pull/51) [`e1e18c1`](https://github.com/drwpow/cobalt-ui/commit/e1e18c1aa0fca4f3fc915f937fe148ee56ac184f) Thanks [@drwpow](https://github.com/drwpow)! - Allow loading tokens as YAML

## 1.2.0

### Minor Changes

- [#47](https://github.com/drwpow/cobalt-ui/pull/47) [`432029f`](https://github.com/drwpow/cobalt-ui/commit/432029f78130bec264fbdb26e83a6980fb923b0e) Thanks [@drwpow](https://github.com/drwpow)! - Add global color transform options

## 1.1.3

### Patch Changes

- [#45](https://github.com/drwpow/cobalt-ui/pull/45) [`4e4e2c0`](https://github.com/drwpow/cobalt-ui/commit/4e4e2c03ed0750306633fe757396733b8f6db385) Thanks [@drwpow](https://github.com/drwpow)! - Fix release script

- Updated dependencies [[`4e4e2c0`](https://github.com/drwpow/cobalt-ui/commit/4e4e2c03ed0750306633fe757396733b8f6db385)]:
  - @cobalt-ui/utils@1.1.1

## 1.1.2

### Patch Changes

- [#43](https://github.com/drwpow/cobalt-ui/pull/43) [`8bf696d`](https://github.com/drwpow/cobalt-ui/commit/8bf696d045269ba552424a0221347413a9272cc5) Thanks [@drwpow](https://github.com/drwpow)! - Fix @cobalt-ui/core package import

## 1.1.1

### Patch Changes

- [#37](https://github.com/drwpow/cobalt-ui/pull/37) [`214559f`](https://github.com/drwpow/cobalt-ui/commit/214559f87d5fe38355b5ef0552388397cb77129b) Thanks [@drwpow](https://github.com/drwpow)! - Fix Tokens Studio opacity token type

- [#37](https://github.com/drwpow/cobalt-ui/pull/37) [`214559f`](https://github.com/drwpow/cobalt-ui/commit/214559f87d5fe38355b5ef0552388397cb77129b) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug where `$type: number, $value: 0` was treated as a missing value

## 1.1.0

### Minor Changes

- [#30](https://github.com/drwpow/cobalt-ui/pull/30) [`482f5cd`](https://github.com/drwpow/cobalt-ui/commit/482f5cd4dfd7dd5bf71b64ae1f103322e6709717) Thanks [@drwpow](https://github.com/drwpow)! - Deprecate Figma sync CLI and core functionality (in favor of Tokens Studio support)

- [#30](https://github.com/drwpow/cobalt-ui/pull/30) [`482f5cd`](https://github.com/drwpow/cobalt-ui/commit/482f5cd4dfd7dd5bf71b64ae1f103322e6709717) Thanks [@drwpow](https://github.com/drwpow)! - Add Tokens Studio support

### Patch Changes

- [#33](https://github.com/drwpow/cobalt-ui/pull/33) [`eb942a7`](https://github.com/drwpow/cobalt-ui/commit/eb942a7c50a7afd48e73c0f652f34f71f01db68f) Thanks [@drwpow](https://github.com/drwpow)! - Remove unused deps

- [#30](https://github.com/drwpow/cobalt-ui/pull/30) [`482f5cd`](https://github.com/drwpow/cobalt-ui/commit/482f5cd4dfd7dd5bf71b64ae1f103322e6709717) Thanks [@drwpow](https://github.com/drwpow)! - Fix bug where $value: `0` wasn’t a valid value

- Updated dependencies [[`152f666`](https://github.com/drwpow/cobalt-ui/commit/152f66661de125e1c4b9d872794bbcff8b51de8f)]:
  - @cobalt-ui/utils@1.1.0

## 1.0.0

1.0 Release! 🎉 While the only significant change from `0.x` to `1.x` is the changing of a few font types, this is more of a symbolic release than an actual semver one. The original plan was to wait to release 1.0 when the W3C Design Token spec was finalized. But who knows when that will be? And so this just marks a journey into building a more stable design token foundation, wherever the current spec is at.

Proper semver will still be respected, so while some spec changes are non-breaking, any breaking change from now on will get proper major bumps for everything.

### Minor Changes

- 526777f: Add `fontFamily`, `fontWeight`, `fontName`, and `number` types, remove `font` type

### Patch Changes

- ecc5389: Update TS types for 4.7
- Updated dependencies [ecc5389]
  - @cobalt-ui/utils@0.5.4

## 0.7.4

### Patch Changes

- 91ff661: Update better-color-tools

## 0.7.3

### Patch Changes

- ae8a4d6: Update dependencies
- Updated dependencies [ae8a4d6]
  - @cobalt-ui/utils@0.5.3

## 0.7.2

### Patch Changes

- Update svgo to v3

## 0.7.1

### Patch Changes

- 9edc9d9: Fix token.\_original.$extensions.modes shallow clone bug
- Updated dependencies [9edc9d9]
  - @cobalt-ui/utils@0.5.2

## 0.7.0

### Minor Changes

- e50c864: Add strokeStyle and border support in plugins, improve validation in core

## 0.6.4

### Patch Changes

- Bump @cobalt-ui/utils version

## 0.6.3

### Patch Changes

- e0a2176: Fix type exports

## 0.6.2

### Patch Changes

- Updated dependencies [9e80004]
  - @cobalt-ui/utils@0.5.0

## 0.6.1

### Patch Changes

- ed21d56: Bump deps, add config type to docs
- Updated dependencies [a2a9d62]
- Updated dependencies [ed21d56]
  - @cobalt-ui/utils@0.4.0

## 0.6.0

### Minor Changes

- 07bc365: Update to Feb 2022 version of the Design Tokens format

## 0.5.0

### Minor Changes

- 61a7892: Add ability to load JSON from npm package

## 0.4.0

### Minor Changes

- 8845084: Use kebab-case properties for typography tokens, allow all CSS properties

### Patch Changes

- Fix token value 0

## 0.3.4

### Patch Changes

- c69a62e: Fix nested group bug

## 0.3.3

### Patch Changes

- 8f5025d: Update package description

## 0.3.2

### Patch Changes

- Bump deps

## 0.3.1

### Patch Changes

- 1170d8b: Improve value normalization for duration, dimension, and transition token types

## 0.3.0

### Minor Changes

- 8d05fe8: Add Figma sync, make some breaking API changes

### Patch Changes

- Updated dependencies [8d05fe8]
  - @cobalt-ui/utils@0.3.0

## 0.2.0

### Minor Changes

- 26bfb4c: Convert to JSON, follow design tokens spec

### Patch Changes

- Updated dependencies [26bfb4c]
  - @cobalt-ui/utils@0.2.0

## 0.1.0

### Minor Changes

- 5748e72: Use JSON to align with the Design Tokens W3C spec

### Patch Changes

- Updated dependencies [5748e72]
  - @cobalt-ui/utils@0.1.0
