---
title: Examples
layout: ../../../layouts/docs.astro
# TODO(format-website): replace layout with the format-website's docs layout
---

# Examples

Two annotated example listings, from minimal to full-featured.

## Minimal

A single non-aliased color token, no resolver, no modes, no platforms beyond CSS.

```jsonc
{
  "meta": {
    "version": 1,
    "authoringTool": "Terrazzo"
  },
  "data": [
    {
      "$name": "color.brand.500",
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [0.66, 0.20, 0.20],
        "alpha": 1
      },
      "$extensions": {
        "listing": {
          "platforms": {},
          "previewValue": "#a83232",
          "source": {
            "$ref": "tokens.json#/color/brand/500",
            "loc": {
              "start": { "line": 5, "column": 14, "offset": 64 },
              "end":   { "line": 9, "column": 8,  "offset": 134 }
            }
          }
        }
      }
    }
  ]
}
```

Notes:
- `meta.modes`, `meta.platforms`, `meta.groups`, `meta.sourceOfTruth` all omitted — none apply.
- `platforms` under the token is empty: the producer was configured without any platforms, so no per-platform mapping is generated. The token still has identity, value, and source provenance.
- `source.via` is absent: no `resolver.json` was used.

## Full-featured

A multi-platform, multi-mode listing with aliases, group descriptions, modifier-context tokens (with `via`), and source-of-truth declarations.

```jsonc
{
  "meta": {
    "version": 1,
    "authoringTool": "Terrazzo",
    "modes": [
      {
        "name": "theme",
        "values": ["light", "dark"],
        "default": "light",
        "description": "Color theme matching user device preferences"
      },
      {
        "name": "device",
        "values": ["mobile", "desktop"],
        "description": "Device size category"
      }
    ],
    "platforms": {
      "css":   { "description": "Tokens built as CSS variables for the developers" },
      "figma": { "description": "Figma variables curated by the design system team" }
    },
    "groups": {
      "color":            { "description": "All color tokens" },
      "color.brand":      { "description": "Brand-defined palette" },
      "typography.body":  { "description": "Body text styles" },
      "color.legacy":     { "deprecated": "use color.modern instead" }
    },
    "sourceOfTruth": "figma"
  },
  "data": [
    {
      "$name": "color.brand.500",
      "$type": "color",
      "$description": "Brand primary",
      "$value": {
        "colorSpace": "srgb",
        "components": [0.66, 0.20, 0.20],
        "alpha": 1
      },
      "$extensions": {
        "listing": {
          "platforms": {
            "css":   { "name": "--color-brand-500", "value": "#a83232" },
            "figma": { "name": "color/brand/500" }
          },
          "previewValue": "#a83232",
          "source": {
            "$ref": "base/colors.json#/color/brand/500",
            "via":  "#/sets/brand",
            "loc": {
              "start": { "line": 21, "column": 14, "offset": 556 },
              "end":   { "line": 28, "column": 8,  "offset": 770 }
            }
          }
        }
      }
    },
    {
      "$name": "color.semantic.fg",
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [0.66, 0.20, 0.20],
        "alpha": 1
      },
      "$extensions": {
        "listing": {
          "platforms": {
            "css":   { "name": "--color-semantic-fg", "value": "#a83232" }
          },
          "mode": "light",
          "subtype": "fgColor",
          "aliasChain": ["color.brand.500"],
          "previewValue": "#a83232",
          "source": {
            "$ref": "theme/light.json#/color/semantic/fg",
            "via":  "#/modifiers/theme/contexts/light",
            "loc": {
              "start": { "line": 8, "column": 12, "offset": 142 },
              "end":   { "line": 8, "column": 38, "offset": 168 }
            }
          }
        }
      }
    },
    {
      "$name": "color.semantic.fg",
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [1, 1, 1],
        "alpha": 1
      },
      "$extensions": {
        "listing": {
          "platforms": {
            "css":   { "name": "--color-semantic-fg", "value": "#ffffff" }
          },
          "mode": "dark",
          "subtype": "fgColor",
          "aliasChain": ["color.white"],
          "sourceOfTruth": "css",
          "previewValue": "#ffffff",
          "source": {
            "$ref": "theme/dark.json#/color/semantic/fg",
            "via":  "#/modifiers/theme/contexts/dark",
            "loc": {
              "start": { "line": 8, "column": 12, "offset": 142 },
              "end":   { "line": 8, "column": 38, "offset": 168 }
            }
          }
        }
      }
    },
    {
      "$name": "color.legacy.danger",
      "$type": "color",
      "$value": {
        "colorSpace": "srgb",
        "components": [1, 0, 0],
        "alpha": 1
      },
      "$deprecated": "use color.semantic.danger instead",
      "$extensions": {
        "listing": {
          "platforms": {
            "css": {
              "name": "--color-legacy-danger",
              "value": "#ff0000",
              "deprecated": "use --color-semantic-danger instead"
            }
          },
          "previewValue": "#ff0000",
          "source": {
            "$ref": "base/colors.json#/color/legacy/danger",
            "via":  "#/sets/brand",
            "loc": {
              "start": { "line": 32, "column": 14, "offset": 884 },
              "end":   { "line": 39, "column": 8,  "offset": 1012 }
            }
          }
        }
      }
    }
  ]
}
```

Notes:
- The semantic FG token appears twice — once per mode (`light` and `dark`). The `dark` entry overrides the global `sourceOfTruth: "figma"` to declare that the dark variant is dev-curated.
- The CSS plugin contributed both `name` and `value` for tokens it built.
- `aliasChain` is per-mode: the light entry aliases `color.brand.500`; the dark entry aliases `color.white`.
- `meta.groups` describes color, color.brand, typography.body, and color.legacy. Tools can render group headers, mark whole sections deprecated, or surface descriptions in documentation UIs.
- `via` distinguishes set membership (`#/sets/brand`) from modifier-context membership (`#/modifiers/theme/contexts/light`). Consumers can detect modifier tokens by checking for `/modifiers/` in the `via` path.
