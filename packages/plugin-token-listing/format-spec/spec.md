---
title: Specification
layout: ../../../layouts/docs.astro
# TODO(format-website): replace layout with the format-website's docs layout
---

# Token Listing Format — Specification

This page is the normative field-by-field reference for the Token Listing Format, version 1. Consumers and producers MUST follow this spec to be considered compliant.

The key words **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** in this document are to be interpreted as described in [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119).

## Document shape

A Token Listing document is a JSON object with two top-level keys:

```jsonc
{
  "meta": { /* see §1 */ },
  "data": [ /* see §2 */ ]
}
```

Both `meta` and `data` MUST be present. `data` MAY be an empty array. Producers MAY emit additional top-level keys for vendor-specific data; consumers SHOULD ignore unknown top-level keys.

## §1 — `meta`

### `meta.version`

- **Type:** integer.
- **Required:** yes.
- **Semantics:** the format version. Bumps on breaking changes only.
- This document specifies version `1`.

### `meta.authoringTool`

- **Type:** string.
- **Required:** yes.
- **Semantics:** identifies the tool that produced the listing. Free-form. Examples: `"Terrazzo"`, `"Style Dictionary"`, `"my-custom-build"`.

### `meta.modes`

- **Type:** array of `ModeOption` objects (see below).
- **Required:** no. Omitted when no tokens have modes.
- **Semantics:** catalog of the modes available in the listing.

Each `ModeOption` object has:

| Field         | Type     | Required | Semantics                                                                       |
|---------------|----------|----------|---------------------------------------------------------------------------------|
| `name`        | string   | yes      | The mode's identifier. Matches the per-token `mode` field.                      |
| `values`      | string[] | yes      | Possible values for the mode.                                                   |
| `description` | string   | no       | Human-readable description.                                                     |
| `default`     | string   | no       | Default value. MUST be in `values` when present.                                |

### `meta.platforms`

- **Type:** map keyed by platform ID.
- **Required:** no. Omitted when no platforms are configured.
- **Semantics:** catalog of the platforms the listing covers.

Each entry has the shape `{ description?: string }`. Producers MAY add additional keys; consumers SHOULD ignore unknown keys.

### `meta.groups`

- **Type:** map keyed by group ID (DTCG dot-separated path).
- **Required:** no. Omitted when no group has description or deprecation.
- **Semantics:** group-level metadata extracted from DTCG groups during the build.

Each entry has:

| Field         | Type                | Required | Semantics                                                                |
|---------------|---------------------|----------|--------------------------------------------------------------------------|
| `description` | string              | no       | Group-level description, may be cascaded from a parent group.             |
| `deprecated`  | string \| boolean   | no       | Group-level deprecation marker. `false` SHOULD NOT be emitted.            |

Only groups carrying at least one of these fields are emitted.

### `meta.sourceOfTruth`

- **Type:** string.
- **Required:** no.
- **Semantics:** the platform that acts as the global source of truth for tokens in this listing. Per-token overrides MAY appear at `$extensions.listing.sourceOfTruth`.

## §2 — `data`

`data` is an array of `ListedToken` objects. Each entry represents one token in one mode. Tokens with multiple modes SHALL produce multiple entries.

### Top-level fields

These pass through from the source DTCG token. They preserve DTCG semantics.

| Field          | Type                                | Required | Semantics                                                              |
|----------------|-------------------------------------|----------|------------------------------------------------------------------------|
| `$name`        | string                              | yes      | The token's ID (DTCG dot-separated path).                              |
| `$type`        | string                              | yes      | DTCG type.                                                             |
| `$description` | string                              | no       | DTCG description.                                                      |
| `$value`       | varies (DTCG type-dependent)        | yes      | Token value for the entry's mode.                                      |
| `$deprecated`  | string \| boolean                   | no       | DTCG deprecation marker.                                               |
| `$extensions`  | object                              | yes      | MUST include the `listing` key (§3); MAY include other vendor keys.    |

### `$extensions.listing`

