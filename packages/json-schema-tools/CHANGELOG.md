# @terrazzo/json-schema-tools

## 0.2.0

### Minor Changes

- ⚠️ Breaking change: the `bundle()` command now changes how dynamic `$ref`s are parsed. If they are part of the original array of files, they’ll be flattened into the same document. But for any `$ref`s encountered dynamically, they’ll be injected into `#/$defs/…`. This is to allow partials and other unmerge-able documents.
- ⚠️ Breaking change: `bundle()` no longer inlines `$ref`s, but it does ensure they’re non-circular (resolveable), and ensure they’re all within the document (i.e. no external URLs or files). This not only reduces the overall bundle size, it also preserves original authorship a bit better especially when it comes to `description`, etc.
- ⚠️ Breaking change: `bundle()` no longer provides a `refMap` since alias resolution is now deferred to consumers.

## 0.1.0

### Patch Changes

- Breaking change: `req` must be provided to `bundle()` to defer fetching and file reads to user
