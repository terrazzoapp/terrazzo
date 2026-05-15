# Token Listing format v1.0 — design spec

**Status:** Brainstormed; ready for implementation planning.
**Date:** 2026-05-03.
**Owner:** Steve Dodier-Lazaro.
**Scope:** Finalise the Token Listing format at v1.0 and bring `@terrazzo/plugin-token-listing` to a production-quality reference implementation. Land in a single release jumping straight from format alpha-3 conventions to format 1.0 final.

This document captures every shape, behaviour, and surface decision agreed during brainstorming so the implementation plan has a single source of truth. The implementation order, fixture details, and per-PR boundaries are deferred to the writing-plans phase.

---

## 1. Goals and non-goals

**Goals.**

- Finalise the Token Listing format at v1.0. The format becomes a stable public contract that documentation websites, MCP servers, design-token diff tools, and other tools can consume.
- Bring `@terrazzo/plugin-token-listing` to a production-quality reference implementation: full coverage of the format, doc surfaces matching the doc structure of the rest of the Terrazzo site, error paths exercised in tests, and a JSON Schema shipped alongside the spec.
- Pre-generate the content of a future Token Listing format website inside the plugin package, so the website build is just a content-copy followup.
- Draft a copy-paste-ready RFC update comment for the GitHub discussion that hosts the format proposal.

**Non-goals.**

- Publishing the RFC update on the GitHub discussion. The human operator posts the drafted markdown.
- Building the standalone Token Listing format website. Followup session.
- Cutting `@terrazzo/plugin-token-listing@1.0.0` final. This release ships `1.0.0-alpha.0`; final happens after a brief alpha period without churn.
- Adding a `loc`-disable config flag. Considered post-1.0 if listing size becomes a concern.

---

## 2. Format v1.0

### 2.1 Top-level shape

```jsonc
{
  "meta": {
    "version": 1,
    "authoringTool": "Terrazzo",
    "modes": [
      {
        "name": "color-scheme",
        "values": ["light", "dark"],
        "description": "Color theme matching user device preferences",
        "default": "light"
      }
    ],
    "platforms": {
      "css":   { "description": "Tokens built as CSS variables for the developers" },
      "figma": { "description": "Figma variables curated by the design team" }
    },
    "groups": {
      "color":            { "description": "All color tokens" },
      "color.brand":      { "deprecated": true },
      "typography.body":  { "description": "Body text styles", "deprecated": "use typography.text" }
    },
    "sourceOfTruth": "figma"
  },
  "data": [ /* listed tokens — see 2.2 */ ]
}
```

**`meta.version`.** Integer. Bumps only on breaking format changes. Years between bumps expected. Calver-style external naming ("Token Listing 2026.10") is acceptable in human-facing documentation but the wire field stays a numeric integer.

**`meta.authoringTool`.** String identifying the tool that produced the listing. The reference plugin emits `"Terrazzo"`.

**`meta.modes`.** Optional array of mode definitions. Each entry: `name` (string, required), `values` (string array, required), `description` (string, optional), `default` (string, optional, must be in `values`). Emission rules in §3.2.

**`meta.platforms`.** Optional. Map keyed by platform id. Each value: `{ description?: string }`. Reserved for future top-level platform metadata; richer platform-level fields are not added in v1.0.

**`meta.groups`.** Optional. Flat map keyed by group id (DTCG dot-separated path). Each value: `{ description?: string, deprecated?: string | boolean }`. Only groups carrying at least one of the two fields are emitted. Group descriptions and deprecation cascade through DTCG inheritance during parsing; emission preserves the cascaded value at every group key that has one. The keys inside group entries do not use `$` prefixes — `meta.*` is plugin-level metadata, not DTCG token data, and the rest of `meta` is unprefixed.

**`meta.sourceOfTruth`.** Optional. String naming the platform that acts as the global source of truth for tokens in this listing. Per-token override at `$extensions.listing.sourceOfTruth`.

### 2.2 Per-token shape

