---
title: Overview
layout: ../../../layouts/docs.astro
# TODO(format-website): replace layout with the format-website's docs layout
---

# Overview

## What the format is

The Token Listing Format is a JSON file produced by a design tokens build system that lists every built token in a structured, predictable shape. It complements the [Design Tokens Community Group (DTCG)](https://www.designtokens.org/) authoring format. DTCG describes how humans author tokens; Token Listing describes what comes out the other end of a build, ready for tools to consume.

A Token Listing file contains:

- **Metadata** about the listing as a whole (the format version, the producing tool, the modes available, the platforms covered, the source of truth, group descriptions).
- **A flat array of token entries**, one per token-and-mode combination. Each entry preserves DTCG-standard fields, plus a `listing` extension capturing platform mappings, alias chains, source provenance, and other tool-relevant data.

The format is deliberately tool-facing. It is regenerated on every build, not authored by hand, and designed for completeness over terseness.

## Audience

**Tool authors** building design-token-aware software:

- Documentation websites that render token previews, names, and descriptions.
- Diff and changelog generators tracking token changes between releases.
- Linting and review tools enforcing token-naming or token-usage policies.
- Code migration tools renaming token references at scale.
- Search indexes powering "find this token" features in IDEs and design tools.
- MCP servers exposing token data to AI assistants.

**Design system teams** who want their tokens to integrate cleanly with the tools above without per-tool conversion scripts.

## Design goals

- **Interoperability.** Any compliant producer's output is consumable by any compliant consumer. A team can switch build systems and keep their tools.
- **Format-agnostic on consumption.** The format does not assume a specific platform or tooling. Consumers ignore fields they don't recognise (where the spec permits) and fall back gracefully.
- **Tool-friendly.** Fields named for what tools want to do: `previewValue` for rendering a swatch, `aliasChain` for navigating alias graphs, `via` for understanding resolver structure.
- **Aligned with DTCG ecosystem standards.** The format reuses DTCG token shapes verbatim where possible, and uses the [Resolver Spec 1.0](https://www.designtokens.org/tr/2025.10/resolver/) idioms (RFC 6901 JSON Pointers) for source references.

## Non-goals

- **Not a replacement for DTCG.** Token Listing is a layer on top, designed for already-built output.
- **Not a transport format.** It carries data already computed by a build, not data to be re-interpreted at runtime in a UI or app.
- **Not a renderer hint format.** Subtypes are descriptive metadata, not rendering instructions. Tools decide how to render.

## How tools should consume it

A tool reading a Token Listing file should:

1. Validate `meta.version` is an integer it knows how to handle.
2. Iterate `data` for token entries, consuming whichever DTCG fields and `$extensions.listing` fields it cares about.
3. Treat unknown fields under `$extensions.listing` as forward-compatible additions; ignore them rather than failing.
4. Use `meta.modes`, `meta.platforms`, `meta.groups`, and `meta.sourceOfTruth` for top-level context.
