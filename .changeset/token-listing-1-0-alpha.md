---
"@terrazzo/plugin-token-listing": major
---

Token Listing Format reaches v1.0. Single jump from format alpha-3 conventions to format 1.0 final, with breaking changes throughout.

**Format-level changes:**

- Per-token extension key renamed `"app.terrazzo.listing"` → `"listing"`.
- Per-token `names` (flat platform-name map) replaced by `platforms` (per-platform object with required `name`, optional `value` and `deprecated`). Presence of an entry signals the token exists on that platform.
- Per-token `originalValue` replaced by `aliasChain` (ordered array of token IDs along the alias resolution path, source → leaf). Omitted for non-aliased tokens.
- Per-token `source` rewritten against [Resolver Spec 1.0](https://www.designtokens.org/tr/2025.10/resolver/): `$ref` (RFC 6901 JSON Pointer to where the token's value lives), optional `via` (same-document pointer into the resolver, identifying which set or modifier context introduced the token; omitted when no `resolver.json` is provided), and optional `loc`. The `resource` field with `<root>` placeholder is gone.
- New `meta.groups` map exposes group-level descriptions and deprecation, keyed by group ID.
- `subtype` enum frozen at the original 9 values.
- `previewValue` typed as string only; numeric returns from custom functions are coerced.

**Plugin-level changes:**

- `resourceRoot` config option removed. Source paths are now relative to the resolver document if a `resolver.json` is provided, else relative to the build cwd.
- `modes` config now derives entries from `resolver.json` modifiers when a real resolver is provided; the config can only enrich descriptions. Mismatched names, values, or defaults fail the build.
- `PlatformOption` accepts `value` and `deprecated` callback or plugin-name shorthands.
- `FORMAT_ID` exported constant value is now `'listing'`.

See the integration doc and format spec for full details.
