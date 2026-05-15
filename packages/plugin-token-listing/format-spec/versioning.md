---
title: Versioning
layout: ../../../layouts/docs.astro
# TODO(format-website): replace layout with the format-website's docs layout
---

# Versioning

## The version field

A Token Listing document declares its format version in `meta.version`, an integer:

```jsonc
{ "meta": { "version": 1, /* ... */ }, "data": [/* ... */] }
```

Producers MUST emit an integer. Consumers MUST validate it before processing.

## Bump policy

The format version bumps on **breaking changes only**. Examples of changes that require a bump:

- Removing a normative field.
- Renaming a normative field.
- Changing the type or required-ness of a normative field.
- Changing the semantics of an existing field in a way that breaks consumers.

Examples of changes that do **not** require a bump:

- Adding a new optional field.
- Adding new well-known values to an existing open-string field.
- Clarifying or tightening the documentation of an existing field without changing its observable behaviour.

**Cadence.** Format-level breaking changes are expected to happen on multi-year cycles, not multi-month. The format is meant to be stable for tools that consume it.

## Version 1

Version 1 is the current version, established when the format reached v1.0 final after consultation through the [Style Dictionary RFC discussion](https://github.com/style-dictionary/style-dictionary/discussions/1479).

## JSON Schema

A JSON Schema describing the v1 format is published alongside this spec at [`schema.json`](./schema.json). Tools that need machine-readable validation can use it to verify their inputs and outputs.

The schema is updated alongside the spec text. Producers MAY validate output against the schema before writing to disk; consumers SHOULD validate inputs before processing.
