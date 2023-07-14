# @cobalt-ui/cli

## 1.3.0

### Minor Changes

- [#51](https://github.com/drwpow/cobalt-ui/pull/51) [`e1e18c1`](https://github.com/drwpow/cobalt-ui/commit/e1e18c1aa0fca4f3fc915f937fe148ee56ac184f) Thanks [@drwpow](https://github.com/drwpow)! - Allow combining multiple schemas

- [#51](https://github.com/drwpow/cobalt-ui/pull/51) [`e1e18c1`](https://github.com/drwpow/cobalt-ui/commit/e1e18c1aa0fca4f3fc915f937fe148ee56ac184f) Thanks [@drwpow](https://github.com/drwpow)! - Allow loading tokens as YAML

### Patch Changes

- [#51](https://github.com/drwpow/cobalt-ui/pull/51) [`e1e18c1`](https://github.com/drwpow/cobalt-ui/commit/e1e18c1aa0fca4f3fc915f937fe148ee56ac184f) Thanks [@drwpow](https://github.com/drwpow)! - Breaking: require Node v18 or greater

## 1.2.0

### Minor Changes

- [#47](https://github.com/drwpow/cobalt-ui/pull/47) [`432029f`](https://github.com/drwpow/cobalt-ui/commit/432029f78130bec264fbdb26e83a6980fb923b0e) Thanks [@drwpow](https://github.com/drwpow)! - Add global color transform options

### Patch Changes

- Updated dependencies [[`432029f`](https://github.com/drwpow/cobalt-ui/commit/432029f78130bec264fbdb26e83a6980fb923b0e)]:
  - @cobalt-ui/core@1.2.0

## 1.1.3

### Patch Changes

- [#45](https://github.com/drwpow/cobalt-ui/pull/45) [`4e4e2c0`](https://github.com/drwpow/cobalt-ui/commit/4e4e2c03ed0750306633fe757396733b8f6db385) Thanks [@drwpow](https://github.com/drwpow)! - Fix release script

- Updated dependencies [[`4e4e2c0`](https://github.com/drwpow/cobalt-ui/commit/4e4e2c03ed0750306633fe757396733b8f6db385)]:
  - @cobalt-ui/core@1.1.3
  - @cobalt-ui/utils@1.1.1

## 1.1.2

### Patch Changes

- [#43](https://github.com/drwpow/cobalt-ui/pull/43) [`8bf696d`](https://github.com/drwpow/cobalt-ui/commit/8bf696d045269ba552424a0221347413a9272cc5) Thanks [@drwpow](https://github.com/drwpow)! - Fix @cobalt-ui/core package import

- Updated dependencies [[`8bf696d`](https://github.com/drwpow/cobalt-ui/commit/8bf696d045269ba552424a0221347413a9272cc5)]:
  - @cobalt-ui/core@1.1.2

## 1.1.1

### Patch Changes

- Updated dependencies
  - @cobalt-ui/core@1.1.1

## 1.1.0

### Minor Changes

- [#30](https://github.com/drwpow/cobalt-ui/pull/30) [`482f5cd`](https://github.com/drwpow/cobalt-ui/commit/482f5cd4dfd7dd5bf71b64ae1f103322e6709717) Thanks [@drwpow](https://github.com/drwpow)! - Deprecate Figma sync CLI and core functionality (in favor of Tokens Studio support)

- [#30](https://github.com/drwpow/cobalt-ui/pull/30) [`482f5cd`](https://github.com/drwpow/cobalt-ui/commit/482f5cd4dfd7dd5bf71b64ae1f103322e6709717) Thanks [@drwpow](https://github.com/drwpow)! - Add Tokens Studio support

### Patch Changes

- [#33](https://github.com/drwpow/cobalt-ui/pull/33) [`eb942a7`](https://github.com/drwpow/cobalt-ui/commit/eb942a7c50a7afd48e73c0f652f34f71f01db68f) Thanks [@drwpow](https://github.com/drwpow)! - Remove unused deps

- Updated dependencies [[`482f5cd`](https://github.com/drwpow/cobalt-ui/commit/482f5cd4dfd7dd5bf71b64ae1f103322e6709717), [`482f5cd`](https://github.com/drwpow/cobalt-ui/commit/482f5cd4dfd7dd5bf71b64ae1f103322e6709717), [`152f666`](https://github.com/drwpow/cobalt-ui/commit/152f66661de125e1c4b9d872794bbcff8b51de8f), [`eb942a7`](https://github.com/drwpow/cobalt-ui/commit/eb942a7c50a7afd48e73c0f652f34f71f01db68f), [`482f5cd`](https://github.com/drwpow/cobalt-ui/commit/482f5cd4dfd7dd5bf71b64ae1f103322e6709717)]:
  - @cobalt-ui/core@1.1.0
  - @cobalt-ui/utils@1.1.0

## 1.0.0

1.0 Release! 🎉 While the only significant change from `0.x` to `1.x` is the changing of a few font types, this is more of a symbolic release than an actual semver one. The original plan was to wait to release 1.0 when the W3C Design Token spec was finalized. But who knows when that will be? And so this just marks a journey into building a more stable design token foundation, wherever the current spec is at.

Proper semver will still be respected, so while some spec changes are non-breaking, any breaking change from now on will get proper major bumps for everything.

### Minor Changes

- 526777f: Add `fontFamily`, `fontWeight`, `fontName`, and `number` types, remove `font` type

### Patch Changes

- ecc5389: Update TS types for 4.7
- Updated dependencies [ecc5389]
- Updated dependencies [526777f]
  - @cobalt-ui/utils@0.5.4
  - @cobalt-ui/core@0.8.0

## 0.7.4

### Patch Changes

- 91ff661: Update better-color-tools
- Updated dependencies [91ff661]
  - @cobalt-ui/core@0.7.4

## 0.7.3

### Patch Changes

- ae8a4d6: Update dependencies
- Updated dependencies [ae8a4d6]
  - @cobalt-ui/utils@0.5.3
  - @cobalt-ui/core@0.7.3

## 0.7.2

### Patch Changes

- 42401cd: Improve tokens resolution

## 0.7.1

### Patch Changes

- 3032442: Update undici

## 0.7.0

### Minor Changes

- e50c864: Add strokeStyle and border support in plugins, improve validation in core

### Patch Changes

- Updated dependencies [e50c864]
  - @cobalt-ui/core@0.7.0

## 0.6.2

### Patch Changes

- Bump @cobalt-ui/utils version
- Updated dependencies
  - @cobalt-ui/core@0.6.4

## 0.6.1

### Patch Changes

- 6511100: Fix watch bug

## 0.6.0

### Minor Changes

- 160200f: `co build --watch` now detects config changes

## 0.5.2

### Patch Changes

- Updated dependencies [9e80004]
  - @cobalt-ui/utils@0.5.0
  - @cobalt-ui/core@0.6.2

## 0.5.1

### Patch Changes

- ed21d56: Bump deps, add config type to docs
- Updated dependencies [a2a9d62]
- Updated dependencies [ed21d56]
  - @cobalt-ui/utils@0.4.0
  - @cobalt-ui/core@0.6.1

## 0.5.0

### Minor Changes

- 07bc365: Update to Feb 2022 version of the Design Tokens format

### Patch Changes

- Updated dependencies [07bc365]
  - @cobalt-ui/core@0.6.0

## 0.4.0

### Minor Changes

- 61a7892: Add ability to load JSON from npm package

### Patch Changes

- Updated dependencies [61a7892]
  - @cobalt-ui/core@0.5.0

## 0.3.11

### Patch Changes

- 7b04356: Allow free placement of plugin output files

## 0.3.10

### Patch Changes

- 6ca4403: Fix cobalt check requiring config

## 0.3.9

### Patch Changes

- 6d70a16: Fix build --watch error

## 0.3.8

### Patch Changes

- Updated dependencies [8845084]
  - @cobalt-ui/core@0.4.0

## 0.3.7

### Patch Changes

- @cobalt-ui/core@0.3.4

## 0.3.6

### Patch Changes

- 8f5025d: Update package description
- Updated dependencies [8f5025d]
  - @cobalt-ui/core@0.3.3

## 0.3.5

### Patch Changes

- Bump deps
- Updated dependencies
  - @cobalt-ui/core@0.3.2

## 0.3.4

### Patch Changes

- Bump @cobalt-ui/core version

## 0.3.3

### Patch Changes

- d5ffc09: Fix co check command

## 0.3.2

### Patch Changes

- 395e388: Fix figma font style

## 0.3.1

### Patch Changes

- 4b9da94: Fix co init

## 0.3.0

### Minor Changes

- 8d05fe8: Add Figma sync, make some breaking API changes

### Patch Changes

- Updated dependencies [8d05fe8]
  - @cobalt-ui/core@0.3.0
  - @cobalt-ui/utils@0.3.0

## 0.2.1

### Patch Changes

- 6feabd5: Fix build bug

## 0.2.0

### Minor Changes

- 26bfb4c: Convert to JSON, follow design tokens spec

### Patch Changes

- Updated dependencies [26bfb4c]
  - @cobalt-ui/core@0.2.0
  - @cobalt-ui/utils@0.2.0

## 0.1.0

### Minor Changes

- 5748e72: Use JSON to align with the Design Tokens W3C spec

### Patch Changes

- Updated dependencies [5748e72]
  - @cobalt-ui/core@0.1.0
  - @cobalt-ui/utils@0.1.0

## 0.0.2

### Patch Changes

- 6bd02b5: Add image fetching from Figma
- Updated dependencies [6bd02b5]
  - @cobalt-ui/core@0.0.2

## 0.0.1

### Patch Changes

- 21c653b: Add Figma support
- Updated dependencies [21c653b]
  - @cobalt-ui/core@0.0.1