Each entry in `data` is one listed token in one mode. Tokens with multiple modes produce multiple entries.

```jsonc
{
  "$name": "color.brand.500",
  "$type": "color",
  "$description": "Brand primary",
  "$value": { /* DTCG normalized value */ },
  "$deprecated": false,
  "$extensions": {
    "listing": {
      "platforms": {
        "css":   { "name": "--color-brand-500", "value": "#aabbcc" },
        "figma": { "name": "color/brand/500", "deprecated": "Use semantic tokens" }
      },
      "mode": "dark",
      "subtype": "bgColor",
      "sourceOfTruth": "css",
      "aliasChain": ["color.semantic.fg", "color.brand.500", "color.blue.500"],
      "previewValue": "#aabbccff",
      "source": {
        "$ref": "base/colors.json#/color/brand/500",
        "via":  "#/sets/brand",
        "loc":  { "start": { "line": 21, "column": 14, "offset": 556 },
                  "end":   { "line": 28, "column": 8,  "offset": 770 } }
      }
    }
  }
}
```

**Top-level fields** (`$name`, `$type`, `$description`, `$value`, `$deprecated`) are DTCG passthroughs. `$description` is included when present on the token (this fixes the missing `$description` in the current implementation's doc examples).

**`$extensions.listing`.** All Token Listing-specific data lives here. The extension key is the bare string `"listing"`. The format is a community-targeted specification; using a non-vendor key reflects that it is not Terrazzo-private. The reverse-DNS DTCG convention is intentionally not followed because doing so would imply DTCG endorsement we do not have.

#### `platforms`

Map keyed by platform id (matches the `meta.platforms` keys). Presence of an entry means the token exists on that platform. Absence means it does not.

Per-platform fields:

- `name`: required when the entry exists. The token's identifier on that platform (CSS variable name, Figma variable path, etc.).
- `value`: optional. The token's serialised/built value on that platform — the literal output that platform's plugin produced (e.g. CSS plugin's resolved string, Figma plugin's hex). Sourced from the same plugin transform pipeline that supplies `name`.
- `deprecated`: optional. Boolean or string, matching DTCG's `$deprecated` shape. Per-platform deprecation can diverge from token-level `$deprecated`. Sourced from plugin transform pipeline meta or a custom function. A returned `false` is preserved (means "explicitly not deprecated on this platform"). Returning `undefined` from a custom function omits the field.

Per-platform `value` and `deprecated` do not interact with token-level fields. Consumers reading per-platform info see the per-platform field; consumers ignoring `platforms` see the token-level fields.

#### `mode`

Optional string. The mode this entry corresponds to. Emitted only when the mode is not the default `.`.

#### `subtype`

Optional. Frozen 9-value enum for v1.0:

- `bgColor`
- `fgColor`
- `borderColor`
- `padding`
- `margin`
- `gap`
- `size`
- `borderWidth`
- `borderRadius`

Computed by a user-supplied function. Tools render based on the subtype when present; otherwise fall back to `$type`. New values require a format version bump.

#### `sourceOfTruth`

Optional string. Per-token override of `meta.sourceOfTruth`.

#### `aliasChain`

Optional. Ordered string array of token ids representing the alias resolution path, source → leaf. Omitted for non-aliased tokens. Replaces the previous `originalValue` field; the navigable chain serves diff, doc, MCP, and search use cases more cleanly than the raw source value.

Sub-property aliases inside structured values (e.g. a typography object referencing `{color.fg}` for one of its keys) are not captured by `aliasChain`. Consumers needing that fidelity re-parse the source via `source.$ref`.

#### `previewValue`

Optional string. A valid CSS expression for previewing the token. Type signature is string-only; numeric returns from the user's custom function are coerced via `String(...)` before emission. Empty strings are not emitted.

#### `source`

Optional object describing where the token originates. Three keys:

- `$ref`: required when `source` is emitted. RFC 6901 JSON Pointer string per Resolver Spec 1.0 syntax. Examples:
  - External-file token: `"colors.json#/color/brand/500"`.
  - Token inlined in a resolver document's set: `"#/sets/brand/sources/0/color/brand/500"`.
  - Token inlined in a modifier context: `"#/modifiers/theme/contexts/dark/0/color/bg/primary"`.
  - Synthetic-resolver case: `"<original-tokens-file>#/<json-path>"`.

  Path component is relative to the resolver document when a `resolver.json` is provided, else relative to the build cwd. No `<root>` placeholder.

- `via`: optional. Same-document JSON Pointer into the resolver, identifying the resolver entry that brought this token in. Examples:
  - Set: `"#/sets/color"`.
  - Modifier context: `"#/modifiers/theme/contexts/dark"`.

  Omitted entirely when no `resolver.json` was provided (synthetic-resolver case). Consumers parse `via` as a `$ref` and read `/sets/...` vs `/modifiers/...` to determine origin kind without an invented enum.

- `loc`: optional. Byte/line/column range of the token's authoring location inside the file at `$ref`. Editor and IDE plugins consume `loc`; spec-purist or size-constrained consumers ignore or omit it. Terrazzo emits `loc` by default in v1.0; a future config flag may make this opt-in.

### 2.3 What was removed or renamed from earlier alphas

These changes are landed in this release. Documentation directly describes the v1.0 format; no migration section is published.

- Extension key `"app.terrazzo.listing"` → `"listing"`.
- `$extensions.listing.names` (flat map of platform → name) → `$extensions.listing.platforms` (per-platform object with `name`/`value`/`deprecated`).
- `$extensions.listing.originalValue` → `$extensions.listing.aliasChain`.
- `$extensions.listing.source.resource` (with `<root>` placeholder) → `$extensions.listing.source.$ref` (RFC 6901, no placeholder).
- New: `$extensions.listing.source.via`.
- New: `meta.groups`.
- Plugin config: `resourceRoot` removed; path anchoring is implicit (resolver-relative or cwd-relative).
- `previewValue` typed `string | undefined` (no longer `string | number`).
- `subtype` frozen at 9 values; previously open to future additions.

---

## 3. Plugin runtime and config

### 3.1 Configuration interface

```ts
export interface TokenListingPluginOptions {
  filename?: string;
  modes?: ModeOption[];
  platforms?: Record<string, PlatformOption>;
  sourceOfTruth?: SourceOfTruthOption;
  previewValue?: (params: CustomFunctionParams) => string | number | undefined;
  subtype?: (params: CustomFunctionParams) => Subtype | undefined;
}

export type PlatformOption =
  | string
  | {
      description?: string;
      filter?: string | ((params: CustomFunctionParams) => boolean);
      name?: string | ((params: CustomFunctionParams) => string);
      value?: string | ((params: CustomFunctionParams) => string | undefined);
      deprecated?: string | ((params: CustomFunctionParams) => string | boolean | undefined);
    };
```

`filename` default: `"tokens.listing.json"`. README and integration doc are aligned to this default.

`resourceRoot` is removed from the config and from the doc options table.

### 3.2 Mode resolution

When the parser exposes a non-synthetic resolver:

1. Derive mode entries from `resolver.modifiers`. For each modifier:
   - `name` = modifier key.
   - `values` = `Object.keys(modifier.contexts)`.
   - `default` = `modifier.default` (omitted if absent).
   - `description` = `modifier.description` if present.
2. For each entry in `options.modes`:
   - If `name` is not a key in `resolver.modifiers` → `logger.error` group `plugin`, label `token-listing`. Build aborts.
   - If `values` does not equal the modifier's contexts keys (set equality) → error and abort.
   - If `default` is provided and does not equal the modifier's `default` → error and abort.
   - `description` from config overrides/sets the description on the resolver-derived entry.

When the parser uses a synthetic resolver (no user `resolver.json`):

- Modes come entirely from `options.modes`. No divergence checks. Current behaviour preserved.

### 3.3 Per-platform `name`, `value`, `deprecated`

All three follow the same dispatch:

1. If the platform option is a string (plugin name), or has a string field for that key, look up the value in the plugin's transform meta:
   - `transformed[0].meta?.['token-listing']?.<field>`.
   - Fallback to `<plugin-name-without-@terrazzo/plugin->` for backward-compat with the existing format-name lookup (current behaviour for `name`, extended to `value`/`deprecated`).
2. If the field is a function, call it with `CustomFunctionParams`.
3. Function precedence: a function on the platform option overrides the plugin transform path (current behaviour for `name`, extended to `value`/`deprecated`).

`name` lookup determines whether the token has a per-platform entry at all. If `name` is missing or empty, the platform entry is omitted entirely. `value` and `deprecated` are emitted only if non-`undefined` (and non-empty for `value`).

### 3.4 Source field construction

The plugin reads source location info from the parser. The parser is extended to track:

- A precomputed RFC 6901 pointer for each token's location in its source document. Either:
  - As an additive optional field `pointer?: string` on `TokenNormalized['source']`, or
  - As an internal queryable structure (e.g. `Map<TokenID, SourceInfo>`) reachable from the build context.
- Resolver-membership info for each token: which set or which modifier context brought it in. Either an additive optional field `via?: { kind: 'set' | 'modifier'; setName?: string; modifierName?: string; contextName?: string }` on `TokenNormalized['source']`, or a separate queryable.

Implementation chooses whichever is cleaner. The constraint is **no breaking changes to `TokenNormalized`'s public shape**: any addition is optional, any restructure is internal-only. Existing parser tests must continue passing without modification.

The plugin builds `source.$ref`, `source.via`, and `source.loc` from these pieces:

- `$ref`: combine the source filename (relative to the resolver document or cwd) with the token's pointer.
- `via`: format the membership info into a `#/sets/<name>` or `#/modifiers/<name>/contexts/<context>` pointer. Omitted when no resolver was provided.
- `loc`: passthrough from `token.source.node.loc`.

### 3.5 `aliasChain` reading

Read directly from `token.mode[mode].aliasChain` exposed by the parser. Already present (parser/parse/token.ts:284). Omit when absent or empty.

### 3.6 `previewValue` coercion

Custom function may legally return `string | number | undefined`. The plugin coerces numeric returns via `String(n)` before assigning to `output.previewValue`. The TS type on the plugin's public `previewValue` config remains `string | number | undefined` for caller ergonomics, but the emitted format field is always `string | undefined`.

### 3.7 Bug fixes folded in

- Doc example currently shows `"description"`; corrected to `"$description"` everywhere.
- Doc Sample Config import currently `@terrazzo/plugin-listing`; corrected to `@terrazzo/plugin-token-listing`.
- Doc Sample Config currently uses `defaultValue:` for a mode; corrected to `default:` to match the TS type.
- README currently uses `terrazzo.listing.json`; aligned to `tokens.listing.json` (the code default).
- `package.json` `homepage` field currently `"TBC"`; set to `https://terrazzo.app/docs/integrations/token-listing`.
- `FORMAT_ID` constant in `lib.ts`: kept, value renamed to `'listing'`, used as the single source of truth for the extension key in both the type and the runtime emission.

---

## 4. Tests

The test suite covers per-field behaviour and every error path exercised by the runtime.

### 4.1 Per-field tests

New or updated tests in `test/build.test.ts` cover:

- `platforms[pid]`: presence-as-existence semantics; `name` required when entry exists; `value` from plugin meta; `value` from custom function; `value` omitted when absent; `deprecated` from plugin meta; `deprecated` from custom function; `deprecated: false` preserved; `deprecated: undefined` omits the field.
- `meta.groups`: emitted for groups with `description`; emitted for groups with `deprecated`; group with neither is omitted; cascaded inherited descriptions emitted at the cascaded group's key.
- `aliasChain`: present and ordered for aliased tokens; omitted for non-aliased; correct for mode-specific aliases.
- `source.$ref`: file + pointer for external-file tokens; same-document `#/sets/...` for inline-in-resolver tokens; tokens.json-relative for synthetic-resolver case.
- `source.via`: present with real resolver, absent with synthetic; `#/sets/<name>` for set tokens; `#/modifiers/<name>/contexts/<ctx>` for modifier tokens.
- `source.loc`: present and structurally correct.
- Modes auto-inference: derived correctly from resolver modifiers; description merge from config; identical default+values pass through.
- `previewValue`: string-only; numeric custom returns coerced via `String()`.
- Extension key under per-token `$extensions` is `"listing"`.

### 4.2 Error-path tests

Every `logger.error` exit point in the runtime has a dedicated test:

- `getNameFromPlugin` cannot find the requested format (existing test, kept).
- Mode in config not in resolver modifiers.
- Mode `values` mismatch resolver.
- Mode `default` mismatch resolver.
- Custom `value` function throws — error includes plugin/token context.
- Custom `deprecated` function throws — error includes plugin/token context.

### 4.3 Output determinism

No full-output snapshot test is added. Per-field tests assert specific keys and values rather than entire emitted JSON. Test helpers serialise emitted JSON with sorted keys (deterministic ordering) only when comparing larger sub-trees, so emit-order changes do not churn the assertions.

### 4.4 Existing tests

`test/cli.test.ts` and `test/utils.test.ts` are kept; they continue to cover CLI integration and util helpers. Any test asserting old field names (`names`, `originalValue`, `app.terrazzo.listing`) is updated to the new names.

---

## 5. Documentation

Three doc surfaces inside the repo. The format-spec pages are pre-generated and authored to be portable to a future Token Listing format website with minimal edits.

### 5.1 Guide: `www/src/pages/docs/guides/token-listing.md`

New page. ~400-600 words. Conceptual; no plugin config.

Frontmatter:

```md
---
title: Token Listing
layout: ../../../layouts/docs.astro
---
```

Sections:

- **Why** — the integration problem token listings solve. Each tool reinventing input formats; teams duplicating token data per-tool. List of target tool categories: diff/changelog, QA/review, doc sites, MCP servers, linting plugins, code migration, search indexes.
- **Mental model** — the data the format captures: identity, platform-mapping, modes, source provenance, source-of-truth, aliases. One paragraph per concept.
- **Synthetic example** — small complete listing JSON snippet with prose pointing at what each part is for.
- **Where to go next** — link to integration page; link to format spec pages with `<!-- TODO(format-website): link to spec site -->`.

### 5.2 Integration: `www/src/pages/docs/integrations/token-listing.md`

Rewrite of the existing page.

Frontmatter unchanged.

Sections:

- **Setup** — npm install + minimal config example using v1.0 shape.
- **Configuration reference** — every config option with type, default, behaviour. Drops `resourceRoot`.
- **Per-platform `name`/`value`/`deprecated`** — short subsection on when these populate, plugin-meta path vs custom-function path, override precedence.
- **Resolver integration** — mode auto-inference; config can only enrich descriptions; mismatches error.
- **Custom function reference** — `CustomFunctionParams`, signatures of every callable.
- **Subtype enum** — the 9 frozen values with one-line descriptions and example use-cases.
- **Format reference pointer** — short link to format spec pages with `<!-- TODO(format-website): link to format website -->`.

The "experimental" warning banner is replaced with: *"The Token Listing format is final at v1.0. The reference plugin is in alpha while config ergonomics are confirmed under real use; expect non-breaking config surface changes before `1.0.0` final."*

The three "may evolve" notes (about `source` referencing the Resolver Spec, about `originalValue` becoming `aliasChain`, about `names` becoming `platforms`) are removed; the format describes the resolved decisions directly.

### 5.3 Format spec: `packages/plugin-token-listing/format-spec/`

Pre-generated MD pages with Astro frontmatter. Six pages plus a JSON Schema. The `layout` path is provisional for the future Format website; each page carries a TODO to reassign the layout when migrated.

| File | `title` |
|------|---------|
| `index.md` | "Token Listing Format" |
| `overview.md` | "Overview" |
| `spec.md` | "Specification" |
| `examples.md` | "Examples" |
| `versioning.md` | "Versioning" |
| `glossary.md` | "Glossary" |

Each page's frontmatter:

```md
---
title: <title above>
layout: ../../../layouts/docs.astro
# TODO(format-website): replace layout with the format-website's docs layout
---
```

Page contents:

- **`index.md`** — index page. One-line description of every other page; states the current format version (1) and version policy summary; links to `overview.md`.
- **`overview.md`** — purpose, audience (tool authors, design system teams), design goals (interoperability, format-agnostic, tool-friendly), non-goals (not a DTCG replacement; not a transport format).
- **`spec.md`** — normative field-by-field reference. Top-level (`meta.*`) then per-token (`$extensions.listing.*`). Each field documented with: type, optionality, semantics, example. References RFC 2119 keywords (MUST/MAY/SHOULD).
- **`examples.md`** — full annotated example listings: one minimal, one full-featured (multi-platform, multi-mode, with aliases, with resolver-derived `via`, with group meta).
- **`versioning.md`** — version field is integer; bumps on breaking changes only; the "version 1" baseline. Links the JSON Schema below.
- **`glossary.md`** — set, modifier, context, platform, mode, source-of-truth, alias chain. One paragraph each, cross-linked into `spec.md`.
- **`schema.json`** — JSON Schema (draft 2020-12 or whichever version is consistent with other Terrazzo schemas) describing the format. Not an Astro page; static asset alongside the doc pages. Authored alongside `spec.md` so the two stay aligned.

### 5.4 RFC update comment

`packages/plugin-token-listing/format-spec/rfc-update.md` — copy-paste-ready markdown for the human operator to post to <https://github.com/style-dictionary/style-dictionary/discussions/1479>.

Content includes:

- Header announcing v1.0-alpha.0 of the Token Listing format reference plugin.
- Summary of all changes since the last update on that thread (extension key rename, `names` → `platforms` shape, `originalValue` → `aliasChain`, `source` shape against Resolver Spec, `meta.groups`, frozen `subtype` enum, modes auto-inference, `previewValue` string-only, plugin config simplifications).
- Link to the format spec pages (TODO marker for future website URL).
- Link to the JSON Schema.
- Invitation for feedback.

---

## 6. Release

**Version bump.** `@terrazzo/plugin-token-listing@0.1.0-alpha.1` → `1.0.0-alpha.0`.

**Changeset.** Major bump with a single entry summarising the format-1.0 jump; references the integration doc and format spec for details.

**Post-release work (out of scope here).** After 1–2 weeks of public alpha use without churn, cut `1.0.0` final. The standalone Token Listing format website is built from the pre-generated content in `packages/plugin-token-listing/format-spec/`.

---

## 7. Risks

- **Cross-package parser change.** Any addition to `TokenNormalized['source']` is consumed by every other plugin (CSS, Tailwind, JS, etc.). Mitigation: additive optional fields only, or an internal-only queryable structure exposed via the build context. Implementation runs every package's tests after the parser change.
- **Resolver-membership detection with nested set references.** A set whose `sources` array contains a `$ref` to another file that itself contains tokens must produce membership info that survives resolution. Mitigation: track membership at the right point in the resolver pipeline (likely during normalization), not after flattening.
- **Path-anchoring edge cases.** Tokens loaded from outside the resolver's directory tree produce relative paths with `..` segments. This is correct behaviour but visually noisy. Tests cover both inside-tree and outside-tree cases.

---

## 8. Open implementation choices (deferred to writing-plans)

These do not need to be decided to validate the design. They are listed so the implementation plan addresses them:

- Whether parser additions land as additive `TokenNormalized['source']` fields or an internal queryable structure.
- The exact name and shape of the resolver-membership data passed from parser to plugin.
- The exact JSON Schema dialect (draft version) used for `schema.json`.
- Granularity of changesets (one entry vs split per concern).
- Per-PR or single-PR delivery of the implementation.
