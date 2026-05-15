---
title: Glossary
layout: ../../../layouts/docs.astro
# TODO(format-website): replace layout with the format-website's docs layout
---

# Glossary

## Set

A named group of token sources, defined in a [Resolver Spec 1.0](https://www.designtokens.org/tr/2025.10/resolver/) `resolver.json`. Sets are unconditional: tokens declared in a set are always included in the resolved output.

In a Token Listing, set membership is reflected via `source.via` as `#/sets/<name>`. See [`spec.md`](./spec.md#source).

## Modifier

A named pivot point in a [Resolver Spec 1.0](https://www.designtokens.org/tr/2025.10/resolver/) `resolver.json` that conditionally includes token sources based on a context value. A modifier has multiple contexts (e.g. `light` and `dark`); applying the resolver picks one context per modifier.

In a Token Listing, modifier-context membership is reflected via `source.via` as `#/modifiers/<name>/contexts/<context>`.

## Context

A named slot inside a modifier, holding token sources to apply when the modifier is set to that slot. Examples: a `theme` modifier with `light` and `dark` contexts; a `device` modifier with `mobile`, `tablet`, and `desktop` contexts.

## Platform

A target environment a design token is built for: CSS, Sass, Tailwind, Figma, Android, iOS. In a Token Listing, the `meta.platforms` map catalogs the platforms covered by the listing, and per-token `$extensions.listing.platforms` records the token's identifier (and optionally value and deprecation status) on each.

## Mode

A variant axis along which token values vary: light vs. dark, mobile vs. desktop. Modes are described in `meta.modes` and surfaced per-token via `$extensions.listing.mode`.

A token with multiple modes produces multiple entries in `data` — one per mode. The default mode (`.`) is omitted from the per-token `mode` field.

When a `resolver.json` is provided to a producer, modes correspond directly to resolver modifiers. Without a resolver, modes come from the producer's configuration.

## Source of truth

The platform that serves as the canonical authoring location for a token. Tools surface this to direct users to the right place to edit a token.

In a Token Listing, the global default is at `meta.sourceOfTruth`; per-token overrides at `$extensions.listing.sourceOfTruth`.

## Alias chain

The ordered sequence of token IDs that a token resolves through, source → leaf. For a chain like `A → B → C`, an entry for token `A` would have `aliasChain: ["B", "C"]`.

Sub-property aliases inside structured values (e.g. a typography object with one alias-valued sub-key) are not captured.

## $ref

In Token Listing's `source.$ref`, an [RFC 6901](https://datatracker.ietf.org/doc/html/rfc6901) JSON Pointer in [Resolver Spec 1.0](https://www.designtokens.org/tr/2025.10/resolver/) syntax. Combines a path component (file path relative to resolver or cwd) with a fragment (`#/...`) pointing to the token's location inside that file.

## via

A same-document JSON Pointer into the resolver, identifying which set or modifier context introduced a token. Examples: `#/sets/color`, `#/modifiers/theme/contexts/dark`. Omitted when no resolver is in use.
