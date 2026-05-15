---
title: Token Listing
layout: ../../../layouts/docs.astro
---

# Token Listing

Token Listing is a design token interchange format that captures everything tools need to know about a built design token system: how each token is named on every platform, where it came from, which modes it has, and how it relates to other tokens through aliases. This page explains the why and the synthetic how. For the Terrazzo plugin reference, see the [integration page](/docs/integrations/token-listing). For the format itself, see the format specification: <!-- TODO(format-website): link to format website -->.

## Why a token listing format

Design tokens are authored once in DTCG JSON, but they ship out to many places: CSS, Sass, Tailwind, Figma, native apps. Tools that work *across* this divide — diff tools, documentation websites, MCP servers, linting plugins, search indexes, code-migration tools — need to understand the relationship between the source token and its platform-specific outputs.

Without a shared format, every tool reinvents an input shape. Teams maintain their tokens once for authoring, then again in tool-specific input formats. Each integration drifts. With Token Listing, tool authors have a predictable input that any DTCG-aware build can produce, and teams ship one file that every consuming tool can read.

The format is consumed by tools, not humans. It is verbose by design — completeness matters more than terseness — and it is meant to be regenerated on every build, not edited by hand.

## Mental model

A Token Listing is a flat list of tokens (one entry per token *per mode*) plus metadata describing the listing as a whole. Six concepts cover almost everything in the format:

**Identity.** Every entry carries DTCG-standard fields: `$name`, `$type`, `$value`, `$description`, `$deprecated`. These pass through unchanged from the source tokens. They answer "what is this token?".

**Platform mapping.** Under each token's `$extensions.listing.platforms`, the format records what the token is called on every platform it ships to (CSS variable name, Figma path, Tailwind class). Optionally, it also records the **built value** on that platform (e.g. CSS plugin's resolved string, Figma plugin's hex) and a **per-platform deprecation marker** that may differ from the token-level `$deprecated`. The presence of an entry under `platforms` signals "this token exists on that platform"; absence means it doesn't.

**Modes.** When tokens have alternative values for different modes (`light`/`dark`, mobile/desktop), the listing emits one entry per mode. Listing metadata catalogs the available modes with their values, defaults, and descriptions. Tools use this to build mode pickers and to filter which token entries to display.

**Source provenance.** Every token tracks where it came from in the source files. The `source.$ref` field is an [RFC 6901](https://datatracker.ietf.org/doc/html/rfc6901) JSON Pointer in [Resolver Spec](https://www.designtokens.org/tr/2025.10/resolver/) syntax — pointing into the file and JSON path the token was authored in. The `source.via` field, when a resolver is in use, identifies *which resolver entry* (a set or a modifier context) included this token. Tools that need to deep-link into source code use `$ref` and `loc`; tools that need to reason about set/modifier membership use `via`.

**Source of truth.** When a design system has more than one place tokens are authored (e.g. some tokens come from Figma, others from a developer-curated CSS file), the listing's `meta.sourceOfTruth` declares the global default, and individual tokens may override it. Tools that surface "where do I edit this?" links use this to direct users to the right place.

**Aliases.** When a token aliases another token (`{color.brand.500}`), the listing emits an `aliasChain` of token IDs along the resolution path, source → leaf. This lets diff tools, documentation sites, and search indexes navigate alias relationships without re-running the resolver.

## A small example

A minimal listing for a single color token:

```jsonc
{
  "meta": {
    "version": 1,
    "authoringTool": "Terrazzo",
    "platforms": {
      "css": { "description": "CSS custom properties" }
    },
    "sourceOfTruth": "figma"
  },
  "data": [
    {
      "$name": "color.brand.500",
      "$type": "color",
      "$value": { "colorSpace": "srgb", "components": [0.66, 0.20, 0.20], "alpha": 1 },
      "$extensions": {
        "listing": {
          "platforms": {
            "css": { "name": "--color-brand-500", "value": "#a83232" }
          },
          "previewValue": "#a83232",
          "source": {
            "$ref": "tokens.json#/color/brand/500",
            "loc": { "start": { "line": 5, "column": 14, "offset": 64 },
                     "end":   { "line": 9, "column": 8,  "offset": 134 } }
          }
        }
      }
    }
  ]
}
```

The token has one platform (CSS), no resolver, no modes, no aliases. The format scales up to many platforms, multiple modes per token, modifier-context tokens with `via` references, alias chains many tokens deep, and group-level metadata in `meta.groups`. See the [format specification](/docs/integrations/token-listing) <!-- TODO(format-website): link to format spec page --> for the full field reference.

## Where to go next

- **Use the plugin.** [`@terrazzo/plugin-token-listing`](/docs/integrations/token-listing) is the reference implementation. It produces a Token Listing file from any Terrazzo build.
- **Build a tool that consumes Token Listings.** See the format specification <!-- TODO(format-website): link to format website --> for normative field-level details and the JSON Schema.
- **Contribute to the format.** Token Listing is a community proposal still under discussion. Comment on the [RFC discussion thread](https://github.com/style-dictionary/style-dictionary/discussions/1479).
