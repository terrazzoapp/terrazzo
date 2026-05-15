# RFC update: Token Listing Format v1.0

> Copy-paste-ready markdown for posting to <https://github.com/style-dictionary/style-dictionary/discussions/1479>. Update the dates, links, and version numbers below before posting.

---

Hi everyone — pushing an update on Token Listing.

The format has reached **v1.0 final**. We've also published the first reference implementation as `@terrazzo/plugin-token-listing@1.0.0-alpha.0`, the JSON Schema, and a dedicated specification site (linked below).

## Summary of changes since the last alpha update

Several things settled since we last touched this thread. Most are simplifications; a few are renames driven by what consumers actually need.

**Format-level changes:**

- **Extension key renamed** `"app.terrazzo.listing"` → `"listing"`. The format is meant to be cross-vendor; reverse-DNS namespacing implied a Terrazzo / DTCG ownership we don't have.
- **`names` → `platforms`** (per-token). The flat name dictionary became a richer per-platform object with `name` (required), `value` (optional, the built/serialised value on that platform), and `deprecated` (optional, may diverge from token-level `$deprecated`).
- **`originalValue` → `aliasChain`**. Replaces the raw source value with an ordered array of token IDs along the alias resolution path (source → leaf). Diff/doc/MCP/search tools all want navigation, not source-value preservation. Consumers needing the raw source can re-parse via `source.$ref`.
- **`source` aligned with [Resolver Spec 1.0](https://www.designtokens.org/tr/2025.10/resolver/)**. The old `resource` field with `<root>` placeholder is replaced with two RFC 6901 JSON Pointer strings:
  - `$ref`: where the token's value lives (file + JSON path, relative to resolver dir or cwd).
  - `via`: same-document pointer into the resolver document, identifying which set or modifier context introduced the token (e.g. `#/sets/color`, `#/modifiers/theme/contexts/dark`). Omitted when no `resolver.json` is provided.
- **New `meta.groups`** — flat map keyed by group ID, with optional `description` and `deprecated`. Tools rendering documentation can pull group-level metadata directly without walking the token tree.
- **`subtype` enum frozen** at the original 9 values (`bgColor`, `fgColor`, `borderColor`, `padding`, `margin`, `gap`, `size`, `borderWidth`, `borderRadius`). New values require a format version bump. This was deliberate — open-string subtypes risk fragmentation that hurts adoption.
- **`previewValue` typed as string only**. The format spec already required valid CSS, so allowing numbers in the type was a contradiction. Producers coerce numeric internal values to strings.
- **`meta.version`** stays a numeric integer (`1`). Bumps on multi-year cycles for breaking changes.

**Plugin-level changes (Terrazzo reference impl):**

- **Modes auto-inferred from `resolver.json`**. When a real resolver is provided, mode entries (name, values, default) come from the resolver's modifiers. The plugin's `modes:` config can only enrich descriptions; mismatched names, values, or defaults fail the build.
- **`resourceRoot` config dropped**. Path anchoring is now implicit: relative to the resolver document if a resolver is present, else relative to the build cwd. The `<root>` placeholder is gone from output.

## What's published

- **Format spec.** Full normative spec, examples, glossary, and JSON Schema. <!-- TODO(format-website): link to format website index -->
- **JSON Schema.** Draft 2020-12 schema for v1 validation. <!-- TODO(format-website): link to schema.json -->
- **Reference plugin.** `@terrazzo/plugin-token-listing@1.0.0-alpha.0` on npm. Plugin docs at <https://terrazzo.app/docs/integrations/token-listing>; conceptual guide at <https://terrazzo.app/docs/guides/token-listing>.

## Why alpha

The format itself is final. The alpha tag is on the reference plugin's *config surface*, not the format. After 1–2 weeks of public alpha use without churn we'll cut `1.0.0` final.

## Asks

1. Anyone consuming an earlier alpha: please flag breakage. Most of you should be fine since this never had stable consumers.
2. Tool authors building Token Listing consumers: try the JSON Schema, file issues if anything's unclear in the spec.
3. Implementors who want to add support to other build tools (Style Dictionary, Theo, custom in-house): the spec is intentionally implementation-agnostic. Reach out if anything is ambiguous.

Thanks for the feedback through this whole process. Looking forward to seeing this land in more tools.
