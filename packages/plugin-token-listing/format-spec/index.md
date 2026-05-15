---
title: Token Listing Format
layout: ../../../layouts/docs.astro
# TODO(format-website): replace layout with the format-website's docs layout
---

# Token Listing Format

The Token Listing Format is a community design-tokens interchange format. Tools that need to understand a built design token system — its names across platforms, its source provenance, its modes, its aliases — can consume a Token Listing file rather than each tool reinventing its own input format.

This site documents the format itself. For the reference implementation that produces Token Listing files from a [Terrazzo](https://terrazzo.app) build, see [`@terrazzo/plugin-token-listing`](https://terrazzo.app/docs/integrations/token-listing).

## Current version

**Token Listing 1.** Format version is an integer, expected to bump on multi-year cycles when breaking changes are unavoidable. See [Versioning](./versioning.md).

## Pages

- [Overview](./overview.md) — purpose, audience, design goals.
- [Specification](./spec.md) — normative field-by-field reference.
- [Examples](./examples.md) — complete annotated listings.
- [Versioning](./versioning.md) — version policy and the JSON Schema.
- [Glossary](./glossary.md) — terms used throughout the spec.

## RFC

The format is currently under discussion at <https://github.com/style-dictionary/style-dictionary/discussions/1479>. Comments and feedback welcome.