All Token Listing-specific fields live under this key. The key is the bare string `"listing"` (not reverse-DNS namespaced).

## §3 — `$extensions.listing` fields

### `platforms`

- **Type:** map keyed by platform ID.
- **Required:** yes. MAY be an empty object when the token has no platform mappings.
- **Semantics:** per-platform information about this token. **Presence of an entry signals the token exists on that platform.** Absence means it does not.

Each entry has:

| Field        | Type              | Required | Semantics                                                                    |
|--------------|-------------------|----------|------------------------------------------------------------------------------|
| `name`       | string            | yes      | Token identifier on this platform (CSS variable, Figma path, etc.).          |
| `value`      | string            | no       | Built/serialised value on this platform.                                     |
| `deprecated` | string \| boolean | no       | Per-platform deprecation marker. May diverge from token-level `$deprecated`. |

### `mode`

- **Type:** string.
- **Required:** no.
- **Semantics:** the mode this entry corresponds to. Omitted when the entry corresponds to the default `.` mode.

### `subtype`

- **Type:** string from the closed v1 enum.
- **Required:** no.
- **Semantics:** a fine-grained type hint for tools that render tokens.

The closed v1 enum:

- `bgColor`
- `fgColor`
- `borderColor`
- `padding`
- `margin`
- `gap`
- `size`
- `borderWidth`
- `borderRadius`

Consumers encountering unknown values SHOULD fall back to the token's `$type`. New values require a format version bump.

### `sourceOfTruth`

- **Type:** string.
- **Required:** no.
- **Semantics:** per-token override of `meta.sourceOfTruth`.

### `aliasChain`

- **Type:** array of strings.
- **Required:** no. Omitted for non-aliased tokens.
- **Semantics:** ordered token IDs along the alias resolution path, source → leaf. The first element is the immediate alias target; the last is the leaf token whose `$value` is the resolved value.

Sub-property aliases inside structured values (e.g. a typography object referencing `{color.fg}` for a sub-key) are NOT captured by `aliasChain`. Consumers needing that fidelity MUST re-parse the source via `source.$ref`.

### `previewValue`

- **Type:** string.
- **Required:** no.
- **Semantics:** a valid CSS expression that previews the token. Producers MAY omit when no useful preview is computable.

Producers MUST emit a string. Numeric internal values SHOULD be coerced to strings. Empty strings SHOULD NOT be emitted.

### `source`

- **Type:** object.
- **Required:** no.
- **Semantics:** describes the token's origin in source documents.

| Field   | Type   | Required | Semantics                                                                                   |
|---------|--------|----------|---------------------------------------------------------------------------------------------|
| `$ref`  | string | yes      | RFC 6901 JSON Pointer, [Resolver Spec 1.0](https://www.designtokens.org/tr/2025.10/resolver/) syntax. Path component is relative to the resolver document if a resolver was used; else relative to the build's working directory. |
| `via`   | string | no       | Same-document JSON Pointer into the resolver, identifying the resolver entry that brought this token in (e.g. `#/sets/color`, `#/modifiers/theme/contexts/dark`). Producers MUST omit when no resolver was provided.            |
| `loc`   | object | no       | Byte/line/column range of the token's authoring location. Producers MAY emit; consumers MAY ignore.                                                                                                                              |

When `loc` is present, it has the shape:

```jsonc
{
  "start": { "line": <number>, "column": <number>, "offset": <number> },
  "end":   { "line": <number>, "column": <number>, "offset": <number> }
}
```

Lines are 1-indexed; columns and offsets are 0-indexed.

## §4 — Forward compatibility

Producers MAY emit additional fields under `meta`, `$extensions.listing`, or any other location not specified here, provided they don't conflict with normative field names. Consumers SHOULD ignore unknown fields rather than fail. Vendor-specific data SHOULD use vendor-namespaced keys (e.g. `$extensions.listing.x-mycompany-foo`) to avoid future-spec collisions.

Adding new normative fields, changing the type of an existing field, removing a field, or changing the semantics of an existing field requires bumping `meta.version`.
